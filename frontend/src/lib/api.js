// Thin fetch wrapper for the PataCard API. Owner calls carry the Cognito ID token
// (the HTTP API's JWT authorizer checks its audience, which only the ID token has).
import { fetchAuthSession } from "aws-amplify/auth";

const BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) {
    const token = (await fetchAuthSession()).tokens?.idToken?.toString();
    if (!token) throw new ApiError(401, "Please sign in again.");
    headers.authorization = token;
  }
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  let res;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError(0, "Can't reach PataCard. Check your connection and try again.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || data.message || "Something went wrong. Try again.");
  return data;
}

const enc = encodeURIComponent;

export const api = {
  listCards: () => request("/cards"),
  createCard: (card) => request("/cards", { method: "POST", body: card }),
  getCard: (id) => request(`/cards/${enc(id)}`),
  createShare: (id, share) => request(`/cards/${enc(id)}/shares`, { method: "POST", body: share }),
  listAccess: (id) => request(`/cards/${enc(id)}/access`),
  revokeShare: (token) => request(`/shares/${enc(token)}`, { method: "DELETE" }),
  viewShare: (token) => request(`/s/${enc(token)}`, { auth: false }),
  route: (token, from) => request(`/s/${enc(token)}/route`, { method: "POST", body: from, auth: false }),
};

// Upload a door photo with the presigned POST returned by createCard.
export async function uploadPhoto(upload, file) {
  const form = new FormData();
  for (const [k, v] of Object.entries(upload.fields)) form.append(k, v);
  form.append("file", file);
  const res = await fetch(upload.url, { method: "POST", body: form });
  if (!res.ok) throw new ApiError(res.status, "The photo didn't upload. Your card is saved without it.");
}
