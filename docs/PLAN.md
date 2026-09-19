# PataCard: build plan

Tasks run in order. Each ends with a check. **(You)** marks steps the user runs. After each task, rewrite `.claude/CHECKPOINT.md` and commit.

## Tools

Skill names are Claude Code skills (plugin names in brackets). MCP servers are what the Claude Code setup had connected. Another agent without them uses the **fallback**, which does the same job by hand.

### Skills
| Skill | Used in | What it does here | Fallback without it |
|---|---|---|---|
| `superpowers:executing-plans` | every task | Run this plan task by task with checks | Follow this file in order; tick tasks in CHECKPOINT |
| `superpowers:systematic-debugging` | any failure | Find the root cause before changing code | Reproduce → read the error → one hypothesis → one fix → re-run |
| `superpowers:test-driven-development` | Tasks 1, 4 | Write the failing test first for new logic | Add a `node:test` case before the code it checks |
| `frontend-design` | Tasks 5, 8 | Layout and visual design for the product UI | Clean, mobile-first, accessible layout; one accent colour; no templates |
| `security-review` | Task 8 | Review the public routes, tokens, CORS, IAM and S3 | Manually check SPEC "Security" line by line |
| `code-review` | Task 8 | Correctness review of the full diff | Read the diff for bugs against SPEC |
| `superpowers:verification-before-completion` | end of each task | No "done" without evidence | Paste test, build or curl output before claiming done |
| `superpowers:finishing-a-development-branch` | Task 9 | Final checks and wrap-up | Tests + build pass, commit, tag `v1-submission` |
| `run` | Tasks 5–7 | Launch the app and see the change working | `npm run dev`, open http://localhost:5173 |

### MCP servers
| MCP | Used in | For | Fallback without it |
|---|---|---|---|
| `context7` | Tasks 2, 4–6 | Current docs: AWS SAM, SDK v3 (`client-geo-routes`, `lib-dynamodb`, `s3-presigned-post`), Amazon Location, MapLibre GL, Amplify v6 Auth | Official docs sites: docs.aws.amazon.com, maplibre.org, docs.amplify.aws |
| `playwright` | Tasks 6, 7 | Scripted browser run of create → share → view → revoke | Do the flow by hand in two browser windows |
| `chrome-devtools` | Tasks 5–8 | Console and network errors, mobile emulation, Lighthouse accessibility check | Browser DevTools by hand |

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
- Follow `docs/DESIGN.md` (colours, type, components) and match `docs/mockups/` (Stitch project "PataCard", id 2246405162473946986). Then one pass with the `frontend-design` skill, not a redesign loop.
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
- `GET /s/{token}` → map pin, DIGIPIN, landmark, photo, expiry note.
- "Route from my location": browser geolocation → `POST /s/{token}/route` → draw the line on the map, show distance and minutes.
- Fallback button: "Open in maps" (geo: link) for when routing fails.
- A 410 shows "This address is no longer shared".
- **Check:** open a live link in a private window → it works. Revoke it → reload → dead message.

## Task 7: Go live (about 1 hour)
- `npm run build` → **(You)** Amplify Hosting manual deploy of `frontend/dist` + the SPA rewrite rule (SETUP §4).
- **(You)** redeploy SAM with `AllowedOrigin=https://<branch>.<appid>.amplifyapp.com` (updates CORS and the map key).
- **Check on a real phone:** sign in, create a card with GPS, share, scan the QR with another phone, route. The map does not load from any other domain.

## Task 8: Review and polish (about 1.5 hours)
- Run the `security-review` skill on the public routes and the template.
- UI polish; empty and error states; mobile widths.
- README: live URL, architecture, screenshots, what we learned.
- **Check:** `superpowers:verification-before-completion`. Tests pass, build passes, phone flow works.

## Task 9: Demo video (You + Claude, about 1 hour)
| Time | Shot |
|---|---|
| 0:00–0:30 | The problem: landmark addresses fail ambulances and riders; DIGIPIN exists but can't be shared safely. |
| 0:30–1:15 | Owner drops a pin, DIGIPIN appears, adds "blue gate, behind temple" + photo, gets the card. |
| 1:15–2:00 | Creates "Ambulance, 24 h" link; on a phone the receiver opens the QR, sees the photo, taps route. |
| 2:00–2:30 | Owner sees "Ambulance opened at 14:02", revokes it; the receiver reloads and sees the dead link. |
| 2:30–3:00 | Architecture diagram, cost of about $0, what we learned. |

## If time runs short, cut in this order
1. print layout
2. photo upload
3. access-log UI (keep logging)
4. in-app route (keep the "Open in maps" link)

Never cut: create → share → view → revoke.
