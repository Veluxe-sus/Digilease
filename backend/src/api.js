// PataCard API — one Lambda behind an API Gateway HTTP API (payload v2).
// Owner routes sit behind the Cognito JWT authorizer; /s/{token} routes are public
// and only work while the share link is neither revoked nor expired.
const { randomBytes, randomUUID } = require("node:crypto");
const { getDigiPin, getLatLngFromDigiPin } = require("./digipin");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GeoRoutesClient, CalculateRoutesCommand } = require("@aws-sdk/client-geo-routes");

const { CARDS_TABLE, SHARES_TABLE, ACCESS_TABLE, PHOTO_BUCKET } = process.env;
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const routes = new GeoRoutesClient({});

const MAX_LANDMARK = 200;
const MAX_LABEL = 40;
const MAX_HOURS = 168;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = { "image/jpeg": "jpg", "image/png": "png" };
const AREA_HALF_METRES = 500;
const METRES_PER_DEGREE = 111_320;
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_MAX_BYTES = 3 * 1024 * 1024;

class BadRequest extends Error {}

// ---------- validation (pure, unit-tested) ----------

function toNumber(value, name) {
  // Number("") is 0; for hours, 0 means "No expiry", so a blank must never slip through as a number.
  if (typeof value === "string" && value.trim() === "") throw new BadRequest(`${name} must be a number`);
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) throw new BadRequest(`${name} must be a number`);
  return n;
}

function validateCardInput(body) {
  const lat = toNumber(body.lat, "lat");
  const lon = toNumber(body.lon, "lon");
  let digipin;
  try {
    digipin = getDigiPin(lat, lon);
  } catch {
    throw new BadRequest("That location is outside India's DIGIPIN area");
  }
  const landmark = typeof body.landmark === "string" ? body.landmark.trim() : "";
  if (landmark.length > MAX_LANDMARK) throw new BadRequest(`Landmark must be ${MAX_LANDMARK} characters or fewer`);
  let photoType = null;
  if (body.photoType != null) {
    if (!PHOTO_TYPES[body.photoType]) throw new BadRequest("Photo must be a JPEG or PNG");
    photoType = body.photoType;
  }
  // Store the DIGIPIN cell centre, so what we share is exactly what the code means.
  const centre = getLatLngFromDigiPin(digipin);
  return { digipin, lat: Number(centre.latitude), lon: Number(centre.longitude), landmark, photoType };
}

function validateShareInput(body) {
  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label) throw new BadRequest("Give the link a name, like \"Ambulance\"");
  if (label.length > MAX_LABEL) throw new BadRequest(`Name must be ${MAX_LABEL} characters or fewer`);
  const hours = toNumber(body.hours, "hours");
  if (!Number.isInteger(hours) || hours < 0 || hours > MAX_HOURS) {
    throw new BadRequest(`Hours must be a whole number from 0 to ${MAX_HOURS}`);
  }
  return { label, hours };
}

function validateOrigin(body) {
  const lat = toNumber(body.fromLat, "fromLat");
  const lon = toNumber(body.fromLon, "fromLon");
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new BadRequest("Your location is not valid");
  return { lat, lon };
}

// Route.Summary is optional in Routes v2; leg overviews are the reliable source.
function summarizeRoute(route) {
  const line = route.Legs.flatMap((leg) => (leg.Geometry && leg.Geometry.LineString) || []);
  let distance = 0;
  let duration = 0;
  let found = false;
  for (const leg of route.Legs) {
    const details = leg.VehicleLegDetails || leg.PedestrianLegDetails || leg.FerryLegDetails;
    const overview = details && details.Summary && details.Summary.Overview;
    if (overview) {
      distance += overview.Distance;
      duration += overview.Duration;
      found = true;
    }
  }
  if (!found && route.Summary) {
    return { line, distanceMeters: route.Summary.Distance ?? null, durationSeconds: route.Summary.Duration ?? null };
  }
  return { line, distanceMeters: found ? distance : null, durationSeconds: found ? duration : null };
}

// The ±500 m square the offline map covers.
function areaBox(lat, lon) {
  const dLat = AREA_HALF_METRES / METRES_PER_DEGREE;
  const dLon = AREA_HALF_METRES / (METRES_PER_DEGREE * Math.cos((lat * Math.PI) / 180));
  return { south: lat - dLat, west: lon - dLon, north: lat + dLat, east: lon + dLon };
}

const round6 = (n) => Math.round(n * 1e6) / 1e6;

// Overpass `out geom` ways → [{name, kind, line: [[lon, lat], ...]}], the same order as route lines.
function toStreets(overpass) {
  return (overpass.elements || [])
    .filter((e) => e.type === "way" && Array.isArray(e.geometry) && e.geometry.length >= 2)
    .map((e) => ({
      name: (e.tags && e.tags.name) || null,
      kind: (e.tags && e.tags.highway) || null,
      line: e.geometry.map((g) => [round6(g.lon), round6(g.lat)]),
    }));
}

function isShareLive(share, nowSeconds) {
  return Boolean(share) && !share.revoked && (share.expiresAt == null || share.expiresAt > nowSeconds);
}

