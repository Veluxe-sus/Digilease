# Checkpoint: PataCard

## Now
Cleanup completed in the Codex copy on 2026-09-19. Tasks 0–4 are done; Task 5 is implemented but its full browser acceptance check is still next. Deadline: live Sep 20 by 12:00 IST; video and submission by 18:00 IST.

## Done
- Docs and scope are complete in SPEC, PLAN, DESIGN and RESEARCH. New screens follow DESIGN §8; mockups are skipped.
- Backend stack `pata-card` is live in ap-south-1; prior smoke test was 10/10.
- Frontend has Cognito login and the Task 5 owner flow: create card, map, photo, links, QR, revoke and access log.
- Removed four tracked empty files from `backend/`: `(leg.Geometry`, `({`, `now`, `{,`.
- Cleanup verification: backend 10/10 tests; frontend 4/4 tests; Vite production build passed.

## Next
1. Task 5 browser checks at 390px and 1440px: create card with photo, create two links, QR, revoke and access log.
2. Then Task 6 receiver view → 7 no-expiry/print → 8 offline map → 9 go live → 10 review → 11 demo.
3. Task 12 only after everything above is complete.
4. If not live by Sep 20 12:00 IST, stop feature work and do Task 9.

## Rules
- Before each task, list exact files and wait for the user's `go`.
- Never edit `backend/src/digipin.js`; display DIGIPIN 3-4-3 with spaces.
- No new dependencies or secrets. Never cache Amazon map tiles.
- Before AWS work, show `aws sts get-caller-identity`; deployments and new services require explicit approval.

## Blocked
- Nothing. Node commands require normal Windows filesystem access because the restricted sandbox cannot stat `C:\Users\adlak`.
