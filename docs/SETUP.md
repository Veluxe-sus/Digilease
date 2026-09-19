# PataCard: commands you run

Run these in **PowerShell**. Paste the output back to Claude after each section.

## 1. One-time setup
```powershell
winget install -e --id Amazon.AWSCLI
winget install -e --id Amazon.SAM-CLI
# close and reopen PowerShell
aws --version
sam --version
node -v            # 20+ is fine locally; Lambda runs Node 22
aws configure      # IAM user access key (never root keys); region ap-south-1; output json
aws sts get-caller-identity
```

In the AWS console:
- **Billing → Budgets → Create budget:** monthly cost budget, **$5**, with an email alert.
- **Billing → Credits:** confirm "Applicable products" covers Amazon Location Service.

On the event Discord:
- Does Amazon Location Service count for Ship It?
- What is the deadline time and timezone?

## 2. Deploy the backend (Task 2, and again after any template change)
```powershell
cd C:\Users\adlak\claude_projects\pata-card
sam validate --lint
sam build
sam deploy --guided   # first time only. Stack name: pata-card, region: ap-south-1,
                      # AllowedOrigin: http://localhost:5173, confirm changes: y,
                      # allow SAM to create IAM roles: y, save to samconfig.toml: y
sam list stack-outputs --stack-name pata-card
aws location describe-key --key-name <MapKeyName from outputs> --query Key --output text
```

Put the outputs in `frontend\.env.local`. Never commit this file:
```
VITE_API_URL=<ApiUrl>
VITE_REGION=ap-south-1
VITE_USER_POOL_ID=<UserPoolId>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId>
VITE_MAP_API_KEY=<key from describe-key>
```

## 3. Test user for curl checks (Task 3)
```powershell
aws cognito-idp sign-up --client-id <UserPoolClientId> --username you@example.com --password "<8+ chars>" --user-attributes Name=email,Value=you@example.com
aws cognito-idp admin-confirm-sign-up --user-pool-id <UserPoolId> --username you@example.com
```
Claude will give you the exact command to get an ID token at that point. It depends on the client's auth flows.

## 4. Go live on Amplify Hosting (Task 7)
1. `cd frontend; npm run build`. Zip the *contents* of `frontend\dist` (not the folder itself).
2. AWS console → Amplify → Create new app → **Deploy without Git** → upload the zip.
3. App → Hosting → Rewrites and redirects → add: source `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` → target `/index.html` → type `200 (Rewrite)`.
4. Copy the app URL (`https://<branch>.<appid>.amplifyapp.com`), then:
```powershell
sam deploy --parameter-overrides AllowedOrigin=https://<branch>.<appid>.amplifyapp.com
```
5. Open the URL on your phone.

## 5. Hand the project to another AI or account
The whole project is this folder plus its git history. Nothing else is needed.
- **Same machine:** open the folder in Claude Code or Codex. It reads `CLAUDE.md` / `AGENTS.md`, then `.claude/CHECKPOINT.md`.
- **Another machine or account:** zip the folder *without* `node_modules`, `.aws-sam` and `.env.local`, or push to a **private** GitHub repo:
  ```powershell
  gh repo create pata-card --private --source . --push
  ```
  Recreate `frontend\.env.local` there from `sam list stack-outputs` (§2). It is never committed.
- **A different AWS account:** run §1 and §2 on that account. It deploys a fresh stack.

## 6. After the hackathon (to stop costs)
```powershell
sam delete --stack-name pata-card
```
Then delete the Amplify app in the console.
