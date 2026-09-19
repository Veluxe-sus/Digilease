# PataCard: verified research (checked 2026-09-19)

Everything here was checked against the source linked. Re-check only if a source is older than the build.

## The hackathon: WeMakeDevs x AWS "First Commit"
Source: https://www.wemakedevs.org/aws/first-commit
- **Dates:** Sept 17–20, 2026 (hybrid). Optional in-person day Sept 19, Bangalore. The deadline time is **not stated**; ask on Discord.
- **Rule:** "Project work starts when the clock does."
- **Tracks:**
  - **Ship It:** "Deploy it live on AWS and hand us a URL." Architecture is part of scoring. First prize ₹2,00,000 + $3,000 credits.
  - **Build It:** local, open-source AWS tools, no account needed.
  - **Best UI:** open to either track.
- **Services listed for Ship It:** SageMaker AI · EKS, ECS, Fargate · Lambda, API Gateway, Step Functions · EC2, Lightsail, App Runner, Amplify Hosting · S3, DynamoDB, RDS, Aurora · Cognito · CloudFront, Route 53, EventBridge, SQS, SNS, CloudWatch.
  - The page does not say whether this list is complete or required.
  - **Amazon Location Service and Bedrock are not mentioned anywhere.**
- **Judging:** idea and impact, AWS usage ("mandatory to win"), learning, execution, demo video.
- **Submission:** a 3-minute demo video plus the URL; a blog post is optional.
- **Team size:** 1–4. New accounts get up to $200 in credits; teams can request $100 more through a form.

## The problem source
- Shaastra 2026 (IIT Madras) x India Post, **Digital Address DPI Innovation Hackathon**: https://unstop.com/hackathons/digital-address-dpi-innovation-hackathon-india-post-digital-governance-summit-shaastra-shaastra-2026-iit-madr-1587128
- Only the title is publicly readable. The framing is ours.

## DIGIPIN
Sources: https://github.com/INDIAPOST-gov/digipin (official) · https://www.theweek.in/news/sci-tech/2025/05/31/what-is-digipin-india-new-technology-postal-geo-address-system-department-of-posts.html
- Launched **27 May 2025** by the Department of Posts with IIT Hyderabad and ISRO NRSC.
- **License:** Apache 2.0 (repo README and LICENSE file).
- **Algorithm** (`src/digipin.js`):
  - Grid, row 0 = north: `F C 9 8 / J 3 2 7 / K 4 5 6 / L M P T`
  - Bounds: latitude 2.5–38.5, longitude 63.5–99.5
  - 10 levels of 4×4 subdivision give a cell about 3.8 m square
- **Format:**
  - 10 continuous characters from `23456789CJKLMPFT`, case-insensitive
  - hyphens are not allowed
  - display may group as 3-4-3 with spaces
- **Decode** returns the cell centre to 6 decimal places.
- **Checked:** `getDigiPin(13.11179621, 80.20264269)` → `4T396F42L7`, which matches the official example.

## Why the problem matters
- The 6-digit PIN only identifies a locality or taluka; poor addressing delays police, fire, ambulance and disaster relief (The Week).
- DHRUVA (Digital Hub for Reference and Unique Virtual Address) is India Post's planned consent-based address ecosystem. Coverage notes these gaps (https://dineshgadhavi.substack.com/p/digipin-india-posts-verified-digital):
  - citizens must look up their own code
  - DIGIPIN is not yet required even for booking postal articles
  - consent sharing isn't operational
  - people still rely on landmarks
- India Post's "Know Your DIGIPIN" portal already converts a location to a code. **So a plain converter is not novel.**
- A "20–25% unstructured addresses" figure circulates in blogs. No primary source was found, so **don't use it**.

## Amazon Location Service
Sources: https://aws.amazon.com/location/pricing/ · https://docs.aws.amazon.com/location/latest/developerguide/
- **Free trial, first 3 months:**
  - Maps: 500,000 tiles and 5,000 static maps
  - Places: 20,000 geocode / reverse / search / get-place calls and 10,000 autocomplete calls
  - Routes: 10,000 route calculations (Core)
- Per-request prices were not visible on the pricing page; none are assumed.
- Available in ap-south-1 (Mumbai). Confirm with a real call at deploy time.
- **India political view:** add `political-view=IND` to the v2 style URL.
- **Map style (MapLibre):** `https://maps.geo.{region}.amazonaws.com/v2/styles/Standard/descriptor?key={apiKey}`
- **API key restrictions** (example): `AllowActions ["geo-maps:*"]`, `AllowResources ["arn:aws:geo-maps:{region}::provider/default"]`, plus `AllowReferers`.
- **Routes v2** (`@aws-sdk/client-geo-routes`, `CalculateRoutesCommand`):
  - positions are `[lon, lat]`
  - `LegGeometryFormat: "Simple"` returns `Legs[].Geometry.LineString`; the default is FlexiblePolyline
  - `Car` travel mode is billed at the Core price

## Learned while deploying (2026-09-19)
- **SAM HttpApi silently drops `CorsConfiguration` when `AllowOrigins` is built with `!If`.** `sam validate --lint` still passes. Use plain lists: `["http://localhost:5173", !Ref AllowedOrigin]`. Check with `aws apigatewayv2 get-api ... --query CorsConfiguration`.
- **On a stack update, CloudFormation keeps the previous parameter value**, not the template's new default. Pass `--parameter-overrides` when a parameter's meaning changes.
- **Amazon Location Routes v2 works in ap-south-1.** `CalculateRoutes` with `LegGeometryFormat: "Simple"` + `LegAdditionalFeatures: ["Summary"]` returned 381 points, 10,361 m and 1,582 s for Chennai Central to the DIGIPIN example point.
- **MapLibre GL v6 (6.10) under Vite:** named exports only (no default). The worker is loaded from `new URL('./maplibre-gl-worker.mjs', import.meta.url)`, which breaks once Vite pre-bundles it: the style never finishes loading and **no error is shown**. The fix is to copy `maplibre-gl-worker.mjs` + `maplibre-gl-shared.mjs` into `public/maplibre/` and call `setWorkerUrl("/maplibre/maplibre-gl-worker.mjs")`.
- AWS's "Standard" v2 style logs many `Expected value to be of type number, but found null` console warnings. They come from AWS's own layer filters and are harmless.
- **Competitor: MapmyIndia eLoc (2017), now Mappls Pin.** A 6-character digital address code for any place in India, shareable, aimed at deliveries (https://about.mappls.com/mappls-pin/, https://www.medianama.com/2017/02/223-mapmyindia-eloc-launch/). Also Google Plus Codes and what3words. PataCard's distinct part is per-receiver consent (expiry, revoke, access log) on the official DIGIPIN, not the code itself.

## OpenStreetMap data for the offline map (checked 2026-09-20)
- **Overpass API public instance** (https://wiki.openstreetmap.org/wiki/Overpass_API): an app should stay under about 100 queries and 10 MB a day, send a `User-Agent` or `Referer` that names the app, and never run requests in parallel. Cache results and rate-limit. On a 429 or 406, wait 30 s before trying again. Commercial use should run its own server or pay for one. The page says the main instance is often overloaded. PataCard makes at most one query per card and keeps the result in S3, which stays well inside these limits for a hackathon demo.
- **Credit** (https://osmfoundation.org/wiki/Licence/Attribution_Guidelines): "© OpenStreetMap contributors" is accepted. The word "OpenStreetMap" must link to https://www.openstreetmap.org/copyright, sit in a corner of the map or next to it, and be visible without tapping anything.
