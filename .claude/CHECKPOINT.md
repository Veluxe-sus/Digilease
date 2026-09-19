# Checkpoint: PataCard

## Now
Docs verified by the user. Task 1 done (10/10 backend tests pass). Next: Task 2, `template.yaml`. Deadline Sept 20 EOD; targets: live by 12:00 IST, submitted by 18:00 IST.

## Done
- Problem chosen: Shaastra 2026 x India Post, Digital Address DPI (DIGIPIN).
- Problem/solution brief published: https://claude.ai/artifact/YQVLt9N4wL71wjxMcKcLer (private link)
- DIGIPIN spec verified against the official repo `INDIAPOST-gov/digipin`; example output checked (`4T396F42L7`).
- Docs: AGENTS, CLAUDE, RESEARCH, SPEC, PLAN, SETUP, README draft, DESIGN.
- Design: `docs/DESIGN.md` + 6 Stitch mockups in `docs/mockups/` (phone s1/s2/s4, laptop d1-d3; Stitch project 2246405162473946986).
- Task 1: `backend/src/api.js` reviewed against SPEC, 10/10 tests pass. Fixes:
  - owner routes return 401 when there's no JWT subject
  - route distance and time are summed from leg overviews (`LegAdditionalFeatures: ["Summary"]`), because `Route.Summary` is optional
- Known gap: a card created with `photoType` whose upload never happened gets a `photoUrl` to a missing object. The frontend must hide the image on error.
- Task 0: AWS CLI 2.36.49 + SAM 1.166.2; IAM user `vansh` (CLI-only, admin), account 499567237530, ap-south-1; budget `pata-card-5usd` ($5/month, alert at 80%).

## Next
1. PLAN Task 2: write `template.yaml`, run `sam validate --lint`; the user runs `sam build` + `sam deploy --guided`.
2. PLAN Task 3: curl smoke test on AWS.

## Decisions
- Consent card, not a converter: India Post's portal already converts locations to codes.
- JavaScript end to end: the official DIGIPIN file runs unchanged in the browser and in Lambda.
- Serverless + Cognito: uses 7 services from the hackathon's Ship It list, at about $0 cost.
- Store the DIGIPIN cell centre, not raw GPS: what we share is exactly what the code means.
- Routes are computed in Lambda, so no routing key sits in the browser.
- A website, not an app: receivers open a link with no install. Mobile-first; two panes at 1024px and wider.
- CLI-only workflow: the console is used just once, to create the IAM user.
- Location Service stays even without organizer confirmation (see AGENTS.md).

## Blocked
- Nothing.

## Handoff (for a new agent or account)
- Rules: `AGENTS.md`. Behaviour: `docs/SPEC.md`. Tasks + tools: `docs/PLAN.md`. Facts: `docs/RESEARCH.md`. UI: `docs/DESIGN.md` + `docs/mockups/`. User commands: `docs/SETUP.md`.
- Backend code is tested (Task 1 done). Continue at PLAN Task 2.
- AWS state: IAM user and budget only. No stack, no Amplify app.
- `aws` may not be on PATH until PowerShell restarts. Full path: `C:\Program Files\Amazon\AWSCLIV2\aws.exe`.
- Don't trust this chat's memory; trust these files and `git log`.
