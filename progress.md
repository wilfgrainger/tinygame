# TinyWorld Web V0.1 Progress

**Controlling issue:** #1  
**Implementation branch:** `feat/v0.1-mobile-pwa`  
**Plan:** `docs/superpowers/plans/2026-08-17-tinyworld-web-v0.1.md`  
**Last updated:** 2026-08-17 21:13 Europe/London

## Session handoff

TinyWorld is being rebuilt as a mobile-first browser/PWA game in `wilfgrainger/tinygame`. The Roblox repository is historical only. This file is the durable cross-session handoff: every implementation session must read it first and update it before finishing.

## Constraints

- Cloudflare Free plan only: Workers Static Assets + Worker + D1.
- Android phone landscape is the V0.1 acceptance platform; desktop web is secondary.
- Google sign-in only for V0.1.
- No R2, Durable Objects, multiplayer, chat, trading, co-op, missions framework, paid mechanics, portals, pets, combat, Apple auth, or Android gameplay fork.
- Persistent value/state is server-authoritative; no per-frame API traffic.
- Real Android and family acceptance are release-blocking.
- `tinygame` is public, so standard GitHub-hosted Actions compute is free. Current account warning concerns Actions/Packages artifact storage. CI must not upload artifacts/packages; keep it storage-frugal.

## Status

| Task | Status | Evidence / next action |
|---|---|---|
| 1. Repo/build/release guards | IN PROGRESS | Feature branch created. Foundation files next. |
| 2. Worker + D1 foundation | NOT STARTED | |
| 3. Google auth + sessions | NOT STARTED | |
| 4. Profile/discovery/home persistence | NOT STARTED | |
| 5. Browser shell + PlayCanvas bootstrap | NOT STARTED | |
| 6. Touch/desktop input + movement | NOT STARTED | |
| 7. Authored non-flat world | NOT STARTED | |
| 8. Home + discoveries | NOT STARTED | |
| 9. Swimming | NOT STARTED | |
| 10. Tiny Bike | NOT STARTED | |
| 11. Tiny Raft | NOT STARTED | |
| 12. PWA + DEV + Android/family acceptance | NOT STARTED | Human/cloud credentials required for final acceptance. |

## Owner-only inputs still expected

- Google Cloud OAuth Web client ID and authorized origins.
- Cloudflare account access/configuration for DEV D1 and Worker deployment.
- Real Android device acceptance and family playtest.

## Completion rule

Do not mark V0.1 accepted until the exact candidate records both `ANDROID ACCEPTANCE: PASS` and `FAMILY ACCEPTANCE: PASS`. Missing external credentials/device evidence is `NOT RUN`, never an invented PASS.
