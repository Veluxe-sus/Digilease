# PataCard: specification

## Problem
India's 6-digit PIN code only identifies a locality, so addresses run on landmarks ("blue gate, behind the temple"). That costs ambulances, police, delivery riders and guests time.

DIGIPIN (India Post, launched 27 May 2025) gives every ~3.8 m square of India a 10-character code, but three gaps remain:
- people don't know their code
- services don't accept it
- consent-based sharing (India Post's planned DHRUVA) isn't live

A precise code is also a privacy risk if it is shared with no limits.

The last kilometre is where people get lost, and it is often where the mobile signal drops: lanes, villages, farmhouses, basements.

## Product
An owner turns their location into an **address card**: DIGIPIN, a landmark note and a door photo. They never share the card itself. They share **links**, one per receiver, each with an expiry (or none), and can see who opened each one and revoke it. A link can be printed as a **QR card** for a door, an invite or a shop counter.

When a receiver opens a link with internet, their phone quietly saves the **last-kilometre map**: the streets in a 1 km × 1 km square around the door, the route line and the door photo. If the signal drops near the destination, the page still shows the map, where they are (as a DIGIPIN) and how far the door is.

Pitch: *share once, found always.*

## Users
- **Owner** (signs in): a household, a shop, a wedding host, anyone giving out an address.
- **Receiver** (no account): an ambulance crew, a delivery rider, a guest, a customer.

## Features (must have)
1. **Create card:** pin via GPS or drag on the map. The DIGIPIN shows live in 3-4-3 format. Landmark note up to 200 characters, optional door photo (JPEG/PNG, max 5 MB).
2. **My cards:** list of the owner's cards.
3. **Card page:**
   - DIGIPIN, map, landmark, photo
   - share links, each with a name, expiry, status (live / expired / revoked), copy button, QR and "Print card"
   - access log
4. **Create share link:** name (1–40 characters) and lifetime: 1–168 whole hours, or **No expiry**. The form says: "Receivers can keep an offline copy until the link expires."
5. **Revoke link:** takes effect immediately online (see Known limits for offline copies).
6. **Receiver view** (`/s/{token}`): map pin, DIGIPIN, landmark, photo, "Route from my location", "Open in maps" fallback. A dead link shows "This address is no longer shared".
7. **Access log:** each receiver view records the time and link name. Nothing about the receiver's identity or location is stored.
8. **Printable QR card** (`/card/:id/print/:token`, owner only): one card sized for A6, showing a large QR of the link, the DIGIPIN (3-4-3), landmark, door photo, "Scan to find the door", and "Valid until <date>" when the link expires. "Print / Save as PDF" uses the browser's print dialog. Only live links can be printed.
9. **Last-km offline map** (receiver view), detailed below.

**Stretch** (only if everything else is done): offline re-route. The phone works out a path along the saved streets from where the receiver is to the door, with no internet.

## Last-km offline map
**What gets saved, and when.** When `/s/{token}` loads online, the page saves to the phone's browser storage (Cache Storage):
- the card data from `GET /s/{token}`
- the door photo (the image itself, since its URL expires in 5 minutes)
- the street data from `GET /s/{token}/area`
- the route line, once the receiver taps "Route from my location"
- the page's own files, so `/s/{token}` opens with no network

A chip shows "Saved for offline" when the card, area and page files are stored. The photo and route are saved if present.

**Area.** A square of ±500 m around the card's cell centre (about 1 km × 1 km). Streets come from OpenStreetMap (every way with a `highway` tag), fetched by the Lambda from the Overpass API on the first `GET /s/{token}/area` for that card. They are stored in S3 and served from there after that.

**Offline view.** Shown automatically when the page can't reach the API, and through a "Preview offline map" link for testing and the demo:
- a plain map drawn on the phone: streets as lines, the 1 km square outline, the saved route line, a door marker and a blue "you" dot (no map tiles and no internet needed)
- "You: `XXX XXXX XXX`" (the phone's GPS position turned into a DIGIPIN on the phone) and "Door: `4T3 96F4 2L7`"
- the distance between the two codes' cell centres (straight line), and "about N m along the route" when a route is saved and the receiver is within 50 m of it
- outside the square: "You're outside the saved area. The door is N km away."
- "Streets © OpenStreetMap contributors"

**How long a copy lives.** The page ignores and deletes a saved copy once `expiresAt` has passed (by the phone's clock). When online, a 410 from `GET /s/{token}` deletes the saved copy at once.

## API (HTTP API, JSON)
| Route | Auth | Result |
|---|---|---|
| `POST /cards` `{lat, lon, landmark?, photoType?}` | owner | 201 `{card, upload}`; `upload` is a presigned POST (5 min) when `photoType` is set |
| `GET /cards` | owner | 200 `{cards}` |
| `GET /cards/{id}` | owner | 200 `{card (with photoUrl), shares}`; 404 if not the owner's |
| `POST /cards/{id}/shares` `{label, hours}` | owner | 201 `{share}`. `hours` is 1–168, or 0 for no expiry |
| `GET /cards/{id}/access` | owner | 200 `{access}`, newest first, up to 50 |
| `DELETE /shares/{token}` | owner | 204; 404 if not the owner's |
| `GET /s/{token}` | public | 200 `{digipin, lat, lon, landmark, photoUrl, label, expiresAt}` (`expiresAt` is null for no expiry) and writes an access entry; 410 if dead |
| `POST /s/{token}/route` `{fromLat, fromLon}` | public | 200 `{line, distanceMeters, durationSeconds}`; 410 if dead |
| `GET /s/{token}/area` | public | 200 `{box: {south, west, north, east}, streets: [{name, kind, line: [[lon, lat], …]}], attribution}`; 410 if dead; 503 `{error}` if street data can't be fetched. Writes no access entry |

Errors: 400 `{error}` with a plain-language message for bad input; 500 with a generic message (details go to CloudWatch only).

## Data (DynamoDB, on-demand)
- **Cards**: `cardId` (PK) · `ownerSub` (GSI `byOwner`) · `digipin` · `lat`, `lon` (cell centre) · `landmark` · `photoKey` · `createdAt`
- **Shares**: `token` (PK) · `cardId` (GSI `byCard`) · `ownerSub` · `label` · `revoked` · `createdAt` · `expiresAt` (epoch seconds, also the TTL attribute; **absent means no expiry**)
- **Access**: `cardId` (PK) · `ts` (SK: ISO time + random suffix) · `openedAt` · `label`
- **S3** (private):
  - `cards/{cardId}.jpg|png`, read through 5-minute presigned GET URLs
  - `areas/{cardId}.json`, the street data for that card's square, read only by the Lambda

## Security
- Share tokens: 16 random bytes, base64url (128 bits).
- Owner routes require a Cognito JWT; ownership is checked on every call.
- The server computes and validates the DIGIPIN. Input outside India's DIGIPIN area → 400. The receiver's own DIGIPIN is computed on their phone for display only and is never sent.
- A share is live when it is not revoked and `expiresAt` is absent or in the future. Checked in code on every public route.
- S3 blocks all public access. Photo size and type are enforced by the presigned POST conditions.
- The Lambda's only outside call is the Overpass API: 8-second timeout, responses over 3 MB rejected, a `User-Agent` naming the app. At most one fetch per card; after that, S3 serves it. After a failed call, the Lambda waits 30 s before calling Overpass again (its usage policy).
- CORS: only the Amplify domain and `http://localhost:5173`.
- API Gateway throttling: 10 requests/s, burst 20.
- The map API key only allows map tiles, and only from our domains.
- Logs never include coordinates, landmarks or tokens.

## Decisions
- **Offline streets come from OpenStreetMap, not Amazon Location.** Amazon's documents we checked (FAQ, developer guide) say nothing clear about storing their map on a phone for offline use, so we don't. OpenStreetMap's licence (ODbL) allows storing and reuse with the credit line "© OpenStreetMap contributors". The online map stays on Amazon Location Service.
- **No phone numbers on the receiver page.** "No numbers exchanged" is part of the pitch.

## Out of scope
Aadhaar or identity checks, proving the owner lives at the address, editing a card after creation, multiple photos, native apps, other languages, delivery-app integrations, offline areas larger than 1 km, street names on the offline map, turn-by-turn directions.

## Known limits (said honestly in the demo)
- A receiver can screenshot what they saw. Expiry limits future access only.
- **An offline copy outlives a revoke until the receiver next goes online** (or the link expires). No-expiry links keep their offline copy until then.
- The receiver must open the link once with internet. The QR only holds the link, not the map.
- The saved route starts where the receiver first asked for it. Coming in from another side, the line won't match their way in (the stretch re-route fixes this).
- OpenStreetMap can miss small lanes in Indian towns and villages. Map and route quality depend on the providers' coverage.
- Without mobile data, a phone's first GPS fix can take 30–60 seconds.
- Storage can be cleared by the browser (for example Safari after 7 days of no use).
