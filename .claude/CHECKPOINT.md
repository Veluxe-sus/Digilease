# Checkpoint: DigiLease v2

## Now
Branch `v2-redesign`. `main` remains untouched at `5f7817f` as the submittable v1 fallback.
The frontend motion/polish pass is complete and browser-verified.

## Verified on 2026-09-20
- `/new`, `/card/:id`, `/card/:id/print/:token`, `/cards`, and the receiver offline reload were
  already verified at 1440x900 and 390x844; see `docs/HANDOFF-CODEX.md` for the full gate.
- `/cards` uses the supplied React Bits DepthCarousel with real card faces; arrows, dots, drag,
  keyboard and autoplay keep the opened detail in sync.
- Added React Bits BlurText to the hero headline and a restrained BorderGlow to the lanyard pass.
  Both respect reduced motion; the glow is disabled for touch pointers.
- Smoothed native anchor/button transitions without scroll hijacking. Fixed the narrow DIGIPIN
  wrap, replaced the empty em-dash plate with `Tap the map`, darkened expired amber for contrast,
  changed the revoke claim to `Online views stop immediately`, and moved carousel arrows to
  Phosphor icons.
- Landing, `/new`, and `/cards` rechecked live at 1440x900 and 390x844. No console warnings or
  errors. Frontend tests 10/10, lint clean, production build green.
- Build still prints the existing DIGIPIN CommonJS-variable warning and large-chunk warning.

## Next
1. Retake `docs/screenshots/*` after the rename and replace `frontend/public/shots/*`.
2. Rewrite stale `docs/DESIGN.md` sections 2-4 for the v2 palette, fonts and pass direction.
3. Add a real door photograph only if the user supplies one; do not fake or generate it.
4. Zip the green `frontend/dist` with forward-slash paths, then the user uploads to Amplify.

## Non-negotiables
- All work stays on `v2-redesign`; never edit or deploy `main`.
- Never edit either DIGIPIN source file or the protected receiver/backend files in the handoff.
- Visible claims must stay within the honesty table and banned-vocabulary rules in
  `docs/HANDOFF-CODEX.md`.
