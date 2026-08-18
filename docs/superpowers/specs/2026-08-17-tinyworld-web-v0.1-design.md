# TinyWorld Web V0.1 Design

**Status:** APPROVED / IMPLEMENTED IN PR #2 / RELEASE ACCEPTANCE PENDING  
**Original approval:** 17 August 2026  
**Refreshed:** 18 August 2026  
**Repository:** `wilfgrainger/tinygame`  
**Primary platform:** Android phone, landscape  
**Secondary platform:** desktop web  
**Infrastructure:** Cloudflare Free-plan architecture only  
**Authentication:** Google only

This file is the normative V0.1 design contract. Product direction above V0.1 belongs in `VISION.md`. Current implementation facts and blockers belong in `progress.md`.

## 1. Decision

TinyWorld is rebuilt as a browser-native 3D game, not a Roblox runtime port.

There is one TypeScript/PlayCanvas game client that can:

1. run in a modern browser;
2. install as an Android PWA;
3. later be packaged through an Android web-container path without creating a second gameplay implementation.

The Roblox project is historical product research only. No Luau/Rojo/runtime assumptions are authoritative here.

## 2. V0.1 promise

> **Open TinyWorld on a phone and immediately enjoy being there.**

The release is deliberately about quality of place and movement before scale of systems.

The core player should be able to:

- sign in and enter quickly;
- move and control the camera comfortably on touch;
- understand Village Square and choose a route naturally;
- explore Home Lane, Woodland, Mountain Rise and Harbour;
- swim safely;
- discover the summit/grove/harbour through movement;
- ride a convincing Tiny Bike;
- board and steer Tiny Raft;
- enter the player home and observe at least one small persistent interaction;
- return later without the game lying about saved state.

## 3. Core V0.1 scope

Release-critical systems:

- loading/bootstrap and Google sign-in;
- player profile;
- compact authored 3D world;
- Village Square, Home Lane, Woodland, Mountain Rise and Harbour;
- third-person movement, jump and camera;
- touch-first controls plus desktop support;
- contextual world interaction;
- swimming and shore recovery;
- direct-control Tiny Bike;
- direct-control Tiny Raft;
- player home with minimal persistent state;
- bounded discovery persistence;
- visible build/version identity;
- PWA installation;
- Cloudflare DEV deployment;
- exact-build Android and family acceptance.

## 4. Non-core extras already present

During implementation the branch acquired additional roleplay texture:

- cafe, supermarket and town hall;
- animated villagers;
- mini-car and vehicle spawner;
- props;
- emotes;
- role costumes;
- procedural music and additional sound;
- browser-local house-claim/lock helper.

These extras are **not V0.1 release dependencies**.

They may remain only where they improve the core world without harming performance, clarity, originality or touch usability. If an extra implies persistence/enforcement it does not actually have, simplify or remove the promise rather than shipping pretend behaviour.

V0.1 is feature-frozen until acceptance passes.

## 5. Explicit exclusions before V0.1 acceptance

Do not add:

- multiplayer, friends or open chat;
- trading or co-op systems;
- broad mission/quest framework;
- economy or paid mechanics;
- portals/additional worlds;
- pets or combat;
- Apple sign-in;
- iOS packaging;
- R2 or Durable Objects;
- Android gameplay fork;
- additional jobs, shops, NPC collections, prop catalogues or vehicles unless required to fix a release-critical defect.

## 6. Technology design

### Client

- TypeScript
- Vite
- standalone PlayCanvas Engine from npm
- repository-owned scene/world logic
- deterministic kinematic movement rather than a full rigid-body dependency unless measured evidence justifies one
- HTML/CSS overlay for auth/HUD/touch controls
- Web Audio for lightweight procedural sound where useful

### Backend

- Cloudflare Workers Static Assets
- Worker only for `/api/*`
- Cloudflare D1
- Google Identity Services
- opaque TinyWorld session cookie after server-side Google token verification

### Repository authority

GitHub owns source, migrations, tests, infrastructure config, release metadata, design contracts and asset provenance. No hosted visual editor becomes a second source of truth.

## 7. Cloudflare contract

V0.1 must operate within the Free-plan design envelope.

Hard rules:

- static assets bypass Worker execution whenever possible;
- no per-frame API calls;
- D1 writes happen only on meaningful persistence actions;
- quota/save failure is explicit, never falsely acknowledged;
- no R2/DO paid-path dependency;
- DEV and LIVE use distinct resources/configuration.

## 8. Authentication/session design

1. Google Identity Services returns an ID-token credential to the browser.
2. Browser posts it to `/api/auth/google`.
3. Worker validates exact Origin and rate limit.
4. Worker verifies Google signature, issuer and expected client ID/audience.
5. Stable Google `sub` identifies the external account.
6. D1 user/profile/home rows are found/created.
7. Old TinyWorld sessions are revoked on fresh login.
8. Worker creates a high-entropy opaque TinyWorld session.
9. Only the peppered token hash is stored.
10. Browser receives an HttpOnly, Secure, SameSite cookie.

