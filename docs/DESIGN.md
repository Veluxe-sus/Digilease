# Design System: DigiLease

## 1. Visual Theme & Atmosphere
A calm, civic, mobile-first utility. It should feel like a well-made government-grade tool that ordinary people trust at a stressful moment (an ambulance is on the way), not like a startup landing page. Every screen should read at a glance on a phone held in one hand, in sunlight.
- **Density:** "Daily App Balanced" (5). One task per screen and generous tap targets, but no wasted hero space.
- **Variance:** "Offset Asymmetric" (4). Left-aligned headings and content; the map is the one large visual on each screen.
- **Motion:** "Fluid CSS" (4). Gentle transitions on state changes (link created, link revoked). No decorative loops.
- **Signature element:** the DIGIPIN itself, set in a large monospace "code plate" with 3-4-3 grouping (`4T3 96F4 2L7`), like a postal stamp or a vehicle number plate. It is the brand.

## 2. Color Palette & Roles

The v2 palette is warm, not cool. The page reads like aged paper rather than a screen, so the map and the door photo are the only cold things on it. Tokens live on `:root` in `frontend/src/index.css`; the names below are those tokens.

**Light (`:root`)**
- **Paper** (`--paper` #FAF6E9): page background, a warm off-white.
- **Surface** (`--surface` #FFFFFF): cards, sheets and input fills.
- **Ink** (`--ink` #26301C): primary text and icons, a very dark olive rather than black.
- **Ink Soft** (`--ink-soft` #3A4630): secondary headings and body on tinted surfaces.
- **Muted** (`--muted` #6B7360): timestamps, helper text, labels.
- **Line** (`--line` #DFD6BA): 1px borders and dividers.
- **Clay** (`--accent` #B05A28): the single accent. Primary buttons, the DIGIPIN code-plate border, focus rings, the map pin and the route line (`--route`). Pressed state `--accent-press` #8E4720; tint `--accent-soft` #F6EBE2.
- **Semantic, not accent:**
  - Live (`--live` #4A7A3A): "Live" link status, tint `--live-soft` #EDF2E3
  - Expired (`--expired` #8A6119): "Expired" status
  - Void (`--void` #9B2F22): revocation and destructive confirmation only, tint `--danger-soft` #F7E7E1
- **Map Paper** (`--map-paper` #EFEADA): the offline street canvas, so a cached map still belongs to the page.
- **Hero** (`--hero-bg` #191D14): the landing hero block only.

**Dark (`:root[data-theme="dark"]`)**
- Paper #12160F, Surface #1C2218, Ink #EDF0E7, Ink Soft #CBD2C2, Muted #AAB39F, Line #394232.
- Clay lifts to #D47742 (pressed #E28A56) to hold contrast on the dark paper; Live #8DB879, Expired #D9AA5A, Void #F1877B.
- Dark mode is a real theme, persisted by the header switch — not a media-query afterthought.

**Never:** pure black, purple or neon, gradients on buttons or text, more than one accent. Every state that used the old `--post` red now resolves to `--accent` through a legacy alias; do not reintroduce a second red.

## 3. Typography Rules

Three families, all from Google Fonts, all declared as tokens (`--display`, `--font`, `--mono`).

- **Display (`--display`):** Space Grotesk, fallback system-ui. Page titles, the wordmark and card headings. Semi-bold, tight tracking (-0.01em), controlled in size: the page title is 24–28px on mobile. Hierarchy comes from weight and colour, not huge sizes.
- **Body (`--font`):** Inter, fallback system-ui / Segoe UI / Roboto. 16px, line height 1.55, max 65 characters per line.
- **Mono (`--mono`):** JetBrains Mono. The DIGIPIN code plate (24–32px, weight 700, letter-spacing 0.08em), expiry countdowns, share tokens and access-log timestamps.
- **Labels:** 12px uppercase, letter-spacing 0.08em, Muted.
- **Banned:** serif faces anywhere in the app UI, and anything below 14px that a user must read.

> Superseded: v1 specified Satoshi from Fontshare and banned Inter. v2 ships Space Grotesk + Inter; the pairing gives the display face its own character while the body stays invisible. Do not re-add Satoshi without changing this section.

## 4. Component Stylings
- **DIGIPIN code plate:** a white surface with a 2px Clay border and 8px radius. A monospace code in 3-4-3 groups, a small "DIGIPIN" label above, and a copy icon button on the right.
- **Primary button:** Clay fill, white text, 12px radius, 48px tall, full width on mobile. On press it moves down 1px. No glow.
- **Secondary button:** white fill, 1px Line border, Ink text.
- **Destructive action ("Revoke", "Delete card"):** never a filled red button beside the primary. v2 uses a **hold-to-confirm** control — the label sits in Void, and a progress fill sweeps the button while the pointer is held; releasing early cancels. This replaces the v1 two-step confirmation dialog and is the only pattern allowed for revoking a share or deleting a card.
- **Map:** full-bleed on mobile, 16px radius when inset, at least 45% of viewport height on the create and receiver screens. The pin is a Clay teardrop with a white centre dot.
- **Share link row:** name (semi-bold), a status pill (Live / Expired / Revoked, using the semantic colours with a 10% tint background), "expires in 23 h" in mono, and on the right icon buttons for Copy, QR and Revoke. Rows are separated by hairline dividers, not cards.
- **Status pills:** 999px radius, 12px text, tinted background, no border.
- **QR sheet:** a bottom sheet with a large QR (220px), the link name, the DIGIPIN plate and a "Print card" secondary button.
- **Inputs:** label above, 48px tall, 10px radius, 1px Hairline border, Clay 2px focus ring. Helper text and a character counter below ("42 / 200").
- **Hour presets:** segmented chips "2 h", "24 h", "72 h", "Custom".
- **Access log:** a vertical timeline with a small dot, the link name and the time in mono ("Ambulance · 14:02, 19 Sep"). Newest first.
- **Photo:** 4:3, 12px radius, with a "Door photo" label. The empty state is a dashed hairline box with a camera icon and "Add a photo of your door".
- **Loading:** skeleton blocks in the exact layout. No spinners.
- **Empty states:** one line of guidance plus the next action. Example: "No links yet. Create one for each person who needs your address."

## 5. Layout Principles
- Mobile-first single column, 16px side gutters and a 560px max content width, centred on desktop.
- Each screen has a top app bar (back arrow + title), content, and a sticky bottom action bar holding the one primary action.
- Section spacing is 24px; spacing inside a group is 12px. Grid for rows; nothing overlaps.
- Minimum tap target 44px. No horizontal scrolling at 360px width.
- **Laptop (1024px and wider): two panes.**
  - A slim top bar across the full width: wordmark, "My cards", "New card", account menu.
  - Left pane: the map, about 60% of the width, full height.
  - Right pane: a white panel, about 40%, with a hairline left border and 32px padding. It scrolls on its own.
  - The primary button sits at the bottom of the right pane, not in a sticky bar.
  - Below 1024px, the panes stack into the mobile single column.
  - Mockups: `docs/mockups/d1-new-card.png`, `d2-card.png`, `d3-receiver.png`.

## 6. Motion & Interaction
- 200ms ease-out for sheets and pills. The status pill cross-fades when a link is revoked.
- The live DIGIPIN updates as the pin is dragged. The changed characters get a quick 150ms highlight so users see the code is live.
- Respect reduced-motion settings: no animation, instant state changes.

## 7. Anti-Patterns (Banned)
- No emojis. No serif fonts in app UI. No pure black. No neon, glows or gradients.
- No centred marketing hero on app screens. No 3 equal cards in a row.
- No generic placeholder names ("John Doe", "Acme"). Use real-feeling Indian examples: "Ambulance", "Flipkart delivery", "Ravi (guest)", landmark "Blue gate, behind Hanuman temple".
- No AI copy clichés ("Elevate", "Seamless", "Unleash"). Plain words: "Share", "Revoke", "Route to door".
- No filler text like "Scroll to explore".
- Never show hyphens in the DIGIPIN. Always 3-4-3 with spaces.

## 8. New screens (Tasks 6–8)
Same look as sections 1–7; nothing new in colour or type. Mockup files to add: `s5-receiver.png`, `s6-offline.png`, `s7-print.png`, `s8-links.png` (phone) and `d4-receiver.png` (laptop), made in the Stitch project with the prompts in `docs/PLAN.md` → "Mockups". If there are no mockups, build from this text.

### 8.1 Receiver page, online (`/s/:token`)
- **Top bar:** "DigiLease" wordmark on the left (no back arrow; people arrive from a link). On the right a status chip: "Saving for offline…" (Muted), then "Saved for offline" with a check icon (Live pill).
- **Map:** about 50% of the viewport height, with the Clay door pin. After a route, the route line and a blue "you" dot.
- **Content:**
  - label "SHARED WITH YOU" and the link name ("Ravi (guest)")
  - the DIGIPIN code plate
  - the landmark text
  - the door photo (4:3)
  - mono line: "Link valid until 21 Sep, 18:00" or "No expiry"
  - text link "Preview offline map"
- **Sticky bottom bar:** primary "Route from my location". After a route, a summary row above it ("2.4 km · 9 min") and the button becomes "Update route". Under it, always, a text button "Open in maps".
- **Laptop:** two panes like `d3-receiver.png`: map left, this content in the right panel.
- **Dead link:** as `s4-dead.png`. The saved offline copy is deleted.

### 8.2 Offline map (same page, no internet)
- **Banner** across the top, Ink Navy background, white 14px text: "No internet. Showing your saved map." When the network returns: "Back online" and a "Show live map" button.
- **Map** (about 60% of the height), drawn on the phone:
  - Paper background
  - streets in #B9C2CC: main roads 4px, residential 2.5px, footpaths 1px dashed
  - the 1 km square as a dashed Muted outline
  - the saved route in Route Blue, 4px
  - the door as the Clay pin
  - "you" as a 14px Route Blue dot with a 3px white ring and a static 10%-tint accuracy circle (no pulsing)
- **Bottom sheet** (white, 16px top radius):
  - Distance, 28px semi-bold: "240 m to the door", with "straight line" in Muted under it. When a route is saved and the receiver is on it: "about 310 m along the route".
  - Two small code plates side by side, stacked below 360px wide:
    - "YOU" `4T3 96F3 KK1` with a 2px Route Blue border
    - "DOOR" `4T3 96F4 2L7` with a 2px Clay border
  - The landmark on one line and a 64px door-photo thumbnail that enlarges on tap.
  - Credit line, 12px Muted: "Streets © OpenStreetMap contributors".
- **States:**
  - **Waiting for GPS:** the YOU plate is a skeleton, with "Finding your position. Without data this can take up to a minute."
  - **Outside the square:** "You're outside the saved area" and "The door is 3.2 km away".
  - **Arrived:** within 15 m, the distance line reads "You're at the door" in Live.
  - **Location permission denied:** "Allow location to see where you are. The map and the door still show."

### 8.3 Printable QR card (`/card/:id/print/:token`)
- **Screen:**
  - top bar with a back arrow and "Print card"
  - the card preview on Paper
  - primary button "Print / Save as PDF"
  - helper text: "Prints at A6 (postcard size). Choose 'Save as PDF' in the print dialog to get a file."
- **The card** (A6 portrait, 105 × 148 mm, white, 1px Hairline border, 6 mm padding), top to bottom:
  1. A row with the small "DigiLease" wordmark on the left and "For: Wedding guests" (link name, muted) on the right.
  2. The door photo at 4:3, full width, 3 mm radius.
  3. A row: the QR at 55 mm (Ink Navy on white, a quiet zone of 4 modules), and next to it "Scan to find the door" (semi-bold) and "Open it once with internet. Near us it keeps working without signal." (muted).
  4. The DIGIPIN code plate (mono, 20 pt, Clay border).
  5. The landmark text.
  6. A footer: "Valid until 21 Sep 2026, 18:00" only when the link expires; "DIGIPIN by India Post" in small muted text.
- **Print CSS:** only the card prints, and it must read in black and white.

### 8.4 Card page changes (`/card/:id`)
- Hour presets: "2 h", "24 h", "72 h", "No expiry", "Custom".
- Helper under the link form: "Receivers can keep an offline copy until the link expires."
- **Link row:**
  - mono "No expiry" in place of "expires in 23 h" for those links
  - icon buttons: Copy, QR, Print (a printer icon, live links only), Revoke
- The QR sheet's existing "Print card" button opens the print page.
