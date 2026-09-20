# DigiLease: build plan

Tasks run in order. Each ends with a check. **(You)** marks steps the user runs. After each task, rewrite `.claude/CHECKPOINT.md` and commit.

## Tools

Skill names are Claude Code skills (plugin names in brackets). MCP servers are what the Claude Code setup had connected. Another agent without them uses the **fallback**, which does the same job by hand.

### Skills
| Skill | Used in | What it does here | Fallback without it |
|---|---|---|---|
| `superpowers:executing-plans` | every task | Run this plan task by task with checks | Follow this file in order; tick tasks in CHECKPOINT |
| `superpowers:systematic-debugging` | any failure | Find the root cause before changing code | Reproduce → read the error → one hypothesis → one fix → re-run |
| `superpowers:test-driven-development` | Tasks 1, 4, 7, 8 | Write the failing test first for new logic | Add a `node:test` case before the code it checks |
| `frontend-design` | Tasks 5, 10 | Layout and visual design for the product UI | Clean, mobile-first, accessible layout; one accent colour; no templates |
| `security-review` | Task 10 | Review the public routes, tokens, CORS, IAM, S3 and the Overpass call | Manually check SPEC "Security" line by line |
| `code-review` | Task 10 | Correctness review of the full diff | Read the diff for bugs against SPEC |
| `superpowers:verification-before-completion` | end of each task | No "done" without evidence | Paste test, build or curl output before claiming done |
| `superpowers:finishing-a-development-branch` | Task 11 | Final checks and wrap-up | Tests + build pass, commit, tag `v1-submission` |
| `run` | Tasks 5–9 | Launch the app and see the change working | `npm run dev`, open http://localhost:5173 |

### MCP servers
| MCP | Used in | For | Fallback without it |
|---|---|---|---|
| `context7` | Tasks 2, 4–8 | Current docs: AWS SAM, SDK v3 (`client-geo-routes`, `lib-dynamodb`, `s3-presigned-post`), Amazon Location, MapLibre GL, Amplify v6 Auth, Service Worker and Cache Storage (MDN) | Official docs sites: docs.aws.amazon.com, maplibre.org, docs.amplify.aws, developer.mozilla.org, wiki.openstreetmap.org (Overpass API) |
| `playwright` | Tasks 6–9 | Scripted browser run of create → share → view → revoke, and offline mode (`context.setOffline(true)`) | Do the flow by hand in two browser windows; DevTools "Offline" throttling |
| `chrome-devtools` | Tasks 5–10 | Console and network errors, mobile emulation, Lighthouse accessibility check | Browser DevTools by hand |
| `stitch` | Mockups step | Generate the new screens in the existing Stitch project "DigiLease" (id 2246405162473946986) | Skip the mockups and build from `docs/DESIGN.md` §8 text |

## Remaining work: order and time budget (written 2026-09-19, about 13:00 IST)
Tasks 0–4 are done and Task 5 is written. What's left, in order:

| Step | Budget | Aim to finish by (IST) |
|---|---|---|
| Cleanup + Task 5 checks | 30 min | Sep 19, 14:00 |
| Mockups (optional) | 30 min | Sep 19, 14:30 |
| Task 6 receiver view | 1.5 h | Sep 19, 16:00 |
| Task 7 no-expiry links + print card | 1 h | Sep 19, 17:00 |
| Task 8 last-km offline map | 4–5 h | Sep 19, 22:00 |
| Task 9 go live | 1 h | Sep 20, 11:00 |
| Task 10 review and polish | 1.5 h | Sep 20, 13:00 |
| Task 11 demo video | 1 h | Sep 20, 16:00 |
| Task 12 stretch | 2 h | only if everything above is done |

**Hard rule:** if the app is not live by **Sep 20, 12:00 IST**, stop feature work, cut from "If time runs short" below and do Task 9. Submission is due by **Sep 20, 18:00 IST**.

**Cleanup (first thing):** `backend/` has 4 empty files committed by a bad shell command: `(leg.Geometry`, `({`, `now`, `{,`. Remove them with `git rm` and commit ("Remove stray empty files").

