# PataCard: specification

## Problem
India's 6-digit PIN code only identifies a locality, so addresses run on landmarks ("blue gate, behind the temple"). That costs ambulances, police and delivery riders time.

DIGIPIN (India Post, launched 27 May 2025) gives every ~3.8 m square of India a 10-character code, but three gaps remain:
- people don't know their code
- services don't accept it
- consent-based sharing (India Post's planned DHRUVA) isn't live

A precise code is also a privacy risk if it is shared with no limits.

## Product
An owner turns their location into an **address card**: DIGIPIN, a landmark note and a door photo. They never share the card itself. They share **links**, one per receiver, each with an expiry, and can see who opened each one and revoke it.

## Users
- **Owner** (signs in): a household, a shop, anyone giving out an address.
- **Receiver** (no account): an ambulance crew, a delivery rider, a guest, a courier.

## Features (must have)
1. **Create card:** pin via GPS or drag on the map. The DIGIPIN shows live in 3-4-3 format. Landmark note up to 200 characters, optional door photo (JPEG/PNG, max 5 MB).
2. **My cards:** list of the owner's cards.
3. **Card page:**
   - DIGIPIN, map, landmark, photo
   - share links, each with a name, expiry, status (live / expired / revoked), copy button and QR
   - access log
4. **Create share link:** name (1–40 characters) and lifetime (1–168 hours, whole hours).
5. **Revoke link:** takes effect immediately.
6. **Receiver view** (`/s/{token}`): map pin, DIGIPIN, landmark, photo, "Route from my location". A dead link shows "This address is no longer shared".
7. **Access log:** each receiver view records the time and link name. Nothing about the receiver's identity or location is stored.

**Nice to have** (cut first if late): print layout for the QR card.

## API (HTTP API, JSON)
| Route | Auth | Result |
|---|---|---|
| `POST /cards` `{lat, lon, landmark?, photoType?}` | owner | 201 `{card, upload}`; `upload` is a presigned POST (5 min) when `photoType` is set |
| `GET /cards` | owner | 200 `{cards}` |
| `GET /cards/{id}` | owner | 200 `{card (with photoUrl), shares}`; 404 if not the owner's |
| `POST /cards/{id}/shares` `{label, hours}` | owner | 201 `{share}` |
| `GET /cards/{id}/access` | owner | 200 `{access}`, newest first, up to 50 |
| `DELETE /shares/{token}` | owner | 204; 404 if not the owner's |
| `GET /s/{token}` | public | 200 `{digipin, lat, lon, landmark, photoUrl, label, expiresAt}` and writes an access entry; 410 if dead |
| `POST /s/{token}/route` `{fromLat, fromLon}` | public | 200 `{line, distanceMeters, durationSeconds}`; 410 if dead |

Errors: 400 `{error}` with a plain-language message for bad input; 500 with a generic message (details go to CloudWatch only).

## Data (DynamoDB, on-demand)
- **Cards**: `cardId` (PK) · `ownerSub` (GSI `byOwner`) · `digipin` · `lat`, `lon` (cell centre) · `landmark` · `photoKey` · `createdAt`
- **Shares**: `token` (PK) · `cardId` (GSI `byCard`) · `ownerSub` · `label` · `revoked` · `createdAt` · `expiresAt` (epoch seconds, also the TTL attribute)
- **Access**: `cardId` (PK) · `ts` (SK: ISO time + random suffix) · `openedAt` · `label`
- **S3**: `cards/{cardId}.jpg|png`, private. Read through 5-minute presigned GET URLs.

## Security
- Share tokens: 16 random bytes, base64url (128 bits).
- Owner routes require a Cognito JWT; ownership is checked on every call.
- The server computes and validates the DIGIPIN. Input outside India's DIGIPIN area → 400.
- S3 blocks all public access. Photo size and type are enforced by the presigned POST conditions.
- CORS: only the Amplify domain and `http://localhost:5173`.
- API Gateway throttling: 10 requests/s, burst 20.
- The map API key only allows map tiles, and only from our domains.
- Logs never include coordinates, landmarks or tokens.

## Out of scope
Aadhaar or identity checks, proving the owner lives at the address, editing a card after creation, multiple photos, native apps, other languages, delivery-app integrations.

## Known limits (said honestly in the demo)
- A receiver can screenshot what they saw. Expiry limits future access only.
- Map and route quality depend on the provider's coverage of Indian lanes.
