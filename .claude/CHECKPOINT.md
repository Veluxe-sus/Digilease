# Checkpoint: PataCard

## Now
Planning documents written and waiting for the user to verify them. No code runs until they approve.

## Done
- Problem chosen: Shaastra 2026 x India Post, Digital Address DPI (DIGIPIN).
- Problem/solution brief published: https://claude.ai/artifact/YQVLt9N4wL71wjxMcKcLer
- DIGIPIN spec verified against the official repo `INDIAPOST-gov/digipin`.
- Official `digipin.js` + Apache 2.0 license downloaded; example output checked (`4T396F42L7`).
- Draft `backend/src/api.js`, `backend/test/api.test.js`, `backend/package.json` written. Not installed, not tested.

## Next
1. User verifies CLAUDE.md, SPEC.md, PLAN.md, SETUP.md, README.md, .gitignore.
2. PLAN Task 0 (user): install AWS CLI + SAM CLI, `aws configure`, $5 budget alarm, ask on Discord.
3. PLAN Task 1: review and test the existing backend code.

## Decisions
- Consent card, not a converter: India Post's portal already converts locations to codes.
- JavaScript end to end: the official DIGIPIN file runs unchanged in the browser and in Lambda.
- Serverless + Cognito: uses 7 services from the hackathon's Ship It list, at about $0 cost.
- Store the DIGIPIN cell centre, not raw GPS: what we share is exactly what the code means.
- Routes are computed in Lambda, so no routing key sits in the browser.
- Solo build with Claude; deploy from one AWS account, the other 3 accounts are backup credits.

## Blocked
- AWS CLI and SAM CLI are not installed on this machine (user, Task 0).
- Does Amazon Location Service count for Ship It? Deadline time? (User asks on Discord.)

## Handoff (for a new agent or account)
- Rules: `AGENTS.md`. Behaviour: `docs/SPEC.md`. Tasks + tools: `docs/PLAN.md`. Facts: `docs/RESEARCH.md`. User commands: `docs/SETUP.md`.
- Existing backend code is untested. Start at PLAN Task 1, not Task 2.
- AWS state: nothing deployed yet. No stack, no Amplify app.
- Don't trust this chat's memory; trust these files and `git log`.
