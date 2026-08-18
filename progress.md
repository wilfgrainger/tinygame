# TinyWorld Web V0.1 Progress

**Controlling issue:** #1  
**Implementation PR:** #2  
**Implementation branch:** `feat/v0.1-mobile-pwa`  
**Plan:** `docs/superpowers/plans/2026-08-17-tinyworld-web-v0.1.md`  
**Last updated:** 2026-08-18 12:37 Europe/London

## Session handoff

TinyWorld is being rebuilt as a mobile-first browser/PWA game in `wilfgrainger/tinygame`. The Roblox repository is historical only. This file is the durable cross-session handoff: every implementation session must read it first and update it before finishing.

The code-owned V0.1 vertical slice with the Brookhaven open-town roleplay overhaul (NPC villagers, house claiming, vehicle spawner, job roles, emotes, procedural town music, lush gardens/cherry blossoms/rocks), forward character mesh orientation, and verified mobile touch controls is on PR #2 (`ff5c13f`). The Cloudflare `tinygame-dev` D1 database and Worker are fully provisioned, migrated, and deployed at `https://tinygame-dev.zerobytemode.workers.dev` with Google OAuth Client ID and session secrets configured.

- **Current Candidate SHA**: `ff5c13f97232` (phantom joystick fix)
- **Previous SHAs**: `a16fc72` (Brookhaven overhaul), `937a118` (forward-facing fix)
- **PR**: PR #2 (`feat/v0.1-mobile-pwa` -> `main`)
- **Live DEV Endpoint**: `https://tinygame-dev.zerobytemode.workers.dev`
- **Current Status**: Brookhaven overhaul deployed + phantom joystick input bug fixed. Awaiting user test confirmation on mobile.

## Work Completed
1. **Zero-Byte Procedural Web Audio Engine**: Synthesizes footsteps across grass/asphalt/wood/stone, bicycle bells, water swimming/splash, jumps, landing impacts, discovery fanfares, espresso steam, cash register barcode scanner, car horns, doorbells, light switches, water hose spray, food crunch, cheer fanfare, door lock, and **looping procedural town background music** (C Major / A Minor chord progressions with melodic chime plucks).
2. **Atmospheric Environment & Shaders**: Linear depth fog, procedural moving cumulus clouds, chimney smoke particles, fountain droplets, and floating interaction markers.
3. **Procedural Explorer Character Model**: Anatomical proportions, walking/running gait with dynamic head/torso sway, turn banking, landing squash, pedaling on bike, car driving pose, hand props posture, swimming breaststroke crawl, **role uniforms** (Firefighter, Police, Barista), and **animated emotes** (Wave, Dance, Cheer, Sit).
4. **Brookhaven-Style Open Town & Roleplay Infrastructure**:
   - Paved asphalt roads with dashed white centerlines, curbs, sidewalks, and crosswalks.
   - Town Square with 4-faced Clock Tower and central Tiered Fountain.
   - **Park Gardens**: Tiered flowerbeds with red/yellow/white tulips, pink flowering cherry blossom trees.
   - **Vehicle Spawn Terminal**: Glowing terminal in town square where players can spawn custom-painted cars/bikes.
   - Enterable Town Cafe ("Bean & Berry") with espresso counter (*"brew coffee"* trigger), pastry case, and dining tables.
   - Enterable Supermarket ("Fresh Mart") with grocery aisles, produce crates (apples/oranges), and checkout register (*"barcode scanner"* trigger).
   - Enterable Town Hall & Police Station with mayor's podium (*"speech"* trigger).
   - Suburban Estate with driveway, mailbox, doorbell (*"ding-dong"*), living room sofa, kitchen fridge (*"grab ice cream"*), and bedroom with server-synced lamp.
   - **House Claiming**: Players can claim a house, lock/unlock front door.
5. **Animated NPC Villagers with Jobs**:
   - **Barista Bruno**: Apron, milk pitcher, stir/froth animation at cafe counter.
   - **Shopkeeper Sarah**: Market apron, barcode scanner swipe at register.
   - **Mayor Sterling**: Formal suit, gold sash, speech gesticulations at podium.
   - **Gardener Gary**: Straw hat, overalls, watering can pour at park flowerbed.
   - **Officer Ollie**: Navy uniform, police cap, flashlight patrol on Main St.
   - Head tracking towards player when within 6m, floating speech bubbles with role-themed dialogue when within 3.5m.
