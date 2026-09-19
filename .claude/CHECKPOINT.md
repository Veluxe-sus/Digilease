# Checkpoint: PataCard

## Now
Tasks 0–6 complete; Task 7 built and tested locally, not deployed. From 2026-09-19 ~15:00 IST **Claude only** builds, in `C:\Users\adlak\claude_projects\pata-card` (this folder). The Codex copy `C:\Users\adlak\codex_projects\pata-card` is retired; this folder was fast-forwarded to its last commit `3b0d728`. Deadline: live Sep 20 by 12:00 IST; video/submission by 18:00 IST.

## Done
- Docs/scope in SPEC, PLAN, DESIGN (§8 new screens), RESEARCH; mockups skipped.
- AWS stack `pata-card` live in ap-south-1 (ApiUrl `https://qqok8fblfe.execute-api.ap-south-1.amazonaws.com`).
- Task 5 owner flow: card/photo, links, QR, revoke, access log, 390px/1440px (Codex).
- Task 6 receiver `/s/:token`: map, photo, landmark, DIGIPIN, expiry, route, 410 state (Codex). Verified live link, access log, route API 200, revoke → dead link.
- Task 7 (Codex): `hours: 0` = no expiry (no TTL, live until revoked); "No expiry" chip; Print action; owner-only A6 print page.
- Review fixes `3b0d728` (Claude): blank custom hours rejected in UI and API (never becomes "no expiry"); print card is a flex column so the "Valid until" footer always fits (tested 193-char landmark, PDF, 360px); "Open in maps" is a Google Maps https link (works on iPhone/desktop).
- Checks: backend 10/10, frontend 6/6, build passes.

## Next
1. Deploy backend (Task 7 + fix): show `aws sts get-caller-identity`, announce, get the user's yes, then `sam build && sam deploy`.
2. Verify a real no-expiry link, PDF print, phone QR scan → commit "Task 7".
3. Task 8 offline map → 9 go live → 10 review → 11 demo. Task 12 only if all done.
4. If not live by Sep 20 12:00 IST, stop features, do Task 9.

## Decisions
- Claude only from now; one writer, this folder. Don't edit the Codex copy.
- Pitch "share once, found always"; offline streets from OpenStreetMap, never Amazon tiles.
- Deploys: announce first; new services or cost need a fresh yes.

## Unverified
- Blue route line needs a real-phone GPS check.
- Task 7 on AWS, PDF output from the real app, phone QR scan.
- Test user `smoke-test@patacard.invalid` password lost; reset with `admin-set-user-password` (ask first).

## Handoff
Read `AGENTS.md`, `docs/PLAN.md`, `docs/SPEC.md`, `docs/DESIGN.md`. Run `cd frontend && npm run dev` (5173). Tests: `backend npm test`, `frontend npm test`. Smoke: `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`.
