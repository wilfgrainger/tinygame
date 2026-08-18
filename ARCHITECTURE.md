# TinyWorld Web Architecture

TinyWorld Web is a mobile-first 3D game delivered as a Progressive Web App with a small Cloudflare-backed persistence boundary.

This document describes the **implemented V0.1 architecture**. Product intent lives in [VISION.md](VISION.md); current implementation status lives in [progress.md](progress.md).

```text
Android Chrome / installed PWA / desktop browser
                    |
                    v
          TypeScript + PlayCanvas client
      movement • world • vehicles • HUD • audio
                    |
        static assets served directly
                    |
              /api/* only
                    v
             Cloudflare Worker
      auth • validation • persistence API
                    |
                    v
               Cloudflare D1
 users • sessions • profiles • discoveries • home
```

## 1. Architectural invariants

1. **One client** — one TypeScript/PlayCanvas codebase serves browser and installed Android PWA. There is no Android gameplay fork.
2. **Cloudflare Free-plan boundary** — V0.1 uses Workers Static Assets, Worker and D1 only. No R2 or Durable Objects.
3. **Static-first delivery** — normal static files bypass Worker execution; `/api/*` is the server boundary.
4. **Local simulation, authoritative persistence** — movement/camera/animation run locally. Persistent player state is validated and saved by the Worker/D1 path.
5. **No per-frame backend traffic** — saves are discrete meaningful actions.
6. **Google identity only in V0.1** — Google ID tokens are verified server-side; TinyWorld issues its own opaque session cookie.
7. **Exact-build acceptance** — release metadata identifies the build/candidate being tested.
8. **Mobile-first performance** — visual systems are subordinate to the real Android frame/load budget.

## 2. Client architecture (`src/game/`)

### Lifecycle

- `src/game/main.ts` — browser entrypoint.
- `src/game/app/boot.ts` — auth/bootstrap boundary.
- `src/game/app/GameApp.ts` — current runtime composition root: PlayCanvas app, lighting/camera, world construction, player/vehicles/interactions, HUD callbacks and update loop.

`GameApp.ts` is intentionally the current composition root, but it is already large enough that future substantial features should be split into focused systems rather than extending it indefinitely.

### Input

- `input/InputState.ts` — per-frame normalized input state.
- `input/TouchInput.ts` — movement stick, look drag, jump/action touch input plus pointer-cancel/background safety nets.
- `input/KeyboardInput.ts` — desktop keyboard/mouse support and focus-loss reset behaviour.

Touch is the V0.1 primary input path.

### Player and collision

- `player/PlayerController.ts` — deterministic kinematic player state.
- `player/CollisionWorld.ts` — static X/Z collision and terrain height sampling.
- `player/PlayerView.ts` — procedural player mesh/animation presentation.
- `player/HandProps.ts` — optional non-core roleplay prop visuals.

The collision model is deliberately lightweight. V0.1 should add explicit traversability rules (step/slope constraints) rather than importing a full rigid-body engine merely to solve terrain walking.

### World

- `world/heightfield.ts` — authored terrain height function.
- `world/meshFactory.ts` — terrain mesh/material/primitive helpers and terrain-colour/path blending.
- `world/WorldDefinition.ts` — zones, routes, discoveries, spawn points and water bounds.
- `world/WorldBuilder.ts` — authored buildings, vegetation, roads, harbour, vehicles and interaction positions.
- `world/Atmosphere.ts` — fog, clouds, smoke/fountain particles and interaction marker.
- `world/VillagerManager.ts` — non-core V0.1 NPC presentation/ambient behaviour.
- `world/InteractionSystem.ts` — nearest contextual world interaction selection.

World geometry must obey [VISION.md](VISION.md): compact authored spaces, terrain-following routes, meaningful verticality and no giant flat construction slabs used to hide terrain problems.

### Vehicles and water

- `vehicles/BikeController.ts` — direct-control bicycle kinematics.
- `vehicles/RaftController.ts` — bounded water vehicle kinematics.
- `vehicles/CarController.ts` — non-core V0.1 mini-car.
- `vehicles/VehicleSpawner.ts` — non-core V0.1 roleplay vehicle selection.
- `water/WaterSystem.ts` — swim/raft water bounds and clamping.

