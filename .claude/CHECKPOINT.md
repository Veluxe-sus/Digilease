# Checkpoint: DigiLease v2

## Now
v2 is the shipped line. `v2-redesign` was pushed to GitHub and fast-forwarded into `main`;
both branches now point at the same commit. The v1 fallback is preserved as the tag `v1-fallback`.

## Done
- Owner card, `/cards` carousel, print pass, warm light theme, dark theme and the receiver flow are
  browser-verified at 1440x900 and 390x844. See `docs/HANDOFF-CODEX.md` for the full gate.
- Card deletion: hold-to-confirm, cascading removal of the door photo, offline area, links and
  access history. Backend deployed; the DELETE route is live and CORS survived the deploy.
- Live API smoke tests pass: auth enforced at the gateway, correct status codes.
- Tests 10/10 frontend, 13/13 backend; lint, build and `sam build` green.
- `docs/DESIGN.md` sections 2-4 rewritten against the shipped tokens (warm Paper/Clay palette,
  Space Grotesk + Inter + JetBrains Mono, hold-to-confirm as the only destructive pattern).
- README documents card deletion, `/cards`, dark mode and the pitch deck.
- 14-slide pitch deck committed at `docs/DigiLease-deck.pptx`.

## Next
1. Retake `docs/screenshots/*` from the deployed v2 and replace `frontend/public/shots/*`.
2. Upload `Desktop\digilease-v2-dist.zip` to Amplify and hard-reload the live site.
3. Record the 3-minute demo video and put its link in README (`Demo video:` placeholder).
4. Add a real door photograph only if the user supplies one; never fake or generate it.

## Decisions
- **2026-09-20: `main` is no longer frozen.** The earlier rule ("all work stays on `v2-redesign`,
  never touch `main`") was set to keep a submittable v1 fallback. The user lifted it and asked for
  v2 on `main`. The fallback is kept as the tag `v1-fallback` (was `5f7817f`), so v1 is still
  recoverable without keeping `main` behind.
- Deck screenshots are the real phone captures, not mockups. Nothing in the deck claims a
  capability the app does not have.

## Blocked
Nothing.

## Non-negotiables
- Never edit either DIGIPIN source file; preserve the receiver consent and offline flow.
- Visible claims stay inside the honesty table and banned-vocabulary rules in
  `docs/HANDOFF-CODEX.md`.
