# Checkpoint: PataCard

## Now
Tasks 0–5 are complete in the Codex copy. Task 5 passed its full owner-flow browser check at 390px and 1440px. Next is Task 6 receiver view. Deadline: live Sep 20 by 12:00 IST; video and submission by 18:00 IST.

## Done
- Docs and scope are complete in SPEC, PLAN, DESIGN and RESEARCH. New screens follow DESIGN §8; mockups are skipped.
- Backend stack `pata-card` is live in ap-south-1; prior smoke test was 10/10.
- Frontend has Cognito login and the Task 5 owner flow: create card, map, photo, links, QR, revoke and access log.
- Removed four tracked empty files from `backend/`: `(leg.Geometry`, `({`, `now`, `{,`.
- Task 5 browser check: created a card with image, two links and QR; logged a public open; revoked one link; verified 390px/1440px and zero console errors.
- Fixed MapView Strict Mode cleanup so existing door pins stay on the live map; fixed the revoke confirmation panel staying visible.
- Verification: backend 10/10 tests; frontend 4/4 tests; Vite production build passed.

## Next
1. Task 6 receiver view: public `/s/:token`, route line, dead-link state and responsive layout.
2. Then Task 7 no-expiry/print → 8 offline map → 9 go live → 10 review → 11 demo.
3. Task 12 only after everything above is complete.
4. If not live by Sep 20 12:00 IST, stop feature work and do Task 9.

## Rules
- Before each task, list exact files and wait for the user's `go`.
- Never edit `backend/src/digipin.js`; display DIGIPIN 3-4-3 with spaces.
- No new dependencies or secrets. Never cache Amazon map tiles.
- Before AWS work, show `aws sts get-caller-identity`; deployments and new services require explicit approval.

## Blocked
- Nothing. Node commands require normal Windows filesystem access because the restricted sandbox cannot stat `C:\Users\adlak`.
