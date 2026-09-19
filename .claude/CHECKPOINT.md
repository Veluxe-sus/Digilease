# Checkpoint: PataCard

## Now
Task 0 done. Planning docs are waiting for the user's "verified". Targets: live by Sept 20 12:00 IST, submitted by 18:00 IST.

## Done
- Problem chosen: Shaastra 2026 x India Post, Digital Address DPI (DIGIPIN).
- Problem/solution brief published: https://claude.ai/artifact/YQVLt9N4wL71wjxMcKcLer (private link)
- DIGIPIN spec verified against the official repo `INDIAPOST-gov/digipin`; example output checked (`4T396F42L7`).
- Draft `backend/src/api.js`, `backend/test/api.test.js`, `backend/package.json` written. Dependencies are installed; tests have not run.
- Task 0:
  - AWS CLI 2.36.49 and SAM CLI 1.166.2 installed.
  - IAM user `vansh` (AdministratorAccess, CLI-only) created and configured.
  - Account 499567237530, region ap-south-1.
  - Budget `pata-card-5usd` ($5/month) created, with an email alert at 80% of actual spend. State OK.

## Next
1. User verifies the docs (AGENTS, SPEC, PLAN, SETUP, RESEARCH, README).
2. PLAN Task 1: review and test the existing backend code.

## Decisions
- Consent card, not a converter: India Post's portal already converts locations to codes.
- JavaScript end to end: the official DIGIPIN file runs unchanged in the browser and in Lambda.
- Serverless + Cognito: uses 7 services from the hackathon's Ship It list, at about $0 cost.
- Store the DIGIPIN cell centre, not raw GPS: what we share is exactly what the code means.
- Routes are computed in Lambda, so no routing key sits in the browser.
- CLI-only workflow: the console is used just once, to create the IAM user. The budget is set from the CLI.
- Solo build with Claude; deploy from one AWS account, the other 3 accounts are backup credits.

## Blocked
- Nothing. (The organizers can't be reached. The Location Service and deadline defaults are in AGENTS.md.)

## Handoff (for a new agent or account)
- Rules: `AGENTS.md`. Behaviour: `docs/SPEC.md`. Tasks + tools: `docs/PLAN.md`. Facts: `docs/RESEARCH.md`. User commands: `docs/SETUP.md`.
- Existing backend code is untested. Start at PLAN Task 1, not Task 2.
- AWS state: IAM user only. No stack, no Amplify app.
- On a new machine, `aws` may not be on PATH until PowerShell restarts. Full path: `C:\Program Files\Amazon\AWSCLIV2\aws.exe`.
- Don't trust this chat's memory; trust these files and `git log`.