**For Codex and other agents:**
- `AGENTS.md` is the rules file. Skill names in this plan are Claude Code skills; use the fallback column.
- If your sandbox has no network or AWS access, don't work around it. Print the exact command (`sam build`, `sam deploy`, `npm install`, `scripts/smoke.sh`) for the user to run, then read their output.

## Mockups (optional, before Task 6; about 30 minutes)
Only with the `stitch` MCP. Use the existing project and its design system. Generate one screen per prompt, check it against `docs/DESIGN.md` §8 and the "Mockup content to NOT ship" list in Task 5, then download each PNG into `docs/mockups/` under the name given.

| File | Device | Prompt |
|---|---|---|
| `s5-receiver.png` | phone | Receiver page of DigiLease for a shared address link. Top bar with the DigiLease wordmark and a green "Saved for offline" pill. Map filling half the screen with a red teardrop pin and a blue route line. Below: "SHARED WITH YOU · Ravi (guest)", the DIGIPIN code plate 4T3 96F4 2L7 in bold monospace with a red border, landmark "Blue gate, behind Hanuman temple", a 4:3 door photo, "Link valid until 21 Sep, 18:00" in monospace. Sticky bottom bar: summary "2.4 km · 9 min", a red primary button "Update route", and a text button "Open in maps". |
| `s6-offline.png` | phone | The same receiver page with no internet. A dark navy banner at the top: "No internet. Showing your saved map." A plain light map with only grey street lines, a dashed square outline, a blue route line, a red door pin and a blue "you" dot with a white ring. A white bottom sheet: "240 m to the door" large, "straight line" small, "about 310 m along the route". Two small monospace code plates side by side: "YOU 4T3 96F3 KK1" with a blue border and "DOOR 4T3 96F4 2L7" with a red border. A small door photo thumbnail and "Streets © OpenStreetMap contributors". |
| `s7-print.png` | phone | Print preview screen. Top bar "Print card" with a back arrow. A white A6 postcard on a light grey page: small "DigiLease" wordmark and "For: Wedding guests"; a door photo; a large QR code with "Scan to find the door" and "Open it once with internet. Near us it keeps working without signal."; the DIGIPIN plate 4T3 96F4 2L7; landmark text; "DIGIPIN by India Post". A red primary button "Print / Save as PDF". |
| `s8-links.png` | phone | Address card page, links section. Segmented chips "2 h", "24 h", "72 h", "No expiry" (selected), "Custom" and a name field "Wedding guests". Helper text "Receivers can keep an offline copy until the link expires." A list of link rows separated by hairlines: "Wedding guests" with a green Live pill and "No expiry" in monospace; "Flipkart delivery" Live, "expires in 23 h"; "Courier" grey Revoked with strikethrough. Each live row has copy, QR, printer and revoke icons. |
| `d4-receiver.png` | laptop, 1440px | The receiver page (from `s5-receiver.png`) in the two-pane laptop layout of `d3-receiver.png`: map on the left 60%, the details and the route button in a white right panel. |

- **Check:** the PNGs are in `docs/mockups/` and nothing from the "do not ship" list appears in the built UI. Commit ("Mockups for receiver, offline map, print card").

Not used: paid or credit-consuming tools (image generation, Canva, Adobe, 21st, firecrawl). claude-mem is not used either: its memory doesn't travel with the repo, and these files do.

## Task 0: Setup (You, about 30 minutes). Full commands in `docs/SETUP.md` §1
- Install AWS CLI and SAM CLI; run `aws configure` with an IAM user key (not root); region `ap-south-1`.
- Create a $5 monthly budget alarm; check that credits cover Location Service.
- Discord: does Location Service count? What is the deadline time?
- **Check:** `aws sts get-caller-identity` shows the right account; `sam --version` works.

