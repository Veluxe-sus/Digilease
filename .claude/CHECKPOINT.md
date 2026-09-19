# Checkpoint: PataCard

## Now
Scope changed and approved by the user on 2026-09-19. SPEC and PLAN rewritten: no-expiry links + printable QR card (Task 7) and the last-km offline map (Task 8). Waiting for the user to review the docs before any code. Deadline Sept 20 EOD; live by 12:00 IST is at risk (about 8 h of new building), submission by 18:00 IST holds.

## Done
- Docs verified by the user: AGENTS, CLAUDE, RESEARCH, SPEC, PLAN, SETUP, DESIGN (+ mockups), README. SPEC/PLAN re-edited today, not yet re-verified.
- Tasks 0–4: AWS setup; backend 10/10 tests; stack `pata-card` live (ap-south-1; ApiUrl `https://qqok8fblfe.execute-api.ap-south-1.amazonaws.com`); `scripts/smoke.sh` 10/10; Vite React frontend with Cognito login.
- Task 5 written (`MapView`, `DigipinPlate`, `NewCard`, `CardView`, routes `/new`, `/card/:id`). Verified in the browser at 390px: map, pin, live DIGIPIN, save.
- MapLibre v6 worker fix: `npm run copy-map-worker` + `setWorkerUrl("/maplibre/...")`.
- Test data: user `smoke-test@patacard.invalid`, 2 cards. Reset its password with `admin-set-user-password` if needed.

## Next
1. User reviews `docs/SPEC.md` and `docs/PLAN.md` (Tasks 7, 8, 12 new; old 7–9 are now 9–11).
2. Finish Task 5 checks on `/card/:id`: 2 links, QR, revoke, access log, 1440 width.
3. Task 6 receiver view → Task 7 → Task 8 → Task 9 go live → 10 review → 11 video. Task 12 stretch only.
4. The user will give UI direction separately; don't redesign before that.

## Decisions
- Pitch: "share once, found always". The last-km offline map is the feature Google Maps/WhatsApp sharing doesn't give; the consent links stay.
- The user rejected the offline compass/arrow and the standalone offline tools (my code, saved spots, SMS). Chose features 3 (printable QR) + 4 (receiver page) + their own idea: save a ~1 km map around the door on the receiver's phone.
- Offline streets from OpenStreetMap (Overpass), not Amazon: Amazon's docs say nothing clear about storing their map offline. ODbL allows it with credit.
- Printed QR links need "no expiry" (hours 0), still revocable. An offline copy outlives a revoke until the receiver goes online: stated as a known limit.
- No phone numbers / "Call owner" on the receiver page.
- Stay with PataCard; Scam Bust rejected. JavaScript end to end; serverless + Cognito.
- The user asked Claude to run deploys; announce first; anything new or costly needs a fresh yes.

## Blocked
- Nothing. Waiting on the user's review of SPEC/PLAN.

## Handoff
- Read `AGENTS.md`, then `docs/PLAN.md` / `docs/SPEC.md` / `docs/DESIGN.md` / `docs/RESEARCH.md` / `docs/SETUP.md`.
- Run: `cd frontend && npm run dev` (port 5173). Tests: `backend npm test`, `frontend npm test`. Live check: `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`.
- Trust these files and `git log`, not chat memory.
