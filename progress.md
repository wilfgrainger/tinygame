# TinyWorld Web V0.1 Progress

**Controlling issue:** #1  
**Implementation PR:** #2  
**Implementation branch:** `feat/v0.1-mobile-pwa`  
**Plan:** `docs/superpowers/plans/2026-08-17-tinyworld-web-v0.1.md`  
**Last updated:** 2026-08-17 21:31 Europe/London

## Session handoff

TinyWorld is being rebuilt as a mobile-first browser/PWA game in `wilfgrainger/tinygame`. The Roblox repository is historical only. This file is the durable cross-session handoff: every implementation session must read it first and update it before finishing.

The code-owned V0.1 vertical slice now exists on PR #2. CI bootstrap workflow was separately merged to `main` in PR #3 so PR verification can run. The feature candidate is not release-accepted until Cloudflare/Google setup plus real Android/family evidence is recorded.

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
| 1. Repo/build/release guards | IMPLEMENTED / VERIFYING | package/build scripts, release stamp, source/dist guards and storage-frugal CI are on PR #2. Lockfile still needs capture from networked install. |
| 2. Worker + D1 foundation | IMPLEMENTED / VERIFYING | D1 migration, assets-first Wrangler config, router and envelopes implemented. |
| 3. Google auth + sessions | IMPLEMENTED / VERIFYING | JOSE verification, opaque hashed sessions, secure cookie, origin check and hashed-IP rate limit implemented. Real Google client not configured yet. |
| 4. Profile/discovery/home persistence | IMPLEMENTED / VERIFYING | strict Zod contracts and prepared D1 persistence implemented. |
| 5. Browser shell + PlayCanvas bootstrap | IMPLEMENTED / VERIFYING | one PlayCanvas app, Google UX/API client, build stamp and restrictive headers implemented. |
| 6. Touch/desktop input + movement | IMPLEMENTED / VERIFYING | pointer touch controls, keyboard/mouse, kinematic movement/collision and stylised player implemented. |
| 7. Authored non-flat world | IMPLEMENTED / VERIFYING | five-zone heightfield village, woodland, climbable mountain and harbour implemented; no universal flat slab. |
| 8. Home + discoveries | IMPLEMENTED / VERIFYING | enterable home, lamp save, chair/cupboard interactions, three persistent discoveries. |
| 9. Swimming | IMPLEMENTED / VERIFYING | bounded water/swim state and recovery logic implemented. |
| 10. Tiny Bike | IMPLEMENTED / VERIFYING | mounted direct-control bicycle lifecycle; no follower-transform design. |
| 11. Tiny Raft | IMPLEMENTED / VERIFYING | physical harbour raft with direct throttle/steering and bounded water lifecycle. |
| 12. PWA + DEV + Android/family acceptance | PARTIAL / EXTERNAL GATES | manifest, service worker, original icons and acceptance template implemented. Cloudflare DEV, Google DEV, Android and family evidence remain NOT RUN. |

## Owner-only inputs / actions still expected

1. Create/configure the Google OAuth Web client and provide the public client ID; authorize localhost and the final Cloudflare DEV HTTPS origin.
2. Create/configure Cloudflare `tinygame-dev` D1 and Worker values/secrets, then deploy the exact candidate to DEV.
3. Run the acceptance route on a real Android phone and record evidence in `docs/quality/v0.1-android-acceptance.md`.
4. Let the family play without mission instructions and record three independently enjoyed activities plus explicit family PASS/FAIL.

## Completion rule

Do not mark V0.1 accepted until the exact candidate records both `ANDROID ACCEPTANCE: PASS` and `FAMILY ACCEPTANCE: PASS`. Missing external credentials/device evidence is `NOT RUN`, never an invented PASS.