## Task 1: Review and test the existing backend (about 20 minutes)
Files: `backend/src/api.js`, `backend/test/api.test.js`, `backend/package.json`
- The user reads `api.js` against SPEC.md (routes, limits, messages).
- `cd backend && npm install && npm test`
- **Check:** all 8 tests pass. Any mismatch with SPEC gets fixed in code, not in the spec, unless the user decides otherwise.

## Task 2: Infrastructure template (about 1 hour)
File: `template.yaml`
- **Parameters:** `AllowedOrigin` (default `http://localhost:5173`).
- **Cognito:** a UserPool (email sign-in, email auto-verified, password of 8+ characters) and a UserPoolClient (no secret; SRP and refresh-token auth).
- **HttpApi:**
  - JWT authorizer as the default: issuer `https://cognito-idp.${AWS::Region}.amazonaws.com/${UserPool}`, audience = the client ID.
  - Public routes `GET /s/{token}` and `POST /s/{token}/route` set `Authorizer: NONE`.
  - CORS allows origins `AllowedOrigin` and localhost; headers `authorization`, `content-type`; methods GET, POST, DELETE, OPTIONS.
  - Throttling: 10 requests/s, burst 20.
- **Function:**
  - `nodejs22.x`, arm64, 256 MB, 10 s timeout; env vars for the 3 table names and the bucket.
  - Policies: `DynamoDBCrudPolicy` on each table, `S3CrudPolicy` on the bucket, and `geo-routes:CalculateRoutes` on `arn:aws:geo-routes:${AWS::Region}::provider/default`.
  - Log group with 7-day retention.
- **Tables:** 3 DynamoDB tables as in SPEC. Shares has TTL on `expiresAt`. All on-demand billing.
- **S3 bucket:** all public access blocked; CORS allows POST and GET from `AllowedOrigin` and localhost.
- **Map API key:** `AWS::Location::APIKey`.
  - Allowed actions: `geo-maps:GetTile`, `geo-maps:GetStaticMap`.
  - Allowed resource: `arn:aws:geo-maps:${AWS::Region}::provider/default`.
  - Allowed referers: `AllowedOrigin/*` and `http://localhost:5173/*`.
  - No expiry.
- **Outputs:** ApiUrl, UserPoolId, UserPoolClientId, MapKeyName, PhotoBucket, Region.
- **Check:**
  - `sam validate --lint` passes.
  - **(You)** `sam build && sam deploy --guided` (SETUP §2).
  - `curl <ApiUrl>/cards` → 401.
  - `curl <ApiUrl>/s/nope` → 410.

## Task 3: API smoke test on AWS (about 20 minutes)
- **(You)** create a test user through the frontend once Task 4 is done, or with `aws cognito-idp sign-up` (SETUP §3) and get an ID token.
- curl through the whole flow:
  1. create card → correct DIGIPIN
  2. share → token
  3. `GET /s/{token}` → 200, and an Access item appears in DynamoDB
  4. revoke → `GET /s/{token}` → 410
  5. route → a line with distance
- **Check:** every step returns the expected status. The results go in CHECKPOINT.

## Task 4: Frontend skeleton and login (about 1 hour)
Files: `frontend/` (Vite React JS)
- Dependencies: `react-router-dom`, `maplibre-gl`, `aws-amplify`, `@aws-amplify/ui-react`, `qrcode`.
- `frontend/src/lib/digipin.js`: the verbatim copy of the official file plus one line: `export { getDigiPin, getLatLngFromDigiPin };`
- `frontend/src/lib/format.js`: `formatDigipin("4T396F42L7")` → `"4T3 96F4 2L7"`.
- `frontend/src/lib/api.js`: a `fetch` wrapper that adds the Cognito ID token on owner calls and turns error JSON into messages.
- `frontend/src/main.jsx`: `Amplify.configure` from `VITE_*` env vars; routes `/`, `/new`, `/cards`, `/card/:id`, `/s/:token`.
- `frontend/.env.example`: variable names only. Real values go in `.env.local` (gitignored).
- Backend test added: the frontend `digipin.js` equals the backend file plus that one export line.
- **Check:** `npm run dev`; you sign up, verify your email, sign in, and land on `/cards`.

