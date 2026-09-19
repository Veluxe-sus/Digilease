const test = require("node:test");
const assert = require("node:assert/strict");
const { getDigiPin, getLatLngFromDigiPin } = require("../src/digipin");
const {
  validateCardInput, validateShareInput, validateOrigin, isShareLive, newToken, BadRequest,
} = require("../src/api");

test("official DIGIPIN example encodes as documented", () => {
  assert.equal(getDigiPin(13.11179621, 80.20264269), "4T396F42L7");
});

test("decode lands within ~3 m of the input", () => {
  const { latitude, longitude } = getLatLngFromDigiPin("4T396F42L7");
  const metresPerDegree = 111_320;
  assert.ok(Math.abs(Number(latitude) - 13.11179621) * metresPerDegree < 3);
  assert.ok(Math.abs(Number(longitude) - 80.20264269) * metresPerDegree < 3);
});

test("card input: stores the DIGIPIN and its cell centre", () => {
  const c = validateCardInput({ lat: 13.11179621, lon: 80.20264269, landmark: "  blue gate  " });
  assert.equal(c.digipin, "4T396F42L7");
  assert.equal(c.landmark, "blue gate");
  assert.equal(c.photoType, null);
  assert.equal(getDigiPin(c.lat, c.lon), "4T396F42L7");
});

test("card input: rejects bad locations, long landmarks, bad photo types", () => {
  assert.throws(() => validateCardInput({ lat: 51.5, lon: -0.1 }), BadRequest);
  assert.throws(() => validateCardInput({ lat: "abc", lon: 80 }), BadRequest);
  assert.throws(() => validateCardInput({ lat: 13.1, lon: 80.2, landmark: "x".repeat(201) }), BadRequest);
  assert.throws(() => validateCardInput({ lat: 13.1, lon: 80.2, photoType: "image/gif" }), BadRequest);
  assert.equal(validateCardInput({ lat: 13.1, lon: 80.2, photoType: "image/png" }).photoType, "image/png");
});

test("share input: label and hours limits", () => {
  assert.deepEqual(validateShareInput({ label: " Ambulance ", hours: 24 }), { label: "Ambulance", hours: 24 });
  assert.throws(() => validateShareInput({ label: "", hours: 24 }), BadRequest);
  assert.throws(() => validateShareInput({ label: "x".repeat(41), hours: 24 }), BadRequest);
  assert.throws(() => validateShareInput({ label: "Guest", hours: 0 }), BadRequest);
  assert.throws(() => validateShareInput({ label: "Guest", hours: 169 }), BadRequest);
  assert.throws(() => validateShareInput({ label: "Guest", hours: 1.5 }), BadRequest);
});

test("route origin must be a real coordinate", () => {
  assert.deepEqual(validateOrigin({ fromLat: 12.9, fromLon: 77.6 }), { lat: 12.9, lon: 77.6 });
  assert.throws(() => validateOrigin({ fromLat: 91, fromLon: 0 }), BadRequest);
});

test("a share is live only if not revoked and not expired", () => {
  const now = 1_000_000;
  assert.equal(isShareLive({ revoked: false, expiresAt: now + 1 }, now), true);
  assert.equal(isShareLive({ revoked: true, expiresAt: now + 1 }, now), false);
  assert.equal(isShareLive({ revoked: false, expiresAt: now }, now), false);
  assert.equal(isShareLive(undefined, now), false);
});

test("share tokens are unguessable and URL-safe", () => {
  const t = newToken();
  assert.match(t, /^[A-Za-z0-9_-]{22}$/);
  assert.notEqual(t, newToken());
});
