# TinyWorld Web V0.1 — Mobile-First PWA and Android Game Design

**Status:** Owner-approved product direction; written design pending final owner review before implementation planning  
**Date:** 17 August 2026  
**Repository:** `wilfgrainger/tinygame`  
**Source product:** TinyWorld Roblox prototype, product lessons only  
**Primary platform:** Android phone  
**Secondary platform:** desktop web  
**Future platform:** iPhone/Safari  
**Infrastructure constraint:** Cloudflare Free plan only  
**Authentication V0.1:** Google only

---

## 1. Decision

TinyWorld will be rebuilt as a browser-native 3D game rather than porting the Roblox runtime or Luau code.

The first product is one mobile-first web application that can be used in three increasingly native ways:

1. open directly in a modern browser;
2. install as a Progressive Web App (PWA) on Android;
3. later package the same production PWA as an Android Trusted Web Activity for Play Store distribution.

There is one game client and one authoritative backend. Android is not a separate game implementation.

The Roblox repository remains historical and independent. No Roblox source code, Rojo configuration, Roblox services, asset IDs, or runtime assumptions are carried into this implementation unless a product concept is deliberately re-expressed for the web.

---

## 2. Product promise

> **Build your life. Explore impossible worlds. Discover the secrets of TinyWorld.**

For V0.1 the promise is deliberately narrower:

> **Open TinyWorld on your phone and immediately enjoy moving through a small, beautiful place that feels worth exploring.**

The game must be enjoyable before missions, economies, multiplayer, portals, or large content systems exist.

The first build succeeds when a player can enter TinyWorld, move naturally, explore the village, woods, mountain and harbour, swim, ride a bicycle, use a raft, enter their home, and return later to persistent progress.

---

## 3. Product DNA retained from TinyWorld

The web game keeps the strongest product principles from the original project:

- ordinary village life must be satisfying without portals;
- the player has a home and a continuing identity;
- interaction happens primarily in the 3D world, not through menus;
- the world should invite curiosity and physical movement;
- exploration and visible change matter more than abstract XP dashboards;
- the visual language is playful, warm, recognisable and original;
- mobile is a first-class target, not a desktop game squeezed onto a phone;
- valuable state is server-authoritative;
- social systems must remain family-appropriate when added later;
- no pay-to-win;
- no labels rescuing unreadable world geometry;
- no primitive placeholder hero objects presented as finished art.

---

## 4. V0.1 scope

### Included

V0.1 contains:

- loading/bootstrap screen;
- Google sign-in;
- TinyWorld player profile;
- one compact authored 3D village;
- village square;
- several recognisable houses;
- one player home exterior and simple enterable interior;
- woodland area;
- climbable mountain/rise with a summit reward/viewpoint;
- harbour/beach;
- swimmable water;
- third-person player movement;
- mobile touch controls;
- desktop keyboard/mouse controls;
- jump;
- context interaction;
- one real rideable Tiny Bike;
- one controllable Tiny Raft;
- simple persistent discoveries/progress;
- explicit visible build/version stamp in development/test builds;
- PWA installation support;
- Cloudflare deployment;
- real Android acceptance testing.

### Explicitly excluded

V0.1 does **not** contain:

- multiplayer;
- friends;
- chat;
- trading;
- co-op quests;
- careers;
- a large mission framework;
- extensive currency/economy systems;
- paid mechanics;
- portals/impossible worlds;
- pets;
- generic combat;
- procedural open world generation;
- live operations;
- Apple sign-in;
- iOS App Store packaging;
- Android-specific fork of the game client.

These are deferred until the core movement/world experience proves itself.

---

## 5. Technology stack

### Client

- TypeScript
- Vite
- PlayCanvas Engine from npm
- PlayCanvas Engine used standalone, with source and scene-building logic owned in GitHub
- WebGL 2 compatibility baseline
- WebGPU may be evaluated later as an optional enhancement, never a V0.1 requirement
- PlayCanvas collision/rigidbody support with ammo.js where measurement and gameplay justify it
- HTML/CSS overlay UI for shell/auth/accessibility surfaces where cleaner than 3D UI

### PWA

