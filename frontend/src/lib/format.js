// Display helpers. DIGIPINs are stored as 10 continuous characters and shown 3-4-3 with spaces.
export function formatDigipin(code) {
  const c = String(code || "").toUpperCase();
  return c ? `${c.slice(0, 3)} ${c.slice(3, 7)} ${c.slice(7)}` : "";
}

export function formatDistance(meters) {
  if (meters == null) return "";
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds) {
  if (seconds == null) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${Math.max(mins, 1)} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Seconds since epoch -> "23 h", "1 h 40 min", "5 min" or "expired".
export function timeLeft(expiresAt, nowSeconds = Math.floor(Date.now() / 1000)) {
  const secs = expiresAt - nowSeconds;
  if (secs <= 0) return "expired";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${Math.max(mins, 1)} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h >= 10 || !m ? `${h} h` : `${h} h ${m} min`;
}

export function formatWhen(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", hour12: false,
  });
}

export function formatShareExpiry(expiresAt) {
  if (expiresAt == null) return "No expiry";
  return `Link valid until ${formatWhen(new Date(expiresAt * 1000).toISOString())}`;
}
