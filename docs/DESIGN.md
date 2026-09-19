# Design System: PataCard

## 1. Visual Theme & Atmosphere
A calm, civic, mobile-first utility. It should feel like a well-made government-grade tool that ordinary people trust at a stressful moment (an ambulance is on the way), not like a startup landing page. Every screen should read at a glance on a phone held in one hand, in sunlight.
- **Density:** "Daily App Balanced" (5). One task per screen and generous tap targets, but no wasted hero space.
- **Variance:** "Offset Asymmetric" (4). Left-aligned headings and content; the map is the one large visual on each screen.
- **Motion:** "Fluid CSS" (4). Gentle transitions on state changes (link created, link revoked). No decorative loops.
- **Signature element:** the DIGIPIN itself, set in a large monospace "code plate" with 3-4-3 grouping (`4T3 96F4 2L7`), like a postal stamp or a vehicle number plate. It is the brand.

## 2. Color Palette & Roles
- **Survey Paper** (#F4F6F8): page background, a cool off-white with a slight blue bias, like map paper.
- **Pure Surface** (#FFFFFF): cards, sheets and input fills.
- **Ink Navy** (#16202B): primary text and icons.
- **Slate Muted** (#56626F): secondary text, timestamps, helper text.
- **Hairline** (#D8DEE5): 1px borders and dividers.
- **Post Red** (#C3272B): the single accent, taken from India Post's red. Used for primary buttons, the DIGIPIN code-plate border, focus rings and the live map pin.
- **Semantic, not accent:**
  - Live Green (#1E7B4F): "Live" link status
  - Expired Amber (#9A6700): "Expired" status
  - Revoked Grey (#56626F): "Revoked" status, with a strikethrough on the link name
- **Route Blue** (#1F6FB2): the route line drawn on the map only.
- **Dark mode:** background #0E141A, surface #151E27, text #E4E9EE, muted #97A3AF, hairline #27323D, accent #EC5A56.
- **Never:** pure black, purple or neon, gradients on buttons or text, more than one accent.

## 3. Typography Rules
- **Display and UI:** Satoshi (fallback: system-ui). Headings are semi-bold, tight tracking (-0.01em), and controlled in size: the page title is 24–28px on mobile. Hierarchy comes from weight and colour, not huge sizes.
- **Body:** Satoshi 16px, line height 1.55, max 65 characters per line.
- **Mono:** JetBrains Mono, used for the DIGIPIN code plate (24–32px, weight 700, letter-spacing 0.08em), expiry countdowns and timestamps in the access log.
- **Labels:** 12px uppercase, letter-spacing 0.08em, Slate Muted.
- **Banned:** Inter, all serif fonts (this is software UI), fonts below 14px for anything a user must read.

## 4. Component Stylings
- **DIGIPIN code plate:** a white surface with a 2px Post Red border and 8px radius. A monospace code in 3-4-3 groups, a small "DIGIPIN" label above, and a copy icon button on the right.
- **Primary button:** Post Red fill, white text, 12px radius, 48px tall, full width on mobile. On press it moves down 1px. No glow.
- **Secondary button:** white fill, 1px Hairline border, Ink Navy text.
- **Destructive action ("Revoke"):** text button in Post Red with a confirmation step. Never a filled red button next to the primary.
- **Map:** full-bleed on mobile, 16px radius when inset, at least 45% of viewport height on the create and receiver screens. The pin is a Post Red teardrop with a white centre dot.
- **Share link row:** name (semi-bold), a status pill (Live / Expired / Revoked, using the semantic colours with a 10% tint background), "expires in 23 h" in mono, and on the right icon buttons for Copy, QR and Revoke. Rows are separated by hairline dividers, not cards.
- **Status pills:** 999px radius, 12px text, tinted background, no border.
- **QR sheet:** a bottom sheet with a large QR (220px), the link name, the DIGIPIN plate and a "Print card" secondary button.
- **Inputs:** label above, 48px tall, 10px radius, 1px Hairline border, Post Red 2px focus ring. Helper text and a character counter below ("42 / 200").
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

## 6. Motion & Interaction
- 200ms ease-out for sheets and pills. The status pill cross-fades when a link is revoked.
- The live DIGIPIN updates as the pin is dragged. The changed characters get a quick 150ms highlight so users see the code is live.
- Respect reduced-motion settings: no animation, instant state changes.

## 7. Anti-Patterns (Banned)
- No emojis. No Inter. No serif fonts. No pure black. No neon, glows or gradients.
- No centred marketing hero on app screens. No 3 equal cards in a row.
- No generic placeholder names ("John Doe", "Acme"). Use real-feeling Indian examples: "Ambulance", "Flipkart delivery", "Ravi (guest)", landmark "Blue gate, behind Hanuman temple".
- No AI copy clichés ("Elevate", "Seamless", "Unleash"). Plain words: "Share", "Revoke", "Route to door".
- No filler text like "Scroll to explore".
- Never show hyphens in the DIGIPIN. Always 3-4-3 with spaces.