- Web App Manifest
- service worker
- installable Android experience
- immutable static asset caching where safe
- gameplay requiring server authority fails clearly when offline rather than pretending persistence succeeded

### Cloudflare

- Workers Static Assets for client build and game assets
- Cloudflare Worker for `/api/*`
- D1 for persistent game/account state
- Worker secrets for Google identity configuration and session signing material
- Durable Objects deferred until realtime multiplayer exists
- R2 excluded from V0.1

### Repository authority

`wilfgrainger/tinygame` is authoritative for source, infrastructure configuration, migrations, tests, asset manifests, build/release metadata, and durable product/engineering contracts.

No cloud-hosted visual editor project becomes a second source of truth.

---

## 6. Why PlayCanvas Engine standalone

PlayCanvas Engine is selected because V0.1 is a browser-native 3D game targeting Android and later iOS. It supports modern mobile browsers, touch input and browser-native deployment.

Using the engine as an npm dependency rather than making a hosted PlayCanvas Editor project authoritative gives TinyWorld:

- normal TypeScript modules;
- normal Git history;
- deterministic builds;
- agent-friendly source;
- straightforward CI;
- no second project database containing critical game logic;
- direct Cloudflare Static Assets deployment.

The PlayCanvas Editor may be evaluated later as an asset/world-authoring aid only if repository-owned assets remain authoritative.

---

## 7. High-level architecture

```text
Android Chrome / installed PWA / desktop browser
                     |
                     v
             TinyWorld client
       TypeScript + PlayCanvas Engine
                     |
          static assets from CDN
                     |
             /api requests only
                     |
                     v
            Cloudflare Worker
        auth + validation + game API
                     |
                     v
               Cloudflare D1
       account + sessions + progress
```

Future multiplayer, when separately designed, may add Durable Objects per live world/session. Durable Objects are deliberately absent from V0.1.

---

## 8. Cloudflare Free-plan contract

The application is designed so normal V0.1 runtime can operate entirely on the Cloudflare Free plan.

The design assumes the current 17 August 2026 Free-plan envelope, including bounded Worker requests/CPU, Workers Static Assets, and D1 storage/read/write allowances. Implementation planning must re-check exact current limits against official Cloudflare documentation before selecting concrete budgets or package behaviour.

Hard rules:

- normal V0.1 operation must not silently depend on a paid Cloudflare feature;
- no architecture decision may assume “upgrade the plan” is the fix;
- quota exhaustion must fail explicitly rather than corrupting or falsely acknowledging state;
- static assets should bypass Worker execution whenever possible;
- API traffic is discrete and low-frequency, never per-frame.

---

## 9. Asset delivery strategy

V0.1 uses Workers Static Assets, not R2.

Game assets may include `.glb` models, compressed textures, audio, icons, manifests and immutable hashed JS/CSS bundles.

Rules:

- every production asset has known provenance and licence/ownership;
- no Roblox asset IDs;
- no hot-linked third-party production assets;
- no production asset exceeding Cloudflare static-asset limits;
- prefer texture/material reuse;
- use LOD only when measurement proves useful;
- avoid unbounded high-resolution textures;
- modular reuse must not make the world visibly repetitive.

V0.1 cold-load target: **<=20 MB transferred before first useful control**, with optional assets loaded after the player can already see/use the initial area.

---

## 10. Authentication design

Google is the only production account provider in V0.1. Apple sign-in and anonymous cloud accounts are deferred.

### Login flow

1. Browser loads TinyWorld.
2. User selects **Continue with Google**.
3. Google Identity Services performs sign-in.
4. Google returns an ID-token credential to the client.
5. Client sends the credential to `POST /api/auth/google`.
6. Worker verifies the credential rather than trusting browser profile data.
7. Verification checks signature, issuer, intended audience/client ID, expiry and stable Google subject (`sub`).
8. D1 account is found or created using Google `sub` as the external identity key.
9. Worker issues a TinyWorld session.
10. Browser receives an HttpOnly, Secure session cookie.

Email address is metadata, not the stable identity key.

### Session model

Use opaque server sessions:

