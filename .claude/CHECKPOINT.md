# Checkpoint: PataCard

## Now
Tasks 0–6 are complete. Task 7 is implemented and tested locally but not deployed. Deadline: live Sep 20 by 12:00 IST; video/submission by 18:00 IST.

## Done
- Docs/scope are in SPEC, PLAN, DESIGN and RESEARCH; mockups are skipped.
- AWS stack `pata-card` is live in ap-south-1.
- Task 5 owner flow works: card/photo, two links, QR, revoke, access log, 390px/1440px.
- Removed four tracked empty backend files and fixed MapView Strict Mode cleanup/revoke UI.
- Task 6 added public `/s/:token` outside authentication with loading/error/410 states.
- Receiver shows the door map/photo, landmark, 3-4-3 DIGIPIN, expiry, GPS route action, summary and `geo:` fallback.
- Verified a disposable live link, public access log entry, route API 200, revoke and immediate dead-link response.
- Responsive receiver layout checked at 390px and 1440px; Impeccable detector returned no findings.
- Task 7 backend accepts `hours: 0`, omits its TTL, and keeps permanent links live until revoked.
- Owner UI has No expiry, permanent status text, Print actions and an owner-only A6 print page.
- Print preview has photo, 55 mm QR, 3-4-3 DIGIPIN, landmark, expiry footer and print CSS.
- Task 7 local checks: backend 10/10, frontend 6/6, Vite build passed; UI detector clean.

## Next
1. Get explicit approval, then `sam build` and deploy existing Lambda to `pata-card` in ap-south-1.
2. Verify a real no-expiry link, PDF print and phone QR scan; then finish Task 7.
3. Continue Task 8 offline map → 9 go live → 10 review → 11 demo.
4. Task 12 only after everything above is complete.
5. If not live by Sep 20 12:00 IST, stop feature work and do Task 9.

## Rules
- Never edit `backend/src/digipin.js`; show DIGIPIN 3-4-3 with spaces.
- No new dependencies or secrets. Never cache Amazon map tiles.
- Show AWS identity before AWS work; deploys/new services require explicit approval.

## Unverified
- The test browser could not provide GPS; permission fallback and live route API are verified, but the blue route line needs a real-phone GPS check.
- Task 7 AWS deployment, no-expiry live flow, PDF output and phone QR scan are pending approval/manual checks.
