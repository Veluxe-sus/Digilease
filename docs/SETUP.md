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
```

**IAM user for the CLI (console, once):**
1. IAM → Users → Create user. Leave "AWS Management Console access" **unchecked**.
2. Permissions: **Attach policies directly** → **AdministratorAccess** → Create user.
3. User → Security credentials → Create access key → "Command Line Interface (CLI)" → create. The secret is shown once.
4. Never paste the keys into chat, files or git. Delete the key after the hackathon.

```powershell
aws configure      # the access key above; region ap-south-1; output json
aws sts get-caller-identity   # should show arn:aws:iam::<account>:user/<name>
```

**$5 budget alarm (CLI, no console needed).** Put your email on the first line:
```powershell
$email = "you@example.com"
$acct  = aws sts get-caller-identity --query Account --output text
@{BudgetName="pata-card-5usd";BudgetLimit=@{Amount="5";Unit="USD"};TimeUnit="MONTHLY";BudgetType="COST"} | ConvertTo-Json | Set-Content -Encoding ascii "$env:TEMP\budget.json"
ConvertTo-Json -Depth 5 @(@{Notification=@{NotificationType="ACTUAL";ComparisonOperator="GREATER_THAN";Threshold=80;ThresholdType="PERCENTAGE"};Subscribers=@(@{SubscriptionType="EMAIL";Address=$email})}) | Set-Content -Encoding ascii "$env:TEMP\notify.json"
aws budgets create-budget --account-id $acct --budget "file://$env:TEMP\budget.json" --notifications-with-subscribers "file://$env:TEMP\notify.json"
aws budgets describe-budgets --account-id $acct --query "Budgets[].[BudgetName,BudgetLimit.Amount]" --output table
```
You get an email when actual spend passes $4 (80% of $5).

**Optional (console only):** Billing → Credits → check that "Applicable products" covers Amazon Location Service.

On the event Discord:
- Does Amazon Location Service count for Ship It?
- What is the deadline time and timezone?

## 2. Deploy the backend (Task 2, and again after any template change)
```powershell
cd C:\Users\adlak\claude_projects\pata-card
sam validate --lint
sam build
sam deploy --guided   # first time only; answers below
sam list stack-outputs --stack-name pata-card
aws location describe-key --key-name <MapKeyName from outputs> --query Key --output text
```

Answers for `sam deploy --guided`:

| Prompt | Answer |
|---|---|
| Stack Name | `pata-card` |
| AWS Region | `ap-south-1` |
| Parameter AllowedOrigin | press Enter (keeps `none` until the site exists) |
| Confirm changes before deploy | `y` |
| Allow SAM CLI IAM role creation | `Y` |
| Disable rollback | `N` |
| "ViewShare / RouteToShare has no authentication. Is this okay?" | `y` (the two receiver routes are public on purpose) |
| Save arguments to configuration file | `Y` (use the default file name and environment) |
| "Deploy this changeset?" | `y` |

Later deploys: `sam build; sam deploy` (it reuses `samconfig.toml`).

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
Get an ID token (the client allows `USER_PASSWORD_AUTH` for exactly this):
```powershell
$env:TOKEN = aws cognito-idp initiate-auth --client-id <UserPoolClientId> --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=you@example.com,PASSWORD="<password>" --query AuthenticationResult.IdToken --output text
```
Send it as `Authorization: <token>`. Use the ID token, not the access token: the API checks the audience claim, which only the ID token carries.

## 4. Go live on Amplify Hosting (Task 7)
1. `cd frontend; npm run build`. Zip the *contents* of `frontend\dist` (not the folder itself).
2. AWS console → Amplify → Create new app → **Deploy without Git** → upload the zip.
3. App → Hosting → Rewrites and redirects → add: source `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` → target `/index.html` → type `200 (Rewrite)`.
4. Copy the app URL (`https://<branch>.<appid>.amplifyapp.com`), then:
```powershell
sam build; sam deploy --parameter-overrides AllowedOrigin=https://<branch>.<appid>.amplifyapp.com
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
