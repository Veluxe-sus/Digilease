# Checkpoint: PataCard

## Now
Backend is LIVE on AWS and passes the end-to-end smoke test. Next: Task 4 (frontend skeleton + login). Deadline Sept 20 EOD; targets: live by 12:00 IST, submitted by 18:00 IST.

## Done
- Docs verified by the user: AGENTS, CLAUDE, RESEARCH, SPEC, PLAN, SETUP, DESIGN, README (with the "why not WhatsApp" table).
- Design: `docs/DESIGN.md` + 6 Stitch mockups in `docs/mockups/` (phone s1/s2/s4, laptop d1-d3).
- Task 0: AWS CLI + SAM; IAM user `vansh`; account 499567237530, ap-south-1; $5 budget alarm.
- Task 1: `api.js` reviewed, 10/10 unit tests (401 guard; route summary from legs).
- Task 2: `template.yaml` deployed as stack `pata-card`. CORS fixed (no `!If`; see RESEARCH).
  - ApiUrl `https://qqok8fblfe.execute-api.ap-south-1.amazonaws.com`
  - UserPool `ap-south-1_EAyFdvVxW`, client `3vtdlrjkje7j84h3ok8c8tt70i`
  - map key `pata-card-map-key`, bucket `pata-card-photobucket-rutsrsx2yeod`
- Task 3: `scripts/smoke.sh` passes 10/10 live checks, including a real route (10.4 km, 26 min).
  - Test user `smoke-test@patacard.invalid` exists in the pool (password random, not stored).
- Known gap: a card whose photo upload failed has a `photoUrl` to a missing object. The frontend hides the image on error.

## Next
1. Task 4: Vite React app in `frontend/`, `.env.local` from stack outputs, Amplify Auth login.
2. Task 5: owner flow (map, live DIGIPIN, save, photo, share links, QR, access log).
3. Task 6: receiver view + route. Then Task 7: Amplify Hosting + redeploy with `AllowedOrigin`.

## Decisions
- Consent card, not a converter. JavaScript end to end. Serverless + Cognito (7 Ship It services).
- Store the DIGIPIN cell centre, not raw GPS. Routes computed in Lambda (no routing key in the browser).
- A website, mobile-first; two panes at 1024px and wider.
- `AllowedOrigin` defaults to `http://127.0.0.1:5173` until the Amplify URL exists.
- The client allows USER_PASSWORD_AUTH only for CLI smoke tests; the web app uses SRP.
- The user asked Claude to run deploys; infra commands still get announced before running.

## Blocked
- Nothing.

## Handoff (for a new agent or account)
- Rules: `AGENTS.md`. Behaviour: `docs/SPEC.md`. Tasks + tools: `docs/PLAN.md`. Facts: `docs/RESEARCH.md`. UI: `docs/DESIGN.md` + `docs/mockups/`. User commands: `docs/SETUP.md`.
- Re-check the live backend any time: `AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh`.
- `aws` may not be on PATH until PowerShell restarts. Full path: `C:\Program Files\Amazon\AWSCLIV2\aws.exe`.
- Don't trust this chat's memory; trust these files and `git log`.
