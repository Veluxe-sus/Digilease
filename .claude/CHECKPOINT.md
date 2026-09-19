# Checkpoint: PataCard

## Now
Handed off to Codex on 2026-09-19 (~13:00 IST). Scope is approved and fully written: SPEC, PLAN (with order, time budget and Stitch prompts) and DESIGN §8 (new screens). No code has been written for the new scope yet. Deadline Sept 20: live by 12:00 IST, submitted by 18:00 IST.

## Done
- Docs: AGENTS, CLAUDE, RESEARCH, SPEC, PLAN, SETUP, DESIGN (+ mockups s1, s2, s4, d1–d3), README.
- Tasks 0–4: AWS setup; backend 10/10 tests; stack `pata-card` live (ap-south-1; ApiUrl `https://qqok8fblfe.execute-api.ap-south-1.amazonaws.com`); `scripts/smoke.sh` 10/10; Vite React frontend with Cognito login.
- Task 5 written (`MapView`, `DigipinPlate`, `NewCard`, `CardView`, routes `/new`, `/card/:id`). Verified at 390px: map, pin, live DIGIPIN, save.
- MapLibre v6 worker fix: `npm run copy-map-worker` + `setWorkerUrl("/maplibre/...")`.
- Test data: user `smoke-test@patacard.invalid`, 2 cards. Reset its password with `admin-set-user-password` if needed.

## Next (follow docs/PLAN.md "Remaining work" in order)
1. Cleanup: `git rm` the 4 empty files in `backend/`.
2. Task 5 checks on `/card/:id`: 2 links, QR, revoke, access log, 1440 width.
3. Mockups (optional, only with the Stitch MCP) → Task 6 → 7 → 8 → 9 go live → 10 → 11. Task 12 stretch only.
4. Hard rule: not live by Sep 20 12:00 IST → stop features, go to Task 9.

## Decisions
- Pitch: "share once, found always". The last-km offline map (the user's idea) is the headline feature; the consent links stay.
- The user rejected the offline compass/arrow and standalone offline tools (my code, saved spots, SMS). Kept: printable QR card, receiver page, last-km offline map.
- Offline streets from OpenStreetMap (Overpass), not Amazon: Amazon's docs say nothing clear about storing their map offline. ODbL allows it with credit.
- Printed QR links need "no expiry" (hours 0), still revocable. An offline copy outlives a revoke until the receiver goes online: a stated known limit.
- No phone numbers / "Call owner" on the receiver page.
- UI: keep the current DESIGN.md look (my recommendation). The user didn't choose between this and a new look before handing off. If they ask for a new look, only DESIGN.md §1–3 change.
- The user asked the agent to run deploys; announce first; anything new or costly needs a fresh yes.

## Blocked
- Nothing.

## Handoff
- Read `AGENTS.md`, then `docs/PLAN.md` / `docs/SPEC.md` / `docs/DESIGN.md` / `docs/RESEARCH.md` / `docs/SETUP.md`.
- Run: `cd frontend && npm run dev` (port 5173). Tests: `backend npm test`, `frontend npm test`. Live check: `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`.
- Trust these files and `git log`, not chat memory.