- random high-entropy token;
- only token hash stored in D1;
- HttpOnly, Secure cookie;
- SameSite appropriate to the final Google flow;
- explicit expiry;
- session rotation at login;
- logout revokes/deletes the server session;
- auth endpoints are rate limited.

Authoritative game state never lives in the session cookie.

---

## 11. D1 data model

V0.1 keeps persistence intentionally small.

### `users`

- `id`
- `google_sub` unique
- `email` nullable metadata
- `display_name` nullable
- `created_at`
- `last_login_at`

### `sessions`

- `id`
- `user_id`
- `token_hash` unique
- `created_at`
- `expires_at`
- `last_seen_at`

### `player_profiles`

- `user_id`
- `schema_version`
- `player_name`
- `created_at`
- `updated_at`
- `last_spawn_id`
- only progression fields actually used by V0.1

### `player_discoveries`

- `user_id`
- `discovery_id`
- `discovered_at`
- primary key `(user_id, discovery_id)`

### `player_home_state`

Store only the minimum home state actually implemented.

Do not create a generic JSON junk drawer for speculative future systems. Any small JSON payload must be schema-versioned and strictly validated.

All schema changes use ordered D1 migrations committed to Git. Migrations are deterministic, reviewable, versioned and locally testable.

---

## 12. API design

Initial maximum surface:

```text
POST /api/auth/google
POST /api/auth/logout
GET  /api/me
GET  /api/profile
PUT  /api/profile
GET  /api/world/bootstrap
POST /api/discoveries/:id
POST /api/home/save
```

Rules:

- static game files bypass Worker execution whenever possible;
- client sends intent, not authoritative outcomes;
- every mutation validates identity, types, bounds, allowed IDs and current state;
- use idempotent mutations where retries are plausible;
- never accept client-provided reward/value authority;
- no SQL string concatenation;
- responses are bounded;
- errors use a small machine-readable code set;
- internal exceptions never leak secrets or SQL details;
- ordinary movement remains local simulation and is not persisted per-frame.

---

## 13. World design

V0.1 contains five spatial anchors:

1. **Village Square**
2. **Home Lane**
3. **Woodland**
4. **Mountain Rise**
5. **Harbour / Water Edge**

The world must be compact enough to understand quickly but varied enough that movement changes mood, silhouette and verticality.

### Village Square

Orientation, identity and route choice. It must not be an enormous empty plaza.

### Home Lane

Proves TinyWorld is a place to live. Several playful houses plus the player's own home. Restrained colour families and clear silhouettes.

### Woodland

Partial enclosure, discovery and movement contrast. Real canopy impression, touch-friendly path width, authored rocks/logs/undergrowth, and no flat field with evenly spaced trees.

### Mountain Rise

Visible long-range goal and movement test. Visible from spawn, reachable by normal movement, with bends/terraces/rocks/steps/slopes, a safe summit and a meaningful viewpoint/discovery. Never one giant ramp.

### Harbour / Water Edge

Introduces swimming and Tiny Raft. Land descends physically to water, shoreline avoids rectangular-strip appearance, raft is moored in water, and safe shore recovery exists.

---

## 14. Visual language

TinyWorld Web must be original.

Quality shorthand means clear object readability, tactile/playful warmth and occasional wonder. It never licenses copying identifiable buildings, maps, assets, UI, characters, logos or distinctive expression from another game.

Rules:

- strong silhouettes first;
- few principal colours per hero object;
- material/shape variation before more colour;
- playful proportions without abstraction;
- vegetation in authored clusters;
- terrain elevation changes the skyline;
- fantasy glow is rare and intentional;
- no neon primitive placeholders treated as finished content;
- labels are supplementary, never required to understand a house, bike, raft or NPC role.

V0.1 should look deliberately simple rather than cheaply complicated.

---

## 15. Player controller

Required verbs:

- walk;
- run at an appropriate game pace;
- turn;
- orbit camera;
- jump;
- step over small obstacles;
- traverse slopes;
- swim;
- mount/dismount bike;
- mount/dismount raft;
- context interact.

### Mobile

Landscape is the primary Android V0.1 gameplay orientation.

Default layout:

