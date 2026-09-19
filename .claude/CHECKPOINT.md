# Checkpoint: PataCard

## Now
Tasks 0–7 done and deployed. Next: Task 8 (last-km offline map), plan first. Claude only, in `C:\Users\adlak\claude_projects\pata-card`; the Codex copy is retired. Deadline: live Sep 20 by 12:00 IST; video/submission by 18:00 IST.

## Done
- Docs/scope in SPEC, PLAN, DESIGN (§8 new screens), RESEARCH; mockups skipped.
- AWS stack `pata-card` live in ap-south-1 (ApiUrl `https://qqok8fblfe.execute-api.ap-south-1.amazonaws.com`), account 499567237530, user `vansh`.
- Task 5 owner flow, Task 6 receiver view (Codex), verified live.
- Task 7: `hours: 0` = no expiry; "No expiry" chip; owner-only A6 print page. Review fixes `3b0d728`: blank hours rejected in UI and API; print footer always fits; "Open in maps" is a Google Maps https link.
- 2026-09-20 ~00:45 IST: Task 7 deployed (`sam deploy`, Lambda + HttpApi updated in place). Smoke test steps 1–11 pass live, including the no-expiry link (`expiresAt=null`, revoke → 410) and blank hours → 400.
- Checks: backend 10/10, frontend 6/6, build passes.

## Next
1. Task 8 offline map: write a short plan (files, steps), get the user's go, then build. Check the Overpass policy + ODbL credit first and note them in RESEARCH.
2. Task 9 go live → 10 review → 11 demo. Task 12 only if all done.
3. If not live by Sep 20 12:00 IST, stop features, do Task 9.

## Decisions
- Claude only; one writer, this folder. Opus 5 for Task 8 (user's choice).
- Pitch "share once, found always"; offline streets from OpenStreetMap, never Amazon tiles.
- Deploys: announce first; new services or cost need a fresh yes.
- Phone QR scan and PDF-from-live-app move into the Task 9 phone check (QR needs the hosted URL).

## Unverified
- Blue route line needs a real-phone GPS check.
- Phone QR scan; PDF print from the hosted app.

## Handoff
Read `AGENTS.md`, `docs/PLAN.md`, `docs/SPEC.md`, `docs/DESIGN.md`. Run `cd frontend && npm run dev` (5173). Tests: `backend npm test`, `frontend npm test`. Smoke (resets the smoke-test user's password each run): `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`. SAM: `"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd"` (not on Git Bash PATH).