const newToken = () => randomBytes(16).toString("base64url");
const nowSeconds = () => Math.floor(Date.now() / 1000);

// ---------- helpers ----------

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: body === undefined ? "" : JSON.stringify(body),
});

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    throw new BadRequest("Request body must be JSON");
  }
}

async function photoUrl(key) {
  if (!key) return null;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }), { expiresIn: 300 });
}

async function getOwnedCard(cardId, ownerSub) {
  const { Item } = await db.send(new GetCommand({ TableName: CARDS_TABLE, Key: { cardId } }));
  return Item && Item.ownerSub === ownerSub ? Item : null;
}

async function getLiveShare(token) {
  const { Item: share } = await db.send(new GetCommand({ TableName: SHARES_TABLE, Key: { token } }));
  if (!isShareLive(share, nowSeconds())) return null;
  const { Item: card } = await db.send(new GetCommand({ TableName: CARDS_TABLE, Key: { cardId: share.cardId } }));
  return card ? { share, card } : null;
}

const GONE = { error: "This address is no longer shared" };

// ---------- owner routes ----------

async function createCard(event, sub) {
  const input = validateCardInput(parseBody(event));
  const cardId = randomUUID();
  const photoKey = input.photoType ? `cards/${cardId}.${PHOTO_TYPES[input.photoType]}` : null;
  const card = {
    cardId, ownerSub: sub, digipin: input.digipin, lat: input.lat, lon: input.lon,
    landmark: input.landmark, photoKey, createdAt: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: CARDS_TABLE, Item: card }));
  let upload = null;
  if (photoKey) {
    upload = await createPresignedPost(s3, {
      Bucket: PHOTO_BUCKET,
      Key: photoKey,
      Conditions: [["content-length-range", 1, MAX_PHOTO_BYTES], ["eq", "$Content-Type", input.photoType]],
      Fields: { "Content-Type": input.photoType },
      Expires: 300,
    });
  }
  return json(201, { card, upload });
}

async function listCards(sub) {
  const { Items } = await db.send(new QueryCommand({
    TableName: CARDS_TABLE, IndexName: "byOwner",
    KeyConditionExpression: "ownerSub = :s", ExpressionAttributeValues: { ":s": sub },
  }));
  return json(200, { cards: Items || [] });
}

async function getCard(cardId, sub) {
  const card = await getOwnedCard(cardId, sub);
  if (!card) return json(404, { error: "Card not found" });
  const { Items } = await db.send(new QueryCommand({
    TableName: SHARES_TABLE, IndexName: "byCard",
    KeyConditionExpression: "cardId = :c", ExpressionAttributeValues: { ":c": cardId },
  }));
  const now = nowSeconds();
  const shares = (Items || []).map((s) => ({
    token: s.token, label: s.label, createdAt: s.createdAt, expiresAt: s.expiresAt ?? null,
    status: s.revoked ? "revoked" : isShareLive(s, now) ? "live" : "expired",
  }));
  return json(200, { card: { ...card, photoUrl: await photoUrl(card.photoKey) }, shares });
}

async function createShare(event, cardId, sub) {
  const card = await getOwnedCard(cardId, sub);
  if (!card) return json(404, { error: "Card not found" });
  const { label, hours } = validateShareInput(parseBody(event));
  const share = {
    token: newToken(), cardId, ownerSub: sub, label, revoked: false,
    createdAt: new Date().toISOString(), ...(hours ? { expiresAt: nowSeconds() + hours * 3600 } : {}),
  };
  await db.send(new PutCommand({ TableName: SHARES_TABLE, Item: share }));
  return json(201, { share: { token: share.token, label, expiresAt: share.expiresAt ?? null, status: "live" } });
}

async function revokeShare(token, sub) {
  const { Item } = await db.send(new GetCommand({ TableName: SHARES_TABLE, Key: { token } }));
  if (!Item || Item.ownerSub !== sub) return json(404, { error: "Link not found" });
  await db.send(new UpdateCommand({
    TableName: SHARES_TABLE, Key: { token },
    UpdateExpression: "SET revoked = :t", ExpressionAttributeValues: { ":t": true },
  }));
  return json(204);
}

async function listAccess(cardId, sub) {
  const card = await getOwnedCard(cardId, sub);
  if (!card) return json(404, { error: "Card not found" });
  const { Items } = await db.send(new QueryCommand({
    TableName: ACCESS_TABLE, KeyConditionExpression: "cardId = :c",
    ExpressionAttributeValues: { ":c": cardId }, ScanIndexForward: false, Limit: 50,
  }));
  return json(200, { access: (Items || []).map(({ openedAt, label }) => ({ openedAt, label })) });
}

// ---------- public (receiver) routes ----------

async function viewShare(token) {
  const found = await getLiveShare(token);
  if (!found) return json(410, GONE);
  const { share, card } = found;
  const openedAt = new Date().toISOString();
  await db.send(new PutCommand({
    TableName: ACCESS_TABLE,
    Item: { cardId: card.cardId, ts: `${openedAt}#${randomBytes(4).toString("hex")}`, openedAt, label: share.label },
  }));
  return json(200, {
    digipin: card.digipin, lat: card.lat, lon: card.lon, landmark: card.landmark,
    photoUrl: await photoUrl(card.photoKey), label: share.label, expiresAt: share.expiresAt ?? null,
  });
}

