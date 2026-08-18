# TinyWorld Web V0.1 Progress

**Controlling issue:** #1  
**Implementation PR:** #2  
**Implementation branch:** `feat/v0.1-mobile-pwa`  
**Plan:** `docs/superpowers/plans/2026-08-17-tinyworld-web-v0.1.md`  
**Last updated:** 2026-08-18 11:15 Europe/London

## Session handoff

TinyWorld is being rebuilt as a mobile-first browser/PWA game in `wilfgrainger/tinygame`. The Roblox repository is historical only. This file is the durable cross-session handoff: every implementation session must read it first and update it before finishing.

The code-owned V0.1 vertical slice is on PR #2 (`ea8bd9e`). The Cloudflare `tinygame-dev` D1 database and Worker are fully provisioned, migrated, and deployed at `https://tinygame-dev.zerobytemode.workers.dev` with Google OAuth Client ID and session secrets configured. 

The visual, audio, and gameplay polish overhaul has been implemented:
- **Zero-byte procedural Web Audio engine (`SoundFx.ts`)**: Footsteps across terrain surfaces, bicycle bell "ding-ding!", water splash & crawl strokes, jumping, landing squash thuds, lamp switches, cupboard clicks, and pentatonic discovery fanfares.
- **Natural Biome & Path Terrain (`meshFactory.ts`)**: 64x64 undulating terrain mesh with vertex-colored blending for sand/dirt village paths, woodland moss, rocky scree, golden beach, and meadow grass.
- **Atmospheric Horizon & Particle Effects (`Atmosphere.ts`)**: Distance depth fog matching clear color, drifting low-poly fluffy clouds, stone chimney smoke particle emitters, village fountain spray, and animated 3D floating interaction markers.
- **Detailed Village Architecture & Props (`WorldBuilder.ts`)**: Plastered village buildings with timber posts, glowing window frames with flowerboxes, stone chimneys, two-tier village fountain with lily pads, wooden benches, birch/pine/oak tree varieties, forest clearing tent & campfire, summit flagpole & overlook, and harbour dock crates & barrels.
- **Procedural Explorer Character & Animation (`PlayerView.ts`)**: Adorable Explorer character (cap with brim, goggles band, eyes with specular highlights, blush cheeks, leather backpack with bedroll) with dynamic walk/run gait, body bob, arm swing, turn banking, landing squash-and-stretch, bike pedaling kinematics, and prone swimming crawl.
- **Polished Glassmorphism HUD (`Hud.ts`, `styles.css`)**: Frosted virtual joystick, jump & action buttons, animated celebratory Discovery Banner, and cloud save status indicator.

All automated prerequisite tests pass (26/26 unit & worker tests, 13/13 browser tests, source contract, and dist budget). The candidate is awaiting real Android device route testing and uninstructed family gameplay acceptance.

## Constraints

- Cloudflare Free plan only: Workers Static Assets + Worker + D1.
- Android phone landscape is the V0.1 acceptance platform; desktop web is secondary.
- Google sign-in only for V0.1.
- No R2, Durable Objects, multiplayer, chat, trading, co-op, missions framework, paid mechanics, portals, pets, combat, Apple auth, or Android gameplay fork.
- Persistent value/state is server-authoritative; no per-frame API traffic.
- Real Android and family acceptance are release-blocking.
- `tinygame` is public, so standard GitHub-hosted Actions compute is free. CI uses 0 bytes of GitHub storage (no artifact uploads, read-only permissions).

## Status

| Task | Status | Evidence / next action |
|---|---|---|
| 1. Repo/build/release guards | PASS | package-lock.json committed, read-only CI active, source/dist guards verified. |
| 2. Worker + D1 foundation | DEV PROVISIONED | `tinygame-dev` D1 database (4cea2e7a-7d30-47c4-991f-8cd50a6a9fea) created, `wrangler.dev.jsonc` configured, remote migration `0001_v0_1_core.sql` applied. |
| 3. Google auth + sessions | DEV CONFIGURED | `GOOGLE_CLIENT_ID`, `ALLOWED_ORIGIN`, `SESSION_PEPPER`, and `AUTH_RATE_LIMIT_SALT` secrets set on `tinygame-dev`. |
| 4. Profile/discovery/home persistence | VERIFIED | strict Zod contracts and prepared D1 persistence tested (26/26 unit/worker tests pass). |
| 5. Browser shell + PlayCanvas bootstrap | VERIFIED | one PlayCanvas app, Google UX/API client, build stamp and restrictive headers implemented. |
| 6. Touch/desktop input + movement | VERIFIED | pointer touch controls, keyboard/mouse, kinematic movement/collision and procedural Explorer player. |
| 7. Authored non-flat world + atmosphere | VERIFIED | five-zone vertex-blended terrain, fog, clouds, chimney smoke, fountain spray, and detailed architecture. |
| 8. Home + discoveries + audio | VERIFIED | enterable home, lamp save, chair/cupboard interactions, Web Audio procedural sound effects synthesizer, three persistent discoveries. |
| 9. Swimming | VERIFIED | bounded water/swim state with prone crawl animation and recovery logic implemented. |
| 10. Tiny Bike | VERIFIED | mounted direct-control bicycle with pedaling animation, turning bank, and bicycle bell sound. |
| 11. Tiny Raft | VERIFIED | physical harbour raft with water bobbing, direct throttle/steering and bounded water lifecycle. |
| 12. PWA + DEV + Android/family acceptance | DEV DEPLOYED / AWAITING EVIDENCE | DEV live at `https://tinygame-dev.zerobytemode.workers.dev`. Real Android route and family playtest pending. |

## Owner-only inputs / actions still expected

1. **Android Acceptance**: Run the acceptance route on a real Android phone (Chrome landscape) and record evidence in `docs/quality/v0.1-android-acceptance.md`.
2. **Family Acceptance**: Uninstructed family play session recording three independently enjoyed activities plus explicit family PASS/FAIL.

## Completion rule

Do not mark V0.1 accepted until the exact candidate records both `ANDROID ACCEPTANCE: PASS` and `FAMILY ACCEPTANCE: PASS`. Missing external credentials/device evidence is `NOT RUN`, never an invented PASS.
