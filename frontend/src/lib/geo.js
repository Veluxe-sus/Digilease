// Distance maths for the offline map. Points are {lat, lon}; route lines are [lon, lat] pairs.
const R = 6_371_008.8; // mean Earth radius, metres
const rad = (d) => (d * Math.PI) / 180;
const OFF_ROUTE_METRES = 50;

export function distanceMeters(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function insideBox(p, box) {
  return p.lat >= box.south && p.lat <= box.north && p.lon >= box.west && p.lon <= box.east;
}

// Metres left to the end of the route from the closest point on it, or null when more than 50 m off it.
// ponytail: flat-earth projection around the receiver; fine for city-scale routes, not for 100+ km.
export function alongRoute(p, line) {
  if (!Array.isArray(line) || line.length < 2) return null;
  const kx = R * rad(1) * Math.cos(rad(p.lat));
  const ky = R * rad(1);
  const pts = line.map(([lon, lat]) => [(lon - p.lon) * kx, (lat - p.lat) * ky]);
  const segLen = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));

  let best = { off: Infinity, i: 0, t: 0 };
  for (let i = 0; i < segLen.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const len2 = segLen[i] ** 2;
    const t = len2 ? Math.min(1, Math.max(0, -(ax * (bx - ax) + ay * (by - ay)) / len2)) : 0;
    const off = Math.hypot(ax + t * (bx - ax), ay + t * (by - ay));
    if (off < best.off) best = { off, i, t };
  }
  if (best.off > OFF_ROUTE_METRES) return null;
  return segLen[best.i] * (1 - best.t) + segLen.slice(best.i + 1).reduce((s, d) => s + d, 0);
}