async function routeToShare(event, token) {
  const found = await getLiveShare(token);
  if (!found) return json(410, GONE);
  const from = validateOrigin(parseBody(event));
  const { card } = found;
  const res = await routes.send(new CalculateRoutesCommand({
    Origin: [from.lon, from.lat],
    Destination: [card.lon, card.lat],
    TravelMode: "Car",
    LegGeometryFormat: "Simple",
    LegAdditionalFeatures: ["Summary"],
  }));
  const route = res.Routes && res.Routes[0];
  if (!route) return json(404, { error: "No route found to this address" });
  return json(200, summarizeRoute(route));
}

class AreaUnavailable extends Error {}

// Overpass policy: after an error, wait 30 s before asking again.
// ponytail: per Lambda instance, not global; enough at one fetch per card.
const OVERPASS_PAUSE_MS = 30_000;
let overpassPausedUntil = 0;

async function fetchStreets(box) {
  if (Date.now() < overpassPausedUntil) throw new AreaUnavailable("Overpass paused after a recent failure");
  try {
    return await queryOverpass(box);
  } catch (err) {
    overpassPausedUntil = Date.now() + OVERPASS_PAUSE_MS;
    throw err;
  }
}

async function queryOverpass(box) {
  const query = `[out:json][timeout:15];way["highway"](${box.south},${box.west},${box.north},${box.east});out geom;`;
  let res;
  try {
    res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "PataCard (hackathon)" },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(15_000), // the public server is slow at times; the Lambda allows 20 s
    });
  } catch (err) {
    throw new AreaUnavailable(`Overpass fetch failed: ${err.name}`);
  }
  if (!res.ok) throw new AreaUnavailable(`Overpass status ${res.status}`);
  if (Number(res.headers.get("content-length")) > OVERPASS_MAX_BYTES) throw new AreaUnavailable("Overpass response too large");
  let text;
  try {
    text = await res.text();
  } catch (err) {
    throw new AreaUnavailable(`Overpass read failed: ${err.name}`);
  }
  if (Buffer.byteLength(text) > OVERPASS_MAX_BYTES) throw new AreaUnavailable("Overpass response too large");
  try {
    return toStreets(JSON.parse(text));
  } catch {
    throw new AreaUnavailable("Overpass response was not JSON");
  }
}

// Street data for the offline map. Fetched from OpenStreetMap once per card, then served from S3.
// No access entry: the view that loads it already logged one.
async function areaForShare(token) {
  const found = await getLiveShare(token);
  if (!found) return json(410, GONE);
  const { card } = found;
  const Key = `areas/${card.cardId}.json`;
  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: PHOTO_BUCKET, Key }));
    return json(200, JSON.parse(await obj.Body.transformToString()));
  } catch (err) {
    if (err.name !== "NoSuchKey") throw err;
  }
  const box = areaBox(card.lat, card.lon);
  let area;
  try {
    area = { box, streets: await fetchStreets(box) };
  } catch (err) {
    if (!(err instanceof AreaUnavailable)) throw err;
    console.error("area unavailable", err.message);
    return json(503, { error: "Street map not available right now" });
  }
  await s3.send(new PutObjectCommand({
    Bucket: PHOTO_BUCKET, Key, Body: JSON.stringify(area), ContentType: "application/json",
  }));
  return json(200, area);
}

// ---------- router ----------

async function handler(event) {
  const p = event.pathParameters || {};
  const sub = event.requestContext?.authorizer?.jwt?.claims?.sub;
  // Defence in depth: API Gateway's JWT authorizer guards owner routes, but never act without an owner.
  const isPublic = ["GET /s/{token}", "POST /s/{token}/route", "GET /s/{token}/area"].includes(event.routeKey);
  if (!isPublic && !sub) return json(401, { error: "Sign in to manage your address cards" });
  try {
    switch (event.routeKey) {
      case "POST /cards": return await createCard(event, sub);
      case "GET /cards": return await listCards(sub);
      case "GET /cards/{id}": return await getCard(p.id, sub);
      case "POST /cards/{id}/shares": return await createShare(event, p.id, sub);
      case "GET /cards/{id}/access": return await listAccess(p.id, sub);
      case "DELETE /shares/{token}": return await revokeShare(p.token, sub);
      case "GET /s/{token}": return await viewShare(p.token);
      case "POST /s/{token}/route": return await routeToShare(event, p.token);
      case "GET /s/{token}/area": return await areaForShare(p.token);
      default: return json(404, { error: "Not found" });
    }
  } catch (err) {
    if (err instanceof BadRequest) return json(400, { error: err.message });
    console.error("request failed", event.routeKey, err.name, err.message);
    return json(500, { error: "Something went wrong. Try again in a moment." });
  }
}

module.exports = {
  handler, validateCardInput, validateShareInput, validateOrigin, isShareLive, newToken, summarizeRoute, BadRequest,
  areaBox, toStreets, fetchStreets,
};
