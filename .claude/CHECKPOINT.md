# Checkpoint: DigiLease (was PataCard)

## Now
v2 frontend redesign, on branch `v2-redesign`. `main` is untouched at `5f7817f` and, with
`Desktop\pata-card-dist.zip`, is the v1 fallback we submit if v2 is not verified by 17:30 IST today.
Landing page is built and checked at 1440x900 and 390x844. The signed-in pages are written but
**not yet seen**, because verifying them needs a Cognito session in the browser.

## Done
- Rename PataCard to DigiLease across the UI, README and docs. Stack names, bucket names and the
  repo stay `pata-card`; infrastructure is unchanged. `lib/digipin.js` untouched (a test pins it).
- New palette (paper `#FBF7E4`, olive ink `#26301C`, brick `#B05A28`) in the `:root` block, with
  `--post` aliased to `--accent` so every existing rule rethemed at once. Space Grotesk / Inter /
  JetBrains Mono, where mono is only ever used for machine facts.
- Landing at `/`: React Bits ShapeGrid as the DIGIPIN grid, a CSS-only pass on a lanyard with a real
  countdown, a MagicBento of eight real features (two carry real screenshots), a plain statement of
  what the product cannot do, and one CTA label used everywhere.
- My cards: React Bits CardSwap deck (2 to 6 cards) beside the opened card. One card sits still,
  seven or more fall back to a scroll-snap rail. Share rows are tear stubs; a revoked one stays
  visible and struck through.
- `CardView` is now a thin wrapper around a shared `CardDetail`. Sign-in is still Amplify's
  `<Authenticator>`, restyled only through its own CSS variables, on the same grid as the landing.
- Fixed: the print stylesheet hid the old `.topbar`, so the new pill nav would have printed on the A6.
- Nav destinations are inline on desktop, hamburger only under 768px. The links were hidden behind the
  hamburger, which is why /cards looked like it had no deck: nobody could reach it.
- CardSwap throws the front card a distance scaled to the card, not a flat 500px that made it vanish.

## Next
**A full handoff for the next agent is `docs/HANDOFF-CODEX.md`. Read that first.**

1. Verify `/new`, `/card/:id` and `/card/:id/print/:token` in a browser at 1440x900 and 390x844.
   `/cards` is confirmed working with two real cards; the other three are built but unseen.
2. Regression gate: open a live `/s/{token}`, confirm the receiver view and the offline save behave
   as v1, then reload in airplane mode. Nothing in `SharedView`/`OfflineMap`/`sw.js` was touched.
3. Retake `docs/screenshots/*` after the rename. Both bento shots still contain v1 chrome and are
   currently cropped past it (`object-position: center 42%` in `MagicBento.css`).
4. Build, zip with the Python script (forward slashes), user uploads to Amplify.

## Decisions
- Direction is "the card is a physical pass": paper stock, lanyard, perforated tear stubs, A6 print.
- Nothing on screen may be invented. No EPSG, RTK, cadastre, hashes, tokens, barcodes, counters, or
  "verified" badges. A door photo is uploaded, never checked, so it is never called verified.
- App pages ship light only; no dark variant, to spend the time on the deck instead.
- New deps: `gsap` (four React Bits components need it) and `@phosphor-icons/react`. Both free.

## Blocked
- No door photograph exists in the repo, so the hero pass shows no photo. One JPEG in
  `frontend/public/` would let the pass and the "Landmark and door photo" cell show a real door.
