# Checkpoint: PataCard

## Now
Everything before code is ready. Waiting for the user's "verified" to start PLAN Task 1. Deadline Sept 20 EOD; targets: live by 12:00 IST, submitted by 18:00 IST.

## Done
- Problem chosen: Shaastra 2026 x India Post, Digital Address DPI (DIGIPIN).
- Problem/solution brief published: https://claude.ai/artifact/YQVLt9N4wL71wjxMcKcLer (private link)
- DIGIPIN spec verified against the official repo `INDIAPOST-gov/digipin`; example output checked (`4T396F42L7`).
- Docs: AGENTS, CLAUDE, RESEARCH, SPEC, PLAN, SETUP, README draft, DESIGN.
- Design: `docs/DESIGN.md` plus 6 Stitch mockups in `docs/mockups/`.
  - Phone: new card, card, dead link. The receiver screen exists only in Stitch.
  - Laptop (two panes): new card, card, receiver.
  - Stitch project id 2246405162473946986.
- Draft `backend/src/api.js`, `backend/test/api.test.js`, `backend/package.json` written. Dependencies are installed; tests have not run.
- Task 0:
  - AWS CLI 2.36.49 and SAM CLI 1.166.2 installed.
  - IAM user `vansh` (AdministratorAccess, CLI-only) created and configured.
  - Account 499567237530, region ap-south-1.
  - Budget `pata-card-5usd` ($5/month) created, with an email alert at 80% of actual spend.

## Next
1. User says "verified".
2. PLAN Task 1: `cd backend && npm test`, then walk the user through `api.js` against SPEC.
3. PLAN Task 2: `template.yaml`.

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
- Existing backend code is untested. Start at PLAN Task 1.
- AWS state: IAM user and budget only. No stack, no Amplify app.
- `aws` may not be on PATH until PowerShell restarts. Full path: `C:\Program Files\Amazon\AWSCLIV2\aws.exe`.
- Don't trust this chat's memory; trust these files and `git log`.
