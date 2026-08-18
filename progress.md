# TinyWorld Web V0.1 Progress

**Controlling issue:** #1  
**Implementation PR:** #2  
**Implementation branch:** `feat/v0.1-mobile-pwa`  
**Plan:** `docs/superpowers/plans/2026-08-17-tinyworld-web-v0.1.md`  
**Last updated:** 2026-08-18 10:05 Europe/London

## Session handoff

TinyWorld is being rebuilt as a mobile-first browser/PWA game in `wilfgrainger/tinygame`. The Roblox repository is historical only. This file is the durable cross-session handoff: every implementation session must read it first and update it before finishing.

The code-owned V0.1 vertical slice is on PR #2 (`b2d40eb`). Dependencies are locked, CI is read-only and artifact-frugal, and local verification passed 26/26 tests and dist/source budgets. The Cloudflare `tinygame-dev` D1 database has been provisioned and migrated, and DEV worker session secrets have been configured. The candidate awaits Google OAuth Client ID / DEV origin configuration, DEV deployment, and real Android + family acceptance.

## Constraints

- Cloudflare Free plan only: Workers Static Assets + Worker + D1.
- Android phone landscape is the V0.1 acceptance platform; desktop web is secondary.
- Google sign-in only for V0.1.
- No R2, Durable Objects, multiplayer, chat, trading, co-op, missions framework, paid mechanics, portals, pets, combat, Apple auth, or Android gameplay fork.
- Persistent value/state is server-authoritative; no per-frame API traffic.
- Real Android and family acceptance are release-blocking.
- `tinygame` is public, so standard GitHub-hosted Actions compute is free. Current account warning concerns Actions/Packages artifact storage. CI does not upload artifacts/packages.

## Status

| Task | Status | Evidence / next action |
|---|---|---|
| 1. Repo/build/release guards | PASS | package-lock.json committed, read-only CI active, source/dist guards verified. |
| 2. Worker + D1 foundation | DEV PROVISIONED | `tinygame-dev` D1 database (4cea2e7a-7d30-47c4-991f-8cd50a6a9fea) created, `wrangler.dev.jsonc` configured, remote migration `0001_v0_1_core.sql` applied. |
| 3. Google auth + sessions | DEV SECRETS PARTIAL | `SESSION_PEPPER` and `AUTH_RATE_LIMIT_SALT` secrets set on `tinygame-dev`. Awaiting `GOOGLE_CLIENT_ID` and `ALLOWED_ORIGIN`. |
| 4. Profile/discovery/home persistence | VERIFIED | strict Zod contracts and prepared D1 persistence tested (26/26 unit/worker tests pass). |
| 5. Browser shell + PlayCanvas bootstrap | VERIFIED | one PlayCanvas app, Google UX/API client, build stamp and restrictive headers implemented. |
| 6. Touch/desktop input + movement | VERIFIED | pointer touch controls, keyboard/mouse, kinematic movement/collision and stylised player implemented. |
| 7. Authored non-flat world | VERIFIED | five-zone heightfield village, woodland, climbable mountain and harbour implemented. |
| 8. Home + discoveries | VERIFIED | enterable home, lamp save, chair/cupboard interactions, three persistent discoveries. |
| 9. Swimming | VERIFIED | bounded water/swim state and recovery logic implemented. |
| 10. Tiny Bike | VERIFIED | mounted direct-control bicycle lifecycle; no follower-transform design. |
| 11. Tiny Raft | VERIFIED | physical harbour raft with direct throttle/steering and bounded water lifecycle. |
| 12. PWA + DEV + Android/family acceptance | IN PROGRESS | manifest, service worker, original icons implemented. D1 created & migrated. Awaiting Google client ID, DEV deployment, and live Android/family acceptance. |

## Owner-only inputs / actions still expected

1. **Google OAuth Web Client ID**: Create a Web OAuth client in Google Cloud Console with authorized JS origins (`http://localhost:5173` and the DEV origin). Provide the public Client ID.
2. **DEV Origin**: Confirm your target DEV URL/origin (e.g. `https://tinygame-dev.<subdomain>.workers.dev` or custom domain).
3. **Deploy Candidate**: Set remaining secrets (`GOOGLE_CLIENT_ID`, `ALLOWED_ORIGIN`), build with client ID, and deploy `tinygame-dev`.
4. **Android Acceptance**: Run the acceptance route on a real Android phone and record evidence in `docs/quality/v0.1-android-acceptance.md`.
5. **Family Acceptance**: Uninstructed family play session recording three independently enjoyed activities plus explicit family PASS/FAIL.

## Completion rule

Do not mark V0.1 accepted until the exact candidate records both `ANDROID ACCEPTANCE: PASS` and `FAMILY ACCEPTANCE: PASS`. Missing external credentials/device evidence is `NOT RUN`, never an invented PASS.