## Task 5: Owner flow (about 2.5 hours)
Files: `frontend/src/components/MapView.jsx`, `frontend/src/pages/NewCard.jsx`, `MyCards.jsx`, `CardView.jsx`
- **MapView:** MapLibre with the style `https://maps.geo.${region}.amazonaws.com/v2/styles/Standard/descriptor?key=${key}&political-view=IND`; draggable marker; "Use my location" (browser geolocation).
- **NewCard:**
  - live DIGIPIN (3-4-3) as the pin moves, via the frontend `digipin.js`
  - landmark field with a counter
  - photo picker that checks type and size before upload
  - on submit: `POST /cards`, then the presigned POST upload, then go to the card page
- **MyCards:** list with DIGIPIN and landmark.
- **CardView:**
  - card details and photo
  - "New link" form (name + hours presets 2 / 24 / 72 / custom)
  - links list with status pill, copy, QR (`qrcode` → canvas) and revoke
  - access log
- Follow `docs/DESIGN.md` (colours, type, components) and match `docs/mockups/` (Stitch project "DigiLease", id 2246405162473946986). Then one pass with the `frontend-design` skill, not a redesign loop.
- Mockups: phone `s1-s4`, laptop `d1-d3` (two-pane, 1024px and wider; see DESIGN.md §5).
- Mockup content to NOT ship. It is either false or out of scope:
  - False verification or privacy claims: "Verified property coordinates", "GEO-VERIFIED", "Govt. Verified Portal Unit", "Zero persisted (GPS) coordinates", "Privacy protected under India Post guidelines", "India Post National Digital Postal Index Grid coordinate".
  - A 10 MB upload limit (ours is 5 MB).
  - Extra form fields: "Floor / Level", "Entry gate". Not in SPEC.
  - Phone-number accounts ("+91 98450"): we sign in with email through Cognito.
  - Traffic or road claims: "Congestion free", "25 m vehicular limit". We have no such data.
  - A fake GPS accuracy chip, unless it shows the real browser accuracy value.
- **Check:** create a card with a photo; create 2 links; revoke one; the list shows the right statuses.

## Task 6: Receiver view and route (about 1.5 hours)
File: `frontend/src/pages/SharedView.jsx`
- `GET /s/{token}` → map pin, DIGIPIN, landmark, photo, expiry note ("No expiry" when `expiresAt` is null).
- "Route from my location": browser geolocation → `POST /s/{token}/route` → draw the line on the map, show distance and minutes.
- Fallback button: "Open in maps" (geo: link) for when routing fails.
- A 410 shows "This address is no longer shared".
- No phone number or "Call owner" button (SPEC Decisions).
- Layout: `docs/DESIGN.md` §8.1 (and `s5-receiver.png` / `d4-receiver.png` if they exist). Add the route `/s/:token` to `main.jsx`, outside `OwnerArea` (no login).
- **Check:** open a live link in a private window → it works. Revoke it → reload → dead message.

## Task 7: No-expiry links and the printable QR card (about 1 hour)
Files: `backend/src/api.js`, `backend/test/api.test.js`, `frontend/src/pages/CardView.jsx`, `frontend/src/pages/PrintCard.jsx` (new), `frontend/src/main.jsx`, `frontend/src/index.css`
- **Backend:**
  - `validateShareInput`: `hours` 0–168; 0 means no expiry.
  - `createShare`: leave `expiresAt` out when `hours` is 0.
  - `isShareLive` and the status in `getCard`: live when not revoked and `expiresAt` is absent or in the future.
  - `viewShare`: return `expiresAt: null` when absent.
  - Tests first: `hours: 0` accepted, `-1` and `169` rejected; a share with no `expiresAt` is live; a revoked one is not.
- **CardView:**
  - "No expiry" preset next to 2 / 24 / 72 / custom; the list shows "No expiry" for those links.
  - The note under the form: "Receivers can keep an offline copy until the link expires."
  - "Print card" on each live link → `/card/:id/print/:token`.
