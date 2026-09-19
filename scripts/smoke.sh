#!/usr/bin/env bash
# PataCard live smoke test (PLAN Task 3). Prints statuses and non-secret fields only.
set -u
AWS="${AWS:-aws}"   # Windows Git Bash: AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe" bash scripts/smoke.sh
STACK="${STACK:-pata-card}"
OUT() { "$AWS" cloudformation describe-stacks --region ap-south-1 --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
API=$(OUT ApiUrl)
POOL=$(OUT UserPoolId)
CLIENT=$(OUT UserPoolClientId)
USER=smoke-test@patacard.invalid
PASS="Pc$(node -e 'console.log(require("crypto").randomBytes(12).toString("hex"))')a1"
J() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const o=JSON.parse(s);console.log($1)})"; }

"$AWS" cognito-idp admin-create-user --region ap-south-1 --user-pool-id $POOL --username $USER \
  --user-attributes Name=email,Value=$USER Name=email_verified,Value=true --message-action SUPPRESS >/dev/null 2>&1
"$AWS" cognito-idp admin-set-user-password --region ap-south-1 --user-pool-id $POOL --username $USER --password "$PASS" --permanent
TOKEN=$("$AWS" cognito-idp initiate-auth --region ap-south-1 --client-id $CLIENT --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=$USER,PASSWORD="$PASS" --query AuthenticationResult.IdToken --output text)
echo "token length: ${#TOKEN}"
H=(-H "authorization: $TOKEN" -H "content-type: application/json")

echo "1. create card"
R=$(curl -s -w '\n%{http_code}' "${H[@]}" -X POST $API/cards -d '{"lat":13.11179621,"lon":80.20264269,"landmark":"Blue gate, behind Hanuman temple","photoType":"image/png"}')
BODY=$(echo "$R" | head -n -1); echo "   status $(echo "$R" | tail -1)"
echo "$BODY" | J '"   digipin="+o.card.digipin+" lat="+o.card.lat+" lon="+o.card.lon+" upload="+(!!o.upload)'
CARD=$(echo "$BODY" | J 'o.card.cardId')
echo "$BODY" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const u=JSON.parse(s).upload;const a=Object.entries(u.fields).flatMap(([k,v])=>['-F',k+'='+v]);console.log(JSON.stringify([u.url,...a]))})" > /tmp/up.json

echo "2. upload door photo via presigned POST"
node -e 'const b=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==","base64");require("fs").writeFileSync("/tmp/door.png",b)'
mapfile -t UP < <(node -e 'JSON.parse(require("fs").readFileSync("/tmp/up.json","utf8")).forEach(x=>console.log(x))')
echo "   status $(curl -s -o /dev/null -w '%{http_code}' "${UP[@]:1}" -F "file=@/tmp/door.png;type=image/png" "${UP[0]}")"

echo "3. list my cards"
curl -s "${H[@]}" $API/cards | J '"   cards="+o.cards.length'

echo "4. create share link"
SH=$(curl -s -w '\n%{http_code}' "${H[@]}" -X POST $API/cards/$CARD/shares -d '{"label":"Ambulance","hours":24}')
echo "   status $(echo "$SH" | tail -1)"; TOK=$(echo "$SH" | head -n -1 | J 'o.share.token'); echo "   token length ${#TOK}"

echo "5. receiver view (no auth)"
V=$(curl -s -w '\n%{http_code}' $API/s/$TOK); echo "   status $(echo "$V" | tail -1)"
echo "$V" | head -n -1 | J '"   digipin="+o.digipin+" label="+o.label+" landmark="+o.landmark'
PHOTO=$(echo "$V" | head -n -1 | J 'o.photoUrl')
echo "   photo GET status $(curl -s -o /dev/null -w '%{http_code}' "$PHOTO")"

echo "6. route (Chennai Central -> card)"
RT=$(curl -s -w '\n%{http_code}' -H "content-type: application/json" -X POST $API/s/$TOK/route -d '{"fromLat":13.0827,"fromLon":80.2707}')
echo "   status $(echo "$RT" | tail -1)"
echo "$RT" | head -n -1 | J '"   points="+(o.line||[]).length+" distanceMeters="+o.distanceMeters+" durationSeconds="+o.durationSeconds+(o.error?" error="+o.error:"")'

echo "7. access log"
curl -s "${H[@]}" $API/cards/$CARD/access | J '"   entries="+o.access.length+" first="+JSON.stringify(o.access[0])'

echo "8. card page shows link status"
curl -s "${H[@]}" $API/cards/$CARD | J '"   shares="+JSON.stringify(o.shares.map(s=>s.label+":"+s.status))'

echo "9. revoke, then receiver view again"
echo "   revoke status $(curl -s -o /dev/null -w '%{http_code}' "${H[@]}" -X DELETE $API/shares/$TOK)"
echo "   view after revoke $(curl -s -w ' %{http_code}' $API/s/$TOK)"

echo "10. bad input"
echo "   London coords -> $(curl -s -w ' %{http_code}' "${H[@]}" -X POST $API/cards -d '{"lat":51.5,"lon":-0.12}')"
echo "   blank hours -> $(curl -s -w ' %{http_code}' "${H[@]}" -X POST $API/cards/$CARD/shares -d '{"label":"x","hours":""}')"
echo "   other user's card id -> $(curl -s -w ' %{http_code}' "${H[@]}" $API/cards/00000000-0000-0000-0000-000000000000)"

echo "11. no-expiry link (hours=0): live, no expiresAt, then revoke"
NE=$(curl -s "${H[@]}" -X POST $API/cards/$CARD/shares -d '{"label":"Wedding guests","hours":0}' | J 'o.share.token')
curl -s $API/s/$NE | J '"   view digipin="+o.digipin+" expiresAt="+o.expiresAt'
echo "   revoke status $(curl -s -o /dev/null -w '%{http_code}' "${H[@]}" -X DELETE $API/shares/$NE)"
echo "   view after revoke $(curl -s -o /dev/null -w '%{http_code}' $API/s/$NE)"

echo "12. offline area: first call fetches OpenStreetMap, second is served from S3, revoked -> 410"
AT=$(curl -s "${H[@]}" -X POST $API/cards/$CARD/shares -d '{"label":"Area check","hours":1}' | J 'o.share.token')
for i in 1 2; do
  curl -s -o /tmp/area.json -w "   call $i: status %{http_code} in %{time_total}s\n" $API/s/$AT/area
  J '"   streets="+(o.streets||[]).length+" box="+JSON.stringify(o.box)+(o.error?" error="+o.error:"")' < /tmp/area.json
done
BUCKET=$(OUT PhotoBucket)
[ -n "$BUCKET" ] && echo "   in S3: $("$AWS" s3api head-object --bucket "$BUCKET" --key "areas/$CARD.json" --query ContentLength --output text 2>&1) bytes"
curl -s -o /dev/null "${H[@]}" -X DELETE $API/shares/$AT
echo "   area after revoke $(curl -s -o /dev/null -w '%{http_code}' $API/s/$AT/area)"
