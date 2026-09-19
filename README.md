# PataCard

**An address you can hand over, and take back.**

India's PIN code stops at the locality, so addresses run on landmarks, and ambulances and delivery riders lose time finding the door. India Post's DIGIPIN gives every ~3.8 m square of India a 10-character code, but people can't share it safely: there's no way to say *who* sees it, *for how long*, and to take it back.

PataCard turns your DIGIPIN into an address card, with a landmark note and a door photo. You share it as separate links, one per receiver, each with an expiry. You see who opened each link and can revoke it any time. The receiver needs no app and no login: they see the exact spot and get a route to your door.

Built for the WeMakeDevs x AWS **First Commit** hackathon (Ship It track). Problem source: Shaastra 2026 (IIT Madras) x India Post, *Digital Address DPI Innovation Hackathon*.

**Live:** _URL added at deploy_ · **Demo video:** _link added at submission_

## How it works
1. Drop a pin (GPS or drag). The DIGIPIN updates live.
2. Add a landmark ("blue gate, behind temple") and a door photo.
3. Create a link per receiver: "Ambulance, 24 h", "Courier, 2 h". Each has a QR code.
4. The receiver opens the link and sees the spot, the photo and a route.
5. You see "Ambulance opened at 14:02". Revoke it, and the link dies.

## Architecture
_Diagram added in Task 8._ Amplify Hosting (React) → API Gateway HTTP API (Cognito JWT) → Lambda (Node 22) → DynamoDB + S3, with Amazon Location Service for maps and routes. Deployed with AWS SAM.

## Run it yourself
See [`docs/SETUP.md`](docs/SETUP.md).

## Credits
DIGIPIN encoder/decoder © India Post, Department of Posts. Apache License 2.0: [`INDIAPOST-gov/digipin`](https://github.com/INDIAPOST-gov/digipin). Used unmodified in `backend/src/digipin.js`.