- left thumb: virtual movement stick;
- right-side drag: camera orbit;
- right thumb: jump;
- right thumb: contextual action when relevant;
- pause/settings available but not dominant.

Requirements:

- no hover-only interaction;
- >=44x44 CSS px effective touch targets;
- safe-area insets respected;
- controls avoid common browser/PWA gesture conflicts;
- small Android phones remain usable;
- camera drag never activates UI beneath it;
- rotation produces a controlled state, not broken layout.

### Desktop

- WASD movement;
- mouse camera;
- Space jump;
- E or equivalent interact;
- Esc pause/settings.

Mobile ergonomics win conflicts in V0.1.

---

## 16. Physics and collision

Use PlayCanvas collision/rigidbody functionality only where it materially helps movement and vehicles.

Principles:

- simple collision proxies for static world geometry;
- visual mesh complexity does not dictate physics complexity;
- decorative foliage is not automatically collidable;
- no physics simulation merely for decorative ambience;
- player controller is deterministic enough to test;
- avoid unstable slopes/tunnelling;
- recovery points exist for water/terrain failure;
- bike/raft lifecycle owns cleanup/reset.

Physics library cost is included in the first-load budget.

---

## 17. Tiny Bike

The Tiny Bike is a quality gate, not a follower prop.

Required behaviour:

- clearly recognisable bicycle silhouette;
- player visibly mounts and occupies it;
- direct steering;
- materially faster than walking;
- appropriate turning radius;
- predictable collision;
- mount/dismount works on touch and desktop;
- dismount leaves player safely positioned;
- reset/reload cannot leave orphan vehicle state;
- bike never follows the player as an unrelated trailing model.

V0.1 requires a convincing game bicycle, not realistic bicycle simulation.

---

## 18. Tiny Raft

The water vehicle is named **Tiny Raft**.

Required behaviour:

- simple charming wooden raft;
- exists in/at harbour water, not on land;
- player visibly boards it;
- direct steering/throttle appropriate to touch;
- calmer handling than bike;
- no teleport-as-traversal implementation;
- safe dismount/shore recovery;
- deterministic reset/reload cleanup.

---

## 19. Swimming

Swimming is ordinary traversal.

Requirements:

- entering designated water switches to swim state;
- player remains near a plausible water surface;
- movement remains controllable on touch;
- shore returns to walking cleanly;
- falling below world bounds triggers recovery;
- water never becomes an endless void.

---

## 20. Home V0.1

The player's home is intentionally small.

V0.1 proves:

- player owns a recognisable home;
- player can enter it;
- interior loads/reveals cleanly;
- a few objects are physically interactive;
- one small persistent state change saves and restores.

Examples: lamp toggle, cupboard open/close, chair sit, or one bounded starter decoration placement.

Do not build the full furniture catalogue/economy system yet.

---

## 21. Persistence contract

Persist only state the player expects to survive:

- account/profile;
- small avatar/profile choice if implemented;
- discoveries;
- home V0.1 state;
- agreed spawn/return state where useful.

Do not persist every frame position, transient physics, camera orientation or temporary animation state.

Server response is the source of truth for committed persistence. Client UI distinguishes pending, saved and failed states.

---

## 22. Security contract

The browser is hostile/untrusted.

Every persistent mutation validates at minimum:

- authenticated session;
- HTTP method;
- content type/body size;
- field types;
- finite numeric values;
- ranges;
- enumerated IDs;
- ownership;
- allowed state transition;
- per-user rate limits where sensitive;
- CSRF risk for cookie-authenticated mutations.

Google profile fields supplied by the browser never prove identity.

Secrets exist only in Worker secret/config environments, never Vite public variables or client bundles.

Use an explicit Content Security Policy compatible with Google Identity Services.

---

## 23. Error handling

Provide explicit user-safe handling for:

- Google sign-in cancelled/unavailable;
- invalid/expired session;
- Worker unavailable;
- D1 write failure or free-quota exhaustion;
- malformed API payload;
- client/API version incompatibility;
- WebGL 2 unsupported;
- physics module load failure;
- critical asset load failure;
- lost network during save.

No error path may falsely claim progress is saved. Critical boot failure shows a retry/recovery screen rather than a blank canvas.