Tiny Bike and Tiny Raft are release-critical. The mini-car is not.

### Home

- `home/HomeSystem.ts` — current server-persisted home state.
- `home/HouseManager.ts` — current browser-local roleplay house helper; not authoritative persistent ownership.

V0.1 persistent home truth is intentionally narrow. A UI/world message must never imply durable ownership/lock state unless the server actually persists/enforces it.

### UI and audio

- `ui/Shell.ts` — signed-out/auth shell.
- `ui/Hud.ts` — in-game HUD and optional non-core roleplay drawers.
- `ui/styles.css` — responsive/touch layout.
- `audio/SoundFx.ts` — procedural Web Audio effects/music.

The HUD must remain subordinate to physical play and small-screen visibility.

## 3. Worker architecture (`src/worker/`)

- `index.ts` — Worker entrypoint and static/API dispatch.
- `router.ts` — bounded REST routes and validation flow.
- `env.ts` — typed Worker/D1/assets bindings.
- `security.ts` — exact-origin checks, bounded JSON body parsing, hashed auth rate keys.
- `response.ts` — bounded API error/success envelopes.
- `auth/google.ts` — Google ID-token verification using remote JWKS, issuer and audience checks.
- `auth/session.ts` — opaque high-entropy session cookie creation, token hashing, lookup and revocation.
- `db/d1Store.ts` — prepared D1 persistence implementation.
- `db/store.ts` — store abstraction used by router/tests.

### API surface

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

Mutations require the expected Origin and authenticated session where applicable. Request bodies are bounded and validated with Zod.

## 4. D1 schema

`migrations/0001_v0_1_core.sql` defines the current schema:

- `users` — internal user ID, stable Google `sub`, optional email/display metadata and login timestamps.
- `sessions` — opaque-session token hashes and expiry metadata.
- `player_profiles` — schema version, player name and last spawn ID.
- `player_discoveries` — bounded known discovery IDs per player.
- `player_home_state` — current minimal persistent home state (`lamp_on`).
- `auth_rate_limits` — hashed client key, auth-window start and attempt count.

There is deliberately no generic speculative JSON state store.

## 5. Authentication/session flow

1. Client receives a Google Identity Services credential.
2. Client posts it to `/api/auth/google`.
3. Worker validates exact allowed Origin and auth rate limit.
4. Worker verifies Google signature/issuer/audience and extracts stable `sub`.
5. D1 user/profile/home rows are found or created.
6. Existing TinyWorld sessions for the account are revoked on fresh login.
7. A new random TinyWorld session token is issued.
8. Only the peppered token hash is stored in D1.
9. Browser receives `HttpOnly; Secure; SameSite=Lax` cookie.

Google email is metadata, not the identity key.

## 6. Persistence contract

Persist only state a player reasonably expects to survive:

- account/profile;
- last spawn ID where used;
- bounded discoveries;
- explicitly supported home state.

Do not persist:

- per-frame transforms;
- camera state;
- current animation;
- ambient NPC state;
- temporary props/vehicle motion;
- browser-local roleplay claims unless they become an approved server-backed feature.

Save failure returns an explicit failure state; the client must not claim success after a failed backend write.

## 7. Build and release

- Node 24.
- dependencies pinned in `package.json` and `package-lock.json`.
- Vite creates the browser build.
- Wrangler serves `dist/` as static assets and executes Worker only for `/api/*`.
- `scripts/write-release-metadata.mjs` writes visible/source release metadata.
- `scripts/verify-source-contract.mjs` guards forbidden architecture/secrets.
- `scripts/verify-dist-budget.mjs` enforces distribution limits.
- GitHub Actions uses public-repo compute, read-only permissions and no routine artifact/package uploads.

DEV and LIVE remain separate resource sets.

## 8. Quality boundary

Automated checks can prove deterministic behaviour, buildability and browser contracts. They cannot prove:

- Android frame rate;
- tactile touch quality;
- visual coherence;
- world readability;
- whether the bike/raft feel convincing;
- whether the game is fun.

Those remain exact-build human acceptance gates in `docs/quality/v0.1-android-acceptance.md`.
