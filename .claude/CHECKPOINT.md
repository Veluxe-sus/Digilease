# Checkpoint: PataCard

## Now
Session paused by the user mid-Task 5 (owner flow). Backend LIVE, smoke 10/10, login + map + create-card work in the browser. Deadline Sept 20 EOD; targets: live by 12:00 IST, submitted by 18:00 IST.

## Done
- Docs verified by the user: AGENTS, CLAUDE, RESEARCH, SPEC, PLAN, SETUP, DESIGN (+ mockups), README.
- Tasks 0–4:
  - AWS setup
  - backend 10/10 unit tests
  - stack `pata-card` live (ap-south-1; ApiUrl `https://qqok8fblfe.execute-api.ap-south-1.amazonaws.com`)
  - `scripts/smoke.sh` 10/10
  - Vite React frontend with Cognito login
- Task 5, written:
  - `MapView.jsx`, `DigipinPlate.jsx`, `NewCard.jsx`, `CardView.jsx`, CSS
  - routes `/new` and `/card/:id`
- Task 5, verified in the browser (Playwright, 390px): map tiles load; tap drops the pin; live DIGIPIN; save → CardView shows "Card saved".
- Fixed: the MapLibre v6 worker breaks under Vite. `npm run copy-map-worker` (runs before dev/build) + `setWorkerUrl("/maplibre/...")`.
- Test data: user `smoke-test@patacard.invalid` owns 2 cards (4T3 96F4 2L7 and 3P8 2LCJ L82). Password only in the old session's scratchpad; reset it with `admin-set-user-password` if needed.

## Next
1. Finish Task 5 checks on `/card/:id`: create 2 links, QR, "Send link", revoke with confirm, access log, laptop width (1440). Take screenshots.
2. README: add Mappls Pin / eLoc, Google Plus Codes and what3words to the "why not" table. Honest line: *they solve the code; we solve consent.*
3. **User decision pending: offline features.** Proposed, not approved:
   - A. offline `/pin` tool as an installable web app (GPS → DIGIPIN, typed DIGIPIN → spot, no network; hand-written service worker)
   - B. printable door plate
   - Recommended A+B (~3 h).
4. Task 6 receiver view + route; Task 7 Amplify Hosting + `sam deploy --parameter-overrides AllowedOrigin=<url>`; Tasks 8–9.

## Decisions
- Stay with PataCard; Scam Bust rejected (an LLM wrapper, crowded, Bedrock not on the list, no build yet). Pitch: a working prototype of DHRUVA's consent layer on the official DIGIPIN.
- Honest weakness: Mappls eLoc (2017) already shares address codes. Our edge is per-receiver consent links (expiry, revoke, log) + door photo.
- JavaScript end to end; serverless + Cognito; store the cell centre; routes in Lambda; mobile-first, two panes at ≥1024px.
- The user asked Claude to run deploys; announce first; anything new or costly needs a fresh yes.

## Blocked
- Nothing. Waiting on the user's offline-feature decision (Next #3).

## Handoff
- Read `AGENTS.md`, then `docs/PLAN.md` / `docs/SPEC.md` / `docs/DESIGN.md` / `docs/RESEARCH.md` / `docs/SETUP.md`.
- Run: `cd frontend && npm run dev` (port 5173 fixed). Tests: `backend npm test` (10), `frontend npm test` (4). Live check: `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`.
- Trust these files and `git log`, not chat memory.
