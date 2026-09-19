# Checkpoint: PataCard

## Now
Site is live at https://main.d109k3dqf4r860.amplifyapp.com (Amplify, manual zip upload). Task 9: only the user's real-phone check is left. Claude only, in this folder. Deadline: live Sep 20 by 12:00 IST; video/submission by 18:00 IST.

## Done
- Tasks 0–7 done and deployed (stack `pata-card`, ap-south-1, account 499567237530). Smoke steps 1–12 pass live.
- Task 8 step 1 (`494f725`, deployed): `GET /s/{token}/area` fetches the ±500 m streets from Overpass once and keeps them in S3 at `areas/{cardId}.json`. Live check: first call 1.46 s from Overpass, second 0.28 s from S3, revoked link → 410.
- Step 2 (`1c9d749`): `frontend/src/lib/geo.js` provides `distanceMeters`, `insideBox` and `alongRoute`, with tests.
- Steps 3–4 (`26706e8`): `offline.js` (Cache Storage), `public/sw.js` (network first, cache fallback, `ignoreVary`), `OfflineMap.jsx`, and a `SharedView` chip plus the "Preview offline map" link. Playwright on the production build: first visit is enough; offline reload shows the streets, square, route, both codes, the distance and "along the route"; the outside and arrived states work; 320/360/1440 px have no overflow; revoke → copy deleted.
- Bucket CORS GET deployed 2026-09-20; the door photo is saved and shows offline (Playwright).
- Overpass policy and OSM credit rules noted in RESEARCH.
- Task 9 (2026-09-20 ~02:00 IST): Amplify app `main.d109k3dqf4r860` with the SPA rewrite (includes `mjs`). Stack redeployed with `AllowedOrigin=https://main.d109k3dqf4r860.amplifyapp.com` after adding `ForceUpdate: true` to MapApiKey (the first try rolled back). Verified: API CORS, bucket CORS and map-key referers all list the site; the live share link shows tiles, is saved for offline, and opens offline. To redeploy the frontend: `npm run build`, zip with `/` paths (Python, not Compress-Archive), then Amplify → Deploy updates.

## Next
1. Task 9 real-phone check (user): sign in, create a card with GPS, share, print the PDF, scan the QR with a second phone, route, then airplane mode → offline map.
2. Task 10 review (security review includes `/area` and the service worker). Polish item: a small vertical scrollbar on the laptop offline view. Then Task 11 demo.

## Decisions
- Claude only; one writer; Opus 5 for Task 8.
- Offline streets from OpenStreetMap only; credit links to openstreetmap.org/copyright.
- The page shows the downloaded photo blob, not a second request (avoids a CORS failure from a cached image).
- Local tests run `vite preview --host 127.0.0.1 --port 5173`. An old dev server holds `[::1]:5173`, and the map key allows only localhost, so online tiles are blank on 127.0.0.1. That's expected.

## Unverified
- Real phone: QR scan, airplane mode, GPS route line, PDF from the hosted app.

## Handoff
Read `AGENTS.md`, `docs/PLAN.md`, `docs/SPEC.md`, `docs/DESIGN.md`. Tests: `backend npm test`, `frontend npm test`. Smoke (resets the smoke-test user's password each run): `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`. SAM: `"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd"`. A hook sometimes leaves empty files named after `>`-fragments of shell commands (`{const`, `.topbar`); delete them before committing.