- **PrintCard page** (owner route):
  - loads `GET /cards/{id}`, finds the share by token; a missing or dead link shows a message instead
  - large QR of `${origin}/s/${token}` (`qrcode`), DIGIPIN 3-4-3, landmark, door photo, "Scan to find the door", "Valid until …" when the link expires
  - "Print / Save as PDF" → `window.print()`; `@media print` hides everything but the card; `@page` sized A6
- Layout: `docs/DESIGN.md` §8.3 and §8.4. The print route goes inside `OwnerArea` in `main.jsx`.
- Nothing new to install; `qrcode` is already a dependency.
- **Check:** `backend npm test` passes; redeploy (announce first); create a no-expiry link, print to PDF, scan the QR on the PDF with a phone → the receiver page opens.

## Task 8: Last-km offline map (about 4–5 hours)
Read SPEC "Last-km offline map" first. Check the Overpass API usage policy and the ODbL credit rule on wiki.openstreetmap.org before step 1, and note what you found in `docs/RESEARCH.md`.

**Step 1, backend: the area route.**
Files: `backend/src/api.js`, `backend/test/api.test.js`, `template.yaml`
- `GET /s/{token}/area` (public): live-share check → read `areas/{cardId}.json` from S3 → if missing, fetch from Overpass, convert, store, return. No access entry.
- Overpass query for the ±500 m box around the card's `lat`/`lon`: `[out:json][timeout:8];way["highway"](S,W,N,E);out geom;` sent by POST to `https://overpass-api.de/api/interpreter` with Node's built-in `fetch`, an 8 s `AbortSignal.timeout`, a 3 MB cap and a `User-Agent: DigiLease (hackathon)`.
- Pure helpers, tested first: `areaBox(lat, lon)` → `{south, west, north, east}`; `toStreets(overpassJson)` → `[{name, kind, line}]` with coordinates rounded to 6 decimals.
- Overpass error, timeout or oversize → 503 `{error: "Street map not available right now"}`; nothing is stored.
- Add the route to the public list in the handler's `isPublic` check.
- `template.yaml`: new `GetArea` event, `Path: "/s/{token}/area"`, `Method: GET`, `Auth: { Authorizer: NONE }`. The existing `S3CrudPolicy` already covers `areas/`. Keep the 10 s Lambda timeout.
- **Check:** `npm test`; `sam validate --lint`; redeploy (announce first); `curl <ApiUrl>/s/<live token>/area` twice: the first call fetches, the second is served from S3 (it's faster, and the object is in the bucket); a revoked token → 410.

**Step 2, frontend math (pure, tested first).**
File: `frontend/src/lib/geo.js`, tests in `frontend/src/lib/lib.test.js`
- `distanceMeters(a, b)` (haversine), `insideBox(point, box)`, `alongRoute(point, line)` → metres left along the line from the nearest point, or null when more than 50 m from it.
- **Check:** `frontend npm test` passes, with known distances (for example two DIGIPIN cell centres).

**Step 3, save for offline.**
Files: `frontend/src/lib/offline.js` (new), `frontend/public/sw.js` (new), `frontend/src/pages/SharedView.jsx`
- `offline.js`: save, load and delete the per-token copy in Cache Storage under keys `/offline/{token}/card|photo|area|route`; `load` returns nothing and deletes the copy when `expiresAt` has passed.
- `SharedView`:
  - online load → save the card and fetch + save the photo blob and `/area`
  - after a route → save the line
  - a 410 → delete the copy
  - a failed fetch → load the copy and switch to the offline view
- `sw.js` (hand-written, about 30 lines, no library): on fetch of same-origin GET requests, go to the network first; on failure answer from the cache, with navigations falling back to the cached `/index.html`. `SharedView` also adds the page's own loaded files (`performance.getEntriesByType("resource")`, same origin, plus `/` and `/index.html`) to the cache, so the first visit is enough.
- Register the service worker from `SharedView` with scope `/`, only in production builds (`import.meta.env.PROD`).
- The "Saved for offline" chip.
- **Check:** `npm run build && npm run preview`; with Playwright open a live link, then `setOffline(true)` and reload → the page opens and shows the saved card and photo.

**Step 4, the offline map view.**
Files: `frontend/src/components/OfflineMap.jsx` (new), `frontend/src/pages/SharedView.jsx`, `frontend/src/index.css`
- MapLibre with an inline style: a plain background, GeoJSON sources for streets, the square outline and the route. No tile URLs and no glyphs; the door and "you" markers and the code labels are HTML `Marker`s and a panel, so nothing needs the network.
- `navigator.geolocation.watchPosition` → "You: …" DIGIPIN via `getDigiPin`; the door code; the distance from `distanceMeters`, and "about N m along the route" from `alongRoute`; the outside-the-square message; the OpenStreetMap credit line.
- "Preview offline map" link, and automatic switching when offline.
- Layout and every state (waiting for GPS, outside the square, arrived, permission denied, back online): `docs/DESIGN.md` §8.2.
- **Check:** in Playwright (preview build): open the link, route, `setOffline(true)`, set a fake geolocation inside the square → the map shows streets, the route, both markers, the right codes and a distance. Move the fake position outside → the outside message. Then on a real phone in airplane mode.

## Task 9: Go live (about 1 hour)
- `npm run build` → **(You)** Amplify Hosting manual deploy of `frontend/dist` + the SPA rewrite rule (SETUP §4).
- **(You)** redeploy SAM with `AllowedOrigin=https://<branch>.<appid>.amplifyapp.com` (updates CORS and the map key).
- **Check on a real phone:** sign in, create a card with GPS, share, scan the QR with another phone, route, then airplane mode → the offline map still works. The map does not load from any other domain.

## Task 10: Review and polish (about 1.5 hours)
- Run the `security-review` skill on the public routes (including `/area` and the Overpass call), the service worker and the template.
- UI polish; empty and error states; mobile widths. (The user will give UI direction separately.)
- README: live URL, architecture (with OpenStreetMap / Overpass), screenshots, the "why not" table with the offline row, what we learned.
- **Check:** `superpowers:verification-before-completion`. Tests pass, build passes, phone flow works online and offline.

## Task 11: Demo video (You + Claude, about 1 hour)
| Time | Shot |
|---|---|
| 0:00–0:25 | The problem: landmark addresses fail riders and guests, and the last kilometre is where the signal drops. DIGIPIN exists but can't be shared safely. |
| 0:25–0:55 | Owner drops a pin, DIGIPIN appears, adds "blue gate, behind temple" + photo, gets the card. |
| 0:55–1:20 | Creates a "Wedding guests, no expiry" link and prints the QR card. |
| 1:20–2:05 | A guest scans the QR at home: map, photo, route, "Saved for offline". Airplane mode on: the offline map still shows the streets, the blue dot, "You: …", "Door: …" and "240 m to go". |
| 2:05–2:30 | Owner sees "Wedding guests opened at 14:02", revokes a courier link; the courier's page shows the dead link. |
| 2:30–2:45 | "Why not WhatsApp or Google Maps?" Place not person, door photo, no phone numbers, revoke, access log, and the last kilometre works with no signal. |
| 2:45–3:00 | Architecture diagram, cost of about $0, what we learned. |

## Task 12: Stretch, offline re-route (about 2 hours, only if Tasks 9–11 are done)
File: `frontend/src/lib/geo.js` (+ tests), `frontend/src/components/OfflineMap.jsx`
- Build a graph from the saved streets (street points shared between ways are junctions), snap the receiver and the door to the nearest points, shortest path (Dijkstra), draw it and show its length.
- **Check:** a unit test on a small hand-made street grid; then in Playwright offline, the drawn path follows the streets.

## If time runs short, cut in this order
1. Task 12 (offline re-route)
2. "about N m along the route" (keep the straight-line distance)
3. the photo in the offline copy
4. access-log UI (keep logging)
5. in-app route (keep the "Open in maps" link)

Never cut: create → share → view → revoke, and the offline map with streets, "you" dot, both codes and the distance. They are the pitch.
