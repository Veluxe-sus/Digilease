# Checkpoint: PataCard

## Now
Tasks 0–9 done; the user's phone check passed. Task 10 done; backend deployed. The new frontend zip awaits the user's Amplify upload. Live: https://main.d109k3dqf4r860.amplifyapp.com. GitHub: https://github.com/Veluxe-sus/pata_card (remote `origin`, branch `main`). Deadline: video/submission by 18:00 IST Sep 20.

## Done
- Tasks 0–7 deployed (stack `pata-card`, ap-south-1, account 499567237530). Smoke steps 1–12 pass live.
- Task 8, the offline map (`494f725`, `1c9d749`, `26706e8`): `/s/{token}/area` streets from Overpass cached in S3; `geo.js`; `offline.js`, `sw.js` (`ignoreVary`) and `OfflineMap.jsx`. Tested in Playwright; bucket CORS GET deployed so the photo is saved offline.
- Task 9: Amplify app `main.d109k3dqf4r860` (manual zip, SPA rewrite includes `mjs`). Stack `AllowedOrigin` set to the site (MapApiKey needed `ForceUpdate: true`). The user's real-phone check passed: QR, route, airplane mode, revoke.
- Location errors now name the cause (`4384c45`). Not on the live site until the new zip is uploaded.
- Task 10 (`8cfcd06`): manual security review against SPEC (the `security-review` skill needs a remote; it had none then). One fix: the Lambda pauses 30 s after an Overpass failure. README has the live URL, the offline feature, a mermaid diagram, the security summary, what we learned, screenshots, and the OSM credit. The laptop offline view no longer scrolls.

## Next
1. Backend deployed and pushed (`b19306f`). The user uploads `Desktop\pata-card-dist.zip` via Amplify → Deploy updates (location messages, laptop layout, street-map retry). Future deploys: always pass `--parameter-overrides AllowedOrigin=https://main.d109k3dqf4r860.amplifyapp.com`.
2. Task 11 demo video (shot list in PLAN). Optional: `code-review` of the whole diff.
3. The user will recheck laptop location on a friend's laptop.
4. Overpass is slow at European peak (see RESEARCH). Before recording, open the demo card's link and wait for "Saved for offline"; after that its streets come from S3.

## Decisions
- Claude only; one writer; Opus 5.
- Offline streets from OpenStreetMap only; the credit links to openstreetmap.org/copyright.
- Zip the frontend with Python (forward-slash paths), not `Compress-Archive`.
- Run sam from the project root; `sam.cmd` is at `C:\Program Files\Amazon\AWSSAMCLI\bin\`.

## Unverified
- Laptop geolocation with system location on (the user will check).

## Handoff
Read `AGENTS.md`, `docs/PLAN.md`, `docs/SPEC.md`, `docs/DESIGN.md`. Tests: `backend npm test` (13), `frontend npm test` (10). Smoke: `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh` (it resets the smoke-test user's password). A hook sometimes leaves empty files named after `>`-fragments of shell commands; delete them before committing.