6. **Roleplay Handheld Props & Vehicles**:
   - Quick Props Drawer in HUD: Coffee mug, Strawberry Ice Cream cone, Flashlight (with real-time forward spotlight cone), buoyant Red Balloon, and Fire Hose (keys `1`-`5`, `0`).
   - **Use Prop button**: Sip coffee (6s speed boost!), eat ice cream, spray water hose.
   - Drivable 4-wheeled convertible mini-car with throttle, reverse, steering wheel turning, spinning wheels, and horn button (key `H`).
   - **Vehicle Spawner Dock**: Spawn Red/Blue/Yellow cars or Bikes from HUD menu.
   - Town cruiser bicycle and harbour raft.
7. **Glassmorphism HUD & Notifications**: Top bar pills (Items, Jobs, Emotes, Vehicle, Music, Keys), modal dock drawers, virtual joystick, dynamic context-sensitive action button, horn button, celebratory discovery banners, NPC speech bubbles, and save state indicator.
8. **Phantom Joystick Fix (`ff5c13f`)**: Added `pointerleave`, global `pointerup`/`pointercancel`, and `visibilitychange` safety nets to TouchInput; added blur/visibility listeners and `wasMoving` flag to KeyboardInput to prevent stuck movement input.
9. **CI & Verification**: 28/28 unit and worker tests passing, 13/13 Playwright browser tests passing, locked dependencies, zero GitHub Actions artifact storage quota usage.

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
| 4. Profile/discovery/home persistence | VERIFIED | strict Zod contracts and prepared D1 persistence tested (28/28 unit/worker tests pass). |
| 5. Browser shell + PlayCanvas bootstrap | VERIFIED | one PlayCanvas app, Google UX/API client, build stamp and restrictive headers implemented. |
| 6. Touch/desktop input + movement | VERIFIED | pointer touch controls w/ phantom joystick safety nets, keyboard/mouse, kinematic movement/collision and procedural Explorer player. |
| 7. Authored town world + atmosphere | VERIFIED | five-zone vertex-blended terrain, paved roads, clock tower, enterable cafe, supermarket, town hall, suburban estate, cherry blossoms, park gardens, fog, clouds, and particles. |
| 8. Home + roleplay + audio | VERIFIED | enterable home, doorbell chime, espresso machine, grocery register, mayor podium, sofa/wardrobe/lamp interactions, Web Audio synth, persistent discoveries, background town music. |
| 9. NPC Villagers | VERIFIED | 5 animated villagers (Bruno, Sarah, Sterling, Gary, Ollie) with work animations, head tracking, and proximity speech bubbles. |
| 10. Swimming | VERIFIED | bounded water/swim state with prone crawl animation and recovery logic implemented. |
| 11. Town Mini-Car & Cruiser Bike | VERIFIED | direct-control mini-car with steering front wheels, spinning tires, horn audio, cruiser bicycle, vehicle spawner dock. |
| 12. Handheld Roleplay Props | VERIFIED | HUD pill drawer with coffee mug, ice cream cone, spotlight flashlight, buoyant party balloon, fire hose; Use Prop actions (sip/eat/spray). |
| 13. Job Roles & Emotes | VERIFIED | Explorer/Barista/Firefighter/Police role uniforms, Wave/Dance/Cheer/Sit emotes. |
| 14. House Claiming | VERIFIED | Claim house, lock/unlock door via mailbox interaction. |
| 15. PWA + DEV + Android/family acceptance | DEV DEPLOYED / AWAITING EVIDENCE | DEV live at `https://tinygame-dev.zerobytemode.workers.dev`. Real Android route and family playtest pending. |


## Owner-only inputs / actions still expected

1. **Android Acceptance**: Run the acceptance route on a real Android phone (Chrome landscape) and record evidence in `docs/quality/v0.1-android-acceptance.md`.
2. **Family Acceptance**: Uninstructed family play session recording three independently enjoyed activities plus explicit family PASS/FAIL.

## Completion rule

Do not mark V0.1 accepted until the exact candidate records both `ANDROID ACCEPTANCE: PASS` and `FAMILY ACCEPTANCE: PASS`. Missing external credentials/device evidence is `NOT RUN`, never an invented PASS.
