import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getDigiPin } from "./digipin.js";
import { formatDigipin, formatDistance, formatDuration, formatPrintExpiry, formatShareExpiry, timeLeft } from "./format.js";

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
