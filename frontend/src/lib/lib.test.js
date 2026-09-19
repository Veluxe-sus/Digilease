import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getDigiPin } from "./digipin.js";
import { alongRoute, distanceMeters, insideBox } from "./geo.js";
import { formatDigipin, formatDistance, locationError, formatDuration, formatPrintExpiry, formatShareExpiry, timeLeft } from "./format.js";

test("frontend digipin.js is India Post's file plus only the export lines", () => {
  const official = readFileSync(new URL("../../../backend/src/digipin.js", import.meta.url), "utf8");
  const copy = readFileSync(new URL("./digipin.js", import.meta.url), "utf8");
  assert.ok(copy.startsWith(official), "copy must start with the unchanged official file");
  const extra = copy.slice(official.length).trim().split("\n").filter((l) => !l.startsWith("//"));
  assert.deepEqual(extra, ["export { getDigiPin, getLatLngFromDigiPin };"]);
  assert.equal(getDigiPin(13.11179621, 80.20264269), "4T396F42L7");
});

test("DIGIPIN displays as 3-4-3 with spaces, never hyphens", () => {
  assert.equal(formatDigipin("4T396F42L7"), "4T3 96F4 2L7");
  assert.equal(formatDigipin("4t396f42l7"), "4T3 96F4 2L7");
  assert.equal(formatDigipin(""), "");
});

test("distance and duration read naturally", () => {
  assert.equal(formatDistance(650), "650 m");
  assert.equal(formatDistance(10361), "10.4 km");
  assert.equal(formatDuration(240), "4 min");
  assert.equal(formatDuration(1582), "26 min");
  assert.equal(formatDuration(5400), "1 h 30 min");
  assert.equal(formatDistance(null), "");
});

test("time left until a link expires", () => {
  const now = 1_000_000;
  assert.equal(timeLeft(now + 23 * 3600 + 10, now), "23 h");
  assert.equal(timeLeft(now + 100 * 60, now), "1 h 40 min");
  assert.equal(timeLeft(now + 5 * 60, now), "5 min");
  assert.equal(timeLeft(now - 1, now), "expired");
});

test("receiver expiry copy distinguishes permanent and expiring links", () => {
  assert.equal(formatShareExpiry(null), "No expiry");
  assert.match(formatShareExpiry(2_000_000_000), /^Link valid until /);
});

test("print expiry copy includes the year and omits permanent links", () => {
  assert.equal(formatPrintExpiry(null), "");
  assert.match(formatPrintExpiry(2_000_000_000), /^Valid until .*2033, /);
});

const M_PER_DEG = 111_195; // haversine metres per degree of latitude (mean Earth radius)
const north = (lat, m) => lat + m / M_PER_DEG;
const east = (lat, lon, m) => lon + m / (M_PER_DEG * Math.cos((lat * Math.PI) / 180));

test("distance between two points uses the haversine formula", () => {
  assert.ok(Math.abs(distanceMeters({ lat: 13, lon: 80 }, { lat: 14, lon: 80 }) - M_PER_DEG) < 1);
  assert.equal(distanceMeters({ lat: 13.1, lon: 80.2 }, { lat: 13.1, lon: 80.2 }), 0);
  const d = distanceMeters({ lat: 13.1, lon: 80.2 }, { lat: 13.1, lon: east(13.1, 80.2, 240) });
  assert.ok(Math.abs(d - 240) < 0.5, String(d));
});

test("a point is inside the saved square only within its edges", () => {
  const box = { south: 13.1, west: 80.2, north: 13.11, east: 80.21 };
  assert.equal(insideBox({ lat: 13.105, lon: 80.205 }, box), true);
  assert.equal(insideBox({ lat: 13.12, lon: 80.205 }, box), false);
  assert.equal(insideBox({ lat: 13.105, lon: 80.19 }, box), false);
});

test("metres left along a route from the nearest point on it, null when far off it", () => {
  // A straight 1 km route due north, as [lon, lat] pairs, ending at the door.
  const line = [[80.2, 13.1], [80.2, north(13.1, 400)], [80.2, north(13.1, 1000)]];
  const mid = { lat: north(13.1, 500), lon: east(13.1, 80.2, 20) };
  assert.ok(Math.abs(alongRoute(mid, line) - 500) < 1, String(alongRoute(mid, line)));
  assert.ok(Math.abs(alongRoute({ lat: 13.1, lon: 80.2 }, line) - 1000) < 1);
  assert.ok(alongRoute({ lat: north(13.1, 1000), lon: 80.2 }, line) < 1);
  assert.equal(alongRoute({ lat: north(13.1, 500), lon: east(13.1, 80.2, 60) }, line), null);
  assert.equal(alongRoute(mid, [[80.2, 13.1]]), null);
  assert.equal(alongRoute(mid, null), null);
});

test("location errors name the real cause, not always \"blocked\"", () => {
  const tail = "tap the map where your door is";
  assert.match(locationError({ code: 1 }, tail), /^Location is blocked for this site\. .*tap the map where your door is\.$/);
  assert.match(locationError({ code: 2 }, tail), /couldn't find its location/);
  assert.match(locationError({ code: 3 }, tail), /took too long/);
  assert.match(locationError(undefined, tail), /couldn't find its location/);
});
