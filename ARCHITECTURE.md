# TinyWorld Web Architecture

TinyWorld is a mobile-first 3D browser/PWA game with a small Cloudflare-backed persistence boundary.

This document describes the **implemented V0.1 + 20x quality architecture**. Product intent lives in [`VISION.md`](VISION.md); current candidate/evidence lives in [`progress.md`](progress.md).

```text
Android Chrome / installed PWA / desktop browser
                    |
                    v
          TypeScript + PlayCanvas client
 input → control model → player/vehicles → presentation
          world + atmosphere + HUD + audio
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

1. **One client** — one TypeScript/PlayCanvas gameplay codebase serves browser and installed Android PWA. There is no Android gameplay fork.
2. **Cloudflare Free-plan boundary** — V0.1 uses Workers Static Assets, Worker and D1 only. No R2 or Durable Objects.
3. **Static-first delivery** — normal assets bypass Worker execution; `/api/*` is the server boundary.
4. **Local simulation, authoritative persistence** — movement, camera, animation and vehicles run locally. Persistent player state is validated/saved by Worker + D1.
5. **No per-frame backend traffic** — saves are discrete meaningful actions.
6. **Google identity only in V0.1** — Google ID tokens are verified server-side; TinyWorld issues its own opaque session.
7. **Exact-build acceptance** — release metadata identifies the gameplay candidate being tested.
8. **Mobile-first performance** — visual systems are subordinate to the real Android frame/load budget.
9. **Control-model separation** — camera heading, movement direction and avatar visual facing are separate concepts.
10. **Decorative scenery is non-authoritative** — quality scenery may enrich composition but must not silently create collision, persistence or gameplay routes.

## 2. Client architecture (`src/game/`)

### Lifecycle / composition

- `main.ts` — browser entrypoint and production service-worker registration.
- `app/boot.ts` — auth/bootstrap boundary.
- `app/GameApp.ts` — runtime composition root: PlayCanvas app, systems, interaction registration and update loop.

`GameApp.ts` composes systems. New behavioural logic should live in focused modules rather than continuing to grow the composition root.

## 3. Input, controls and camera

### Raw input

- `input/InputState.ts` — normalized per-frame input snapshot.
- `input/TouchInput.ts` — virtual movement stick, right-side look drag, jump/action and pointer/focus/background safety nets.
- `input/KeyboardInput.ts` — desktop support and focus-loss reset behaviour.

Touch is the primary V0.1 input path.

### Control model

- `player/controlModel.ts` — pure camera-relative movement/facing/look math.
- `player/movementFeel.ts` — radial deadzone and bounded acceleration/deceleration response.
- `player/cameraRig.ts` — pure third-person camera target calculation and frame-rate-independent damping.

Implemented contract:

```text
LEFT STICK
    ↓
camera-relative world movement
    ↓
kinematic player travel
    ↓
avatar visual facing follows actual travel

RIGHT DRAG
    ↓
camera yaw + pitch only
```

Rules:

- left stick forward means toward the camera view;
- moving avatar turns into actual travel direction;
- standing avatar preserves its body heading while camera can orbit;
- no default strafe/backpedal presentation;
- camera pitch is constrained to `-38°..12°`;
- 12% radial deadzone removes tiny touch drift;
- movement accelerates quickly and releases faster;
- visual walk/swim speed follows actual displacement, not raw input noise.

Do not re-couple camera yaw and avatar body yaw.

## 4. Player and collision

- `player/PlayerController.ts` — deterministic kinematic player state, camera heading/pitch and movement response.
- `player/CollisionWorld.ts` — static X/Z collision, terrain sampling, maximum step-height and slope-angle traversability.
- `player/PlayerView.ts` — procedural avatar mesh and presentation; derives non-vehicle visual facing from actual displacement.
- `player/HandProps.ts` — optional non-core roleplay prop visuals.

The collision model intentionally remains lightweight. Walking is more permissive than bike/car traversal, so mountain routes are gameplay infrastructure instead of paint.

Do not import a full rigid-body engine for ordinary walking unless measured requirements prove the kinematic model insufficient.

## 5. World architecture

### Authoritative authored world

- `world/heightfield.ts` — deterministic terrain height function.
- `world/meshFactory.ts` — terrain mesh/material/primitive helpers; terrain-aligned road span rendering.
- `world/roadGeometry.ts` — pure terrain-following road-span sampling.
- `world/WorldDefinition.ts` — zones, discoveries, spawns and water bounds.
- `world/WorldBuilder.ts` — core buildings, vegetation, roads, harbour, vehicle meshes and interaction positions.

Roads/sidewalks/stripes are decomposed into terrain-following spans rather than giant flat slabs.

### 20x quality composition

- `world/qualityComposition.ts` — deterministic authored decorative clusters and visual anchors.
- `world/QualityScenery.ts` — non-colliding renderer for those clusters.

The quality layer currently frames:

- Woodland threshold/grove/edge;
- Mountain approach/upper route/summit cairn;
- Harbour arrival/mooring/shore;
- Home Lane front garden/lane/boundary.

This layer is **presentation only**. It must not become a second source of gameplay routes, collisions, persistence or rewards.

### Atmosphere

- `world/Atmosphere.ts` — fog, clouds, interaction marker and pooled smoke/fountain presentation.
- `world/particlePool.ts` — fixed reusable pool used to avoid routine entity create/destroy churn.
- `world/VillagerManager.ts` — non-core NPC presentation/ambient behaviour.
- `world/InteractionSystem.ts` — nearest contextual interaction selection.

World geometry must remain compact, authored and terrain-aware. Avoid flat construction slabs, uniform scattering and decorative collision clutter.

## 6. Vehicles and water

- `vehicles/BikeController.ts` — direct-control bicycle kinematics with stricter terrain traversal than walking.
- `vehicles/RaftController.ts` — bounded water vehicle kinematics.
- `vehicles/CarController.ts` — non-core mini-car.
- `vehicles/vehicleFeel.ts` — pure progressive steering, bike lean, raft water-pose and wake-strength helpers.
- `vehicles/RaftWake.ts` — lightweight reusable wake presentation.
- `vehicles/VehicleSpawner.ts` — non-core roleplay vehicle selection.
- `water/WaterSystem.ts` — swim/raft bounds and clamping.

Tiny Bike and Tiny Raft are release-critical.

Bike quality contract:

- progressive speed-aware steering;
- visible distance-driven wheel rotation;
- bounded speed-dependent lean;
- safe direct mount/dismount;
- stricter terrain limits than walking.

Raft quality contract:

- progressive steering;
- bounded bob/roll/pitch;
- subtle reusable wake;
- water-bounded movement and safe recovery;
- no teleport/follower-prop behaviour.

The mini-car is non-core V0.1 texture.

## 7. Home

- `home/HomeSystem.ts` — server-persisted supported home state.
- `home/HouseManager.ts` — legacy-named stateless welcome helper retained to avoid unrelated composition-root churn.

V0.1 does **not** promise durable house claiming or door-lock ownership. The current persistent home example is `lamp_on`.

World/UI copy must never imply persistence/security the backend does not enforce.

## 8. UI and audio

- `ui/Shell.ts` — signed-out/auth shell.
- `ui/Hud.ts` — in-game HUD and optional non-core roleplay drawers.
- `ui/styles.css` — responsive/touch layout.
- `audio/SoundFx.ts` — procedural Web Audio effects/music.

The right-side look surface covers the gameplay area independently of the left movement stick. HUD controls must not steal ordinary camera-drag gestures outside their explicit hit targets.

The HUD remains subordinate to physical play and small-screen visibility.

## 9. Rendering / mobile budget

Current 20x candidate deliberately keeps the rendering model simple:

- procedural/primitive world, no large external asset pack;
- main directional shadow map capped at **1024**;
- smoke pool: fixed reusable entities;
- fountain pool: fixed reusable entities;
- atmosphere spawn cadence is time-based rather than frame-probability-driven;
- camera update reuses target vectors rather than allocating `pc.Vec3` every frame;
- no per-frame API traffic.

Do not raise shadow resolution or add expensive ambient systems because desktop looks good. Real Android evidence owns that decision.

## 10. Worker architecture (`src/worker/`)

- `index.ts` — Worker entrypoint and static/API dispatch.
- `router.ts` — bounded REST routes and validation flow.
- `env.ts` — typed Worker/D1/assets bindings.
- `security.ts` — exact-origin checks, bounded JSON parsing, hashed auth-rate keys.
- `response.ts` — bounded API error/success envelopes.
- `auth/google.ts` — Google ID-token verification via remote JWKS, issuer and audience checks.
- `auth/session.ts` — opaque high-entropy session creation, hashing, lookup and revocation.
- `db/d1Store.ts` — prepared D1 persistence implementation.
- `db/store.ts` — persistence abstraction used by router/tests.

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

## 11. D1 schema

`migrations/0001_v0_1_core.sql` defines:

- `users` — internal ID, stable Google `sub`, optional metadata and login timestamps;
- `sessions` — opaque-session token hashes and expiry metadata;
- `player_profiles` — schema version, player name and last spawn ID;
- `player_discoveries` — bounded known discovery IDs per player;
- `player_home_state` — minimal home state (`lamp_on`);
- `auth_rate_limits` — hashed client key, auth-window start and attempt count.

There is deliberately no speculative generic JSON state store.

## 12. Authentication/session flow

1. Client receives Google Identity Services credential.
2. Client posts it to `/api/auth/google`.
3. Worker validates exact allowed Origin and auth rate limit.
4. Worker verifies Google signature/issuer/audience and extracts stable `sub`.
5. D1 user/profile/home rows are found or created.
6. Existing TinyWorld sessions for the account are revoked on fresh login.
7. New random TinyWorld session token is issued.
8. Only the peppered token hash is stored.
9. Browser receives `HttpOnly; Secure; SameSite=Lax` cookie.

Google email is metadata, not the identity key.

## 13. Persistence contract

Persist only state a player reasonably expects to survive:

- account/profile;
- supported last-spawn state;
- bounded discoveries;
- explicitly supported home state.

Do not persist:

- per-frame transforms;
- camera state;
- current animation;
- ambient NPC state;
- temporary props/vehicle motion;
- invented ownership/lock state.

Save failure returns explicit failure. The client must never display success after a failed backend write.

## 14. Build and release

- Node 24.
- dependencies pinned in `package.json` + `package-lock.json`.
- Vite builds the browser game.
- Wrangler serves `dist/` and executes Worker for `/api/*`.
- release metadata exposes version/Git SHA/build timestamp/environment.
- source and dist-budget scripts guard architecture/secrets/bundle limits.
- GitHub Actions uses public-repo compute, read-only permissions and no routine artifact/package uploads.

DEV and LIVE remain separate resource sets.

The current frozen 20x gameplay candidate is recorded in `progress.md`. Documentation-only commits after it do not become a new gameplay candidate.

## 15. Quality / release boundary

Automated checks can prove deterministic behaviour, buildability and browser contracts. They cannot prove:

- real Android frame rate/thermal behaviour;
- tactile touch quality;
- camera feel;
- visual coherence/world readability;
- bike/raft physicality as perceived by a player;
- fun.

Those remain exact-build human gates in `docs/quality/v0.1-android-acceptance.md`.

A human FAIL overrides CI PASS.
