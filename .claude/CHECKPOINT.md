# Checkpoint: DigiLease v2

## Now
Branch `v2-redesign`. `main` remains untouched at `5f7817f` as the submittable v1 fallback.
The previously unseen owner routes and the receiver offline reload are now browser-verified.

## Verified on 2026-09-20
- `/new` at 1440x900 and 390x844: layout holds, no horizontal overflow, map renders, tapping and
  dragging the pin update the DIGIPIN live, and saving redirects to `/card/:id`.
- Browser geolocation reached the correct 15-second timeout message because the in-app browser
  supplied no GPS fix. The device-level success path remains unverified, not known broken.
- `/card/:id` at both widths: the map is 220 px, content clears the fixed nav, and layout has no
  horizontal overflow. Fixed a desktop-only 0 px map regression by scoping the split-map rule.
- `/card/:id/print/:token` at both widths: A6 proportions on desktop, responsive phone preview,
  and print CSS hides the pill nav and forces black on white.
- Live receiver link on a fresh local v2 production build: reached "Saved for offline" with a
  controlling service worker and 9 cached responses. Forced the network offline and reloaded;
  the saved map, door marker, DIGIPIN and OpenStreetMap credit rendered successfully.
- Frontend tests 10/10, lint clean, production build green. Build still prints the existing
  DIGIPIN CommonJS-variable warning and large-chunk warning.

## Test data created
- One no-landmark card was created while proving the save redirect.
- It has a 24-hour share named "Release check". It will expire automatically.

## Next
1. Retake `docs/screenshots/*` after the rename and replace `frontend/public/shots/*`.
2. Rewrite stale `docs/DESIGN.md` sections 2-4 for the v2 palette, fonts and pass direction.
3. Add a real door photograph only if the user supplies one; do not fake or generate it.
4. Run the final build, zip `dist` with forward-slash paths, then the user uploads to Amplify.

## Non-negotiables
- All work stays on `v2-redesign`; never edit or deploy `main`.
- Never edit either DIGIPIN source file or the protected receiver/backend files in the handoff.
- Visible claims must stay within the honesty table and banned-vocabulary rules in
  `docs/HANDOFF-CODEX.md`.