---

## 24. PWA design

Requirements:

- valid manifest;
- appropriate name/icons;
- landscape-first display preference;
- standalone display mode where supported;
- service worker with controlled cache strategy;
- immutable hashed assets cache-first;
- HTML/API/auth-sensitive responses not blindly cached;
- safe update flow replacing old cached builds;
- development/test builds visibly expose version/build ID.

The PWA launches directly into the TinyWorld shell, not a marketing site around the game.

---

## 25. Android distribution path

### V0.1

- HTTPS web URL;
- Chrome on Android;
- installable PWA.

### Later, after V0.1 acceptance

Package the same production PWA as a Trusted Web Activity for Google Play, using Digital Asset Links and Android wrapper metadata/signing. Gameplay logic must not diverge into the Android wrapper.

---

## 26. Performance budgets

A real mid-range Android phone is the V0.1 release authority.

Initial gates:

- sustained minimum 30 FPS during normal village traversal;
- target 60 FPS on capable modern devices;
- no routine multi-second main-thread stalls;
- first useful control <=10 seconds on reasonable 4G/Wi-Fi cold load;
- <=20 MB transferred before useful control;
- stable session without uncontrolled memory growth;
- no per-frame network requests;
- no unbounded entity/particle spawning.

Measure FPS, long tasks/frame spikes, load times, transferred bytes, API counts and D1 read/write patterns. Performance is not PASS from source review alone.

---

## 27. Android acceptance route

An exact V0.1 candidate must be exercised on a real Android phone:

1. fresh launch;
2. Google sign-in;
3. enter village;
4. touch movement;
5. camera orbit;
6. jump;
7. village square traversal;
8. enter home;
9. interact with home object;
10. woodland traversal;
11. climb mountain to summit;
12. descend safely;
13. reach harbour;
14. enter water/swim;
15. return to shore;
16. mount/ride/dismount Tiny Bike;
17. board/control/dismount Tiny Raft;
18. trigger discovery/save;
19. close PWA/browser;
20. relaunch and confirm persistence.

Record exact build/version used.

---

## 28. Family acceptance

Human playtesting is release-blocking.

Automated tests cannot declare the candidate accepted.

Family testers should be able to play without being told to complete a mission and independently identify at least three things they enjoyed doing or discovering.

Failure examples include:

- empty/unfinished world;
- flat-baseplate feel;
- construction-block houses;
- bad phone movement;
- boring mountain despite technical climbability;
- fake/attached bike rather than ridden bike;
- raft behaving as teleport;
- broken-feeling water;
- controls obscuring play;
- game becoming interesting only after instructions.

A human visual/gameplay FAIL overrides green CI.

---

## 29. Testing strategy

### Unit tests

Pure TypeScript rules for validation, sessions, profile schemas/migrations, world/discovery definitions, movement state transitions where practical, save-state transformations and API error mapping.

### Worker integration tests

Cover unauthenticated rejection, invalid Google credential rejection through injected verifier/test doubles, valid account bootstrap, session creation/revocation, profile load/update, invalid mutation rejection, D1 constraints, idempotent discovery and malformed body rejection.

Live Google auth is not a normal automated dependency.

### Client/browser tests

Cover boot shell, mocked auth transitions, PWA manifest, resize/orientation and critical overlay controls. 3D feel still requires real-device/manual testing.

### Source/build guards

Guard against committed secrets, accidental R2/Durable Object dependency, unsupported large static assets, production debug auth bypass and missing build/version metadata.

---

## 30. Environments

### Local

- Vite client;
- local Worker/D1 via Wrangler;
- injected/fake auth verifier for most automated work;
- optional real Google local origin for manual auth testing.

### DEV

- Cloudflare-hosted DEV deployment;
- DEV D1;
- DEV Google OAuth origin/client;
- visible DEV/build stamp;
- test data only.

### LIVE

- production Cloudflare deployment;
- separate LIVE D1;
- production Google OAuth origin/client;
- no developer auth bypass;
- promotion only after exact-candidate acceptance.

DEV and LIVE persistence never share a D1 database.

---

## 31. Release/version metadata