Email is metadata, not the identity key.

## 9. Persistence model

Current D1 tables:

- `users`
- `sessions`
- `player_profiles`
- `player_discoveries`
- `player_home_state`
- `auth_rate_limits`

Persist only state implemented and expected to survive.

V0.1 home persistence is intentionally narrow. The current server-backed home state is the lamp state. Browser-local roleplay claim/lock state is not durable ownership and must not be represented as such.

## 10. API surface

```text
GET  /api/health
POST /api/auth/google
POST /api/auth/logout
GET  /api/me
GET  /api/profile
PUT  /api/profile
GET  /api/world/bootstrap
POST /api/discoveries/:id
POST /api/home/save
```

Mutations validate identity, Origin, strict request schema and bounded known IDs. Client never submits authoritative rewards/value.

## 11. World design

Five anchors:

1. Village Square
2. Home Lane
3. Woodland
4. Mountain Rise
5. Harbour / Water Edge

The world must be compact, readable and vertically varied.

### Required terrain rules

- no giant flat baseplate;
- no giant flat road boxes draped across an undulating landscape;
- roads/paths follow terrain or deliberately shape/flatten a bounded road corridor;
- traversability has meaningful step/slope limits;
- mountain route contains bends/terraces and matters because arbitrary cliffs are not equally traversable;
- shoreline physically descends to water;
- water has safe recovery;
- decorative geometry does not become accidental invisible collision.

## 12. Visual language

TinyWorld must be recognisable and original.

Rules:

- strong silhouettes;
- few principal colours per hero object;
- material/shape variation before palette noise;
- clustered vegetation;
- skyline/verticality from terrain;
- recognisable moving NPCs where NPCs exist;
- no primitive placeholder hero objects presented as finished art;
- labels support readability but never rescue unreadable geometry;
- no durable product naming or architecture identity borrowed from another game.

## 13. Player/touch design

Required verbs:

- walk/run;
- turn/orbit camera;
- jump;
- traverse reasonable slopes/steps;
- swim;
- mount/dismount bike;
- mount/dismount raft;
- context interact.

Mobile landscape default:

- left thumb movement;
- right-side camera drag;
- right thumb jump/action;
- >=44x44 CSS px effective targets;
- safe-area aware;
- no hover-only behaviour;
- pointer release/cancel/background/focus-loss must never leave movement stuck.

Desktop remains supported but mobile ergonomics win conflicts.

## 14. Tiny Bike quality gate

The bicycle must:

- look like a bicycle;
- be physically present in world;
- visibly carry the player;
- use direct steering/throttle;
- be materially faster than walking;
- respect collision/traversability;
- mount/dismount safely;
- never act as a follower prop.

## 15. Tiny Raft quality gate

Tiny Raft must:

- exist in harbour water;
- visibly carry the player;
- use direct touch-friendly control;
- stay within sensible navigable water;
- dismount/recover safely;
- never implement traversal as a disguised teleport.

## 16. Performance/load targets

Targets for the exact Android acceptance candidate:

- <=20 MB transferred before first useful control;
- <=10 seconds to useful control on a reasonable mobile connection;
- sustained >=30 FPS through the release-critical route on the agreed real Android device.

Measure before speculative optimisation. Measured failure blocks feature growth.

## 17. Automated quality

Required automated gates include:

- TypeScript typecheck;
- source contract/security guards;
- unit/Worker tests;
- production build;
- distribution budget;
- browser/PWA checks;
- Android-landscape UI checks;
- regression coverage for critical touch movement stop/release and core gameplay paths as they are fixed.

A passing browser-emulation test is not Android performance evidence.

## 18. Human acceptance

The exact deployed candidate must be tested on a real Android phone and by family playtest.

Acceptance records:

- load/useful-control observations;
- frame-rate observation through core route;
- Google sign-in and PWA launch;
- touch movement/camera/jump/action;
- Village/woodland/mountain/harbour readability;
- swimming/recovery;
- Tiny Bike;
- Tiny Raft;
- persistent home interaction;
- console/network critical errors;
- at least three independently enjoyed activities/discoveries;
- explicit verdict on whether the game feels finished rather than like a building site.

Both must be explicit:

```text
ANDROID ACCEPTANCE: PASS
FAMILY ACCEPTANCE: PASS
```

A human FAIL overrides CI PASS.

## 19. Completion rule

V0.1 is complete only when:

1. code-owned release blockers are fixed;
2. latest exact-head CI is green;
3. the exact candidate is deployed and identifiable;
4. Android acceptance passes;
5. family acceptance passes.

Until then PR #2 remains a release candidate, not an accepted release.
