# PataCard: rules for any AI agent

PataCard makes consent-based DIGIPIN address cards. Built for the WeMakeDevs x AWS First Commit hackathon, Ship It track (live on AWS, public URL, 3-minute demo video). Build window Sept 17–20, 2026.

This file is the single source of rules. It works for Claude Code (through `CLAUDE.md`), Codex, and any other agent.

## Start of every session
1. Read `.claude/CHECKPOINT.md`. Say in one line where the work stands.
2. Read `docs/PLAN.md` and find the next unchecked task. Read `docs/SPEC.md` for behaviour and `docs/RESEARCH.md` for verified facts. Don't redo that research. For any UI work, read `docs/DESIGN.md` and match `docs/mockups/`.
3. Use the skills and MCP servers `docs/PLAN.md` lists for that task. If your agent doesn't have them, follow the fallback written next to each one.
4. Before any code: say what you will change and which files. Wait for the user's go.

## Working agreement with the user
- Plan first. New tasks, or anything touching 3+ files, get a short plan and the user's approval before code.
- Ask one question at a time, and only when the answer changes the work.
- Do what was asked: no extra files, features or abstractions.
- Report honestly: failing tests, skipped steps and unverified claims get said plainly, with the output.
- Say before anything costs money, and never trigger a paid action without explicit approval.
- Check library/API docs before writing code against them. Never code AWS SDK calls from memory.

## Stack
- Frontend: React + Vite (JavaScript, no TypeScript), MapLibre GL, `aws-amplify` for Cognito login, `qrcode`. Hosted on Amplify Hosting.
- Backend: one Node 22 Lambda (`backend/src/api.js`) behind an API Gateway HTTP API. Cognito JWT authorizer on owner routes.
- Data: DynamoDB (Cards, Shares, Access); private S3 bucket for door photos.
- Maps: Amazon Location Service. Map tiles use a browser API key; routes are called from Lambda with its IAM role.
- Infrastructure as code: one SAM `template.yaml`. Region `ap-south-1` (Mumbai).

## Hard rules
- **DIGIPIN code is India Post's, verbatim.** `backend/src/digipin.js` must never be edited.
  - The frontend copy `frontend/src/lib/digipin.js` is identical plus one appended `export` line. A test enforces this.
  - Keep `DIGIPIN-LICENSE` (Apache 2.0) next to it.
- **DIGIPIN format:** store 10 continuous characters, no hyphens. Display in 3-4-3 groups with spaces (`4T3 96F4 2L7`).
- **The server computes the DIGIPIN.** Never trust a code sent by the browser.
- **Nothing is public except through a live share link** (not revoked, `expiresAt` in the future). Check `expiresAt` in code; DynamoDB TTL deletes late.
- **The user runs all infrastructure:** installs, `aws configure`, `sam deploy`, console clicks, anything touching credentials. Print the exact command, then wait for their output. Never guess which shell or account a command lands in.
- Never commit secrets: `.env*`, `samconfig.toml` overrides with keys, AWS credentials, the map API key.
- Validate every input at the API boundary (limits in SPEC.md).
- Keep files under 500 lines. One Lambda, one template. No new abstractions or dependencies unless PLAN.md lists them.
- Never cut the consent flow (share → view → revoke → dead link). It is the pitch.

## Commands
- Backend tests: `cd backend && npm test` (Node's built-in `node:test`, no framework).
- Frontend dev: `cd frontend && npm run dev`.
- Frontend build: `cd frontend && npm run build`.
- Deploy: see `docs/SETUP.md`. The user runs it.

## Settled without organizer input (the user can't reach them)
- **Amazon Location Service stays.**
  - It isn't on the Ship It list, but the judging rule says "Using an AWS open-source project or AWS services is mandatory to win".
  - The architecture already rests on 7 listed services: Amplify Hosting, API Gateway, Lambda, DynamoDB, S3, Cognito, CloudWatch.
- **Deadline: Sept 20, 2026, end of day** (confirmed by the user). Targets:
  - live on AWS by **Sept 20, 12:00 IST**
  - video and submission by **Sept 20, 18:00 IST**

## Checkpoint and handoff
- Rewrite `.claude/CHECKPOINT.md` (don't append to it) whenever a task finishes, a decision is made, or something blocks. Keep it under 40 lines.
- Commit after every task with a plain message ("Task 2: SAM template"), so the next agent sees a clean history.
- Before ending a session, make sure CHECKPOINT's "Next" says exactly what the next agent should do first.