Every deployment exposes immutable metadata containing at least:

- app version;
- Git commit SHA;
- build timestamp;
- environment;
- optional asset manifest hash.

Development and acceptance builds display a compact version stamp. The same metadata is queryable through a lightweight endpoint or static release file.

---

## 32. Repository shape

Proposed starting structure:

```text
tinygame/
  README.md
  AGENTS.md
  package.json
  tsconfig.json
  vite.config.ts
  wrangler.jsonc

  apps/
    game/
      src/
        app/
        auth/
        input/
        player/
        world/
        vehicles/
        home/
        ui/
        assets/
      public/

    worker/
      src/
        auth/
        api/
        db/
        validation/
        index.ts

  packages/
    shared/
      src/
        contracts/
        ids/
        schemas/
        errors/

  migrations/
  tests/
    unit/
    worker/
    browser/

  docs/
    product/
    architecture/
    quality/
    superpowers/
      specs/
      plans/
```

Implementation planning may simplify directories if V0.1 does not justify them.

---

## 33. Engineering principles

1. One source of truth in GitHub.
2. Mobile behaviour is designed first.
3. Client and Worker boundaries stay explicit.
4. Persist outcomes, not animation noise.
5. API calls are discrete and low-frequency.
6. Modules remain small and independently testable.
7. No speculative framework stack.
8. No multiplayer architecture before multiplayer exists.
9. No general-purpose economy before gameplay needs it.
10. Do not solve visual weakness with UI overlays.
11. Do not claim device quality without device evidence.
12. Cloudflare Free-plan limits are architectural inputs.
13. The player should have fun before the roadmap does.

---

## 34. Implementation sequence

This is sequencing only. A separate detailed implementation plan is required before production code starts.

1. repository/contracts/bootstrap;
2. Cloudflare/Vite/PlayCanvas minimal shell;
3. build/version metadata;
4. Google auth + session + D1 account bootstrap;
5. deterministic small world shell;
6. Android touch player controller;
7. terrain/village composition;
8. home V0.1;
9. swimming and recovery;
10. Tiny Bike;
11. Tiny Raft;
12. persistence/discovery;
13. PWA install/update behaviour;
14. performance/source guards;
15. DEV deployment;
16. Android acceptance route;
17. family gameplay acceptance;
18. only after that, design V0.2.

---

## 35. V0.2+ direction, non-binding

Only after V0.1 acceptance should later specs consider:

### V0.2

- a few authored moving NPCs;
- tiny ordinary-life activities;
- coins/rewards only where they improve play;
- improved home expression.

### V0.3

- friends/realtime presence;
- Durable Object-backed world instances;
- multiplayer authority and disconnect/recovery design.

### V0.4

- optional co-op objectives;
- richer social systems;
- first impossible world if ordinary TinyWorld is already satisfying.

These are not commitments and must not leak into V0.1 implementation.

---

## 36. Platform assumptions

Before implementation, package versions and exact quotas must be verified from official primary documentation. The design currently relies on these platform capabilities:

- Cloudflare Workers Free and Workers Static Assets;
- Cloudflare D1 on the Free plan;
- Google Identity Services for Web, with backend ID-token verification;
- PlayCanvas Engine via npm with mobile browser/touch support;
- Android PWA installation;
- later Android Trusted Web Activity packaging.

Primary references:

- `https://developers.cloudflare.com/workers/platform/limits/`
- `https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/`
- `https://developers.cloudflare.com/d1/platform/limits/`
- `https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid`
- `https://developer.playcanvas.com/user-manual/engine/`
- `https://developer.playcanvas.com/user-manual/engine/supported-browsers/`
- `https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities`

---

## 37. Owner review gate

This document defines the product and architecture design for TinyWorld Web V0.1 in `wilfgrainger/tinygame`.

After the owner reviews and approves this written spec, the next step is a detailed Superpowers implementation plan containing exact files, package versions resolved at implementation time, D1 migrations, API contracts, test-first steps, local commands, Cloudflare DEV configuration, Google OAuth setup, Android acceptance, and commit/PR sequencing.

**No V0.1 production implementation begins before that plan exists.**
