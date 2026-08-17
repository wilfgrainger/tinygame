# TinyWorld Web V0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the owner-approved TinyWorld V0.1 as one mobile-first 3D web game and installable Android PWA with Google sign-in, Cloudflare/D1 persistence, a compact authored world, swimming, a real rideable Tiny Bike, Tiny Raft, home interaction, and exact-build Android/family acceptance.

**Architecture:** Use one TypeScript package rather than a premature monorepo: Vite builds the PlayCanvas client from `src/game`, Wrangler bundles the API Worker from `src/worker`, and both import pure contracts from `src/shared`. Workers Static Assets serves the hashed client without invoking Worker code; only `/api/*` runs the Worker and D1. V0.1 uses a deterministic kinematic movement/collision layer instead of shipping ammo.js unless measured gameplay evidence proves it is necessary, which keeps mobile load smaller and makes movement/vehicle behaviour directly testable.

**Tech Stack:** Node.js 24 LTS; TypeScript 7.0.2; Vite 8.2.0; PlayCanvas Engine 2.21.3; Cloudflare Wrangler 4.118.0 + Workers Static Assets + D1; Vitest 4.1.10; Playwright 1.61.1; `jose` 6.2.7; Zod 4.4.3; Google Identity Services for Web.

**Controlling issue:** `wilfgrainger/tinygame#1`

**Approved design:** `docs/superpowers/specs/2026-08-17-tinyworld-web-v0.1-design.md`

## Global Constraints

- Repository authority is `wilfgrainger/tinygame`; do not import Roblox/Rojo/Luau runtime code or Roblox asset IDs.
- Primary target is Android phone in landscape; desktop web is secondary; iPhone/Safari remains future-compatible but is not the V0.1 acceptance platform.
- Cloudflare Free plan only: Workers Static Assets + Worker + D1. No R2 and no Durable Objects in V0.1.
- Google is the only production account provider in V0.1. No Apple sign-in and no production anonymous-cloud account.
- No multiplayer, friends, chat, trading, co-op, careers, broad mission framework, large economy, paid mechanics, portals, pets, combat, procedural world generation, or LiveOps.
- Persistent state is server-authoritative. The browser sends intent and never authoritative rewards/value.
- No per-frame API calls and no persistence of ordinary transforms/camera/animation state.
- DEV and LIVE use distinct D1 databases and Google origins/client configuration.
- Static assets bypass Worker execution; `assets.run_worker_first` is restricted to `/api/*`.
- Target <=20 MB transferred before first useful control on a cold load and <=10 seconds to first useful control on a reasonable 4G/Wi-Fi connection.
- Target sustained >=30 FPS on the agreed real mid-range Android device; source review and desktop emulation cannot prove this.
- Touch targets are >=44x44 CSS px and safe-area insets are respected.
- Development/acceptance builds visibly show version + commit SHA.
- Production debug-auth bypass is forbidden and guarded by source tests.
- No hot-linked third-party production game assets. Any production asset added later must be repository-owned or vendored with explicit provenance/licence metadata.
- Automated green checks do not override an Android/family visual/gameplay FAIL.

## File Structure Locked by This Plan

```text
.
├── .github/workflows/ci.yml
├── .gitignore
├── .nvmrc
├── AGENTS.md
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── wrangler.jsonc
├── migrations/
│   └── 0001_v0_1_core.sql
├── public/
│   ├── _headers
│   ├── manifest.webmanifest
│   ├── sw.js
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── assets/
│       └── asset-manifest.json
├── scripts/
│   ├── write-release-metadata.mjs
│   ├── verify-source-contract.mjs
│   ├── verify-dist-budget.mjs
│   └── configure-d1-env.mjs
├── src/
│   ├── generated/release.ts
│   ├── shared/
│   │   ├── api.ts
│   │   ├── errors.ts
│   │   ├── ids.ts
│   │   ├── schemas.ts
│   │   └── world.ts
│   ├── worker/
│   │   ├── index.ts
│   │   ├── env.ts
│   │   ├── router.ts
│   │   ├── response.ts
│   │   ├── security.ts
│   │   ├── auth/google.ts
│   │   ├── auth/session.ts
│   │   ├── auth/rateLimit.ts
│   │   ├── db/users.ts
│   │   ├── db/profile.ts
│   │   ├── db/discoveries.ts
│   │   └── db/home.ts
│   └── game/
│       ├── main.ts
│       ├── app/GameApp.ts
│       ├── app/boot.ts
│       ├── api/ApiClient.ts
│       ├── auth/GoogleAuth.ts
│       ├── input/InputState.ts
│       ├── input/KeyboardInput.ts
│       ├── input/TouchInput.ts
│       ├── player/PlayerController.ts
│       ├── player/PlayerView.ts
│       ├── player/CollisionWorld.ts
│       ├── world/WorldDefinition.ts
│       ├── world/heightfield.ts
│       ├── world/meshFactory.ts
│       ├── world/WorldBuilder.ts
│       ├── world/InteractionSystem.ts
│       ├── home/HomeSystem.ts
│       ├── water/WaterSystem.ts
│       ├── vehicles/BikeController.ts
│       ├── vehicles/RaftController.ts
│       ├── ui/Shell.ts
│       ├── ui/Hud.ts
│       └── ui/styles.css
├── tests/
│   ├── unit/
│   │   ├── schemas.test.ts
│   │   ├── world.test.ts
│   │   ├── collision.test.ts
│   │   ├── player-controller.test.ts
│   │   ├── home.test.ts
│   │   ├── water.test.ts
│   │   ├── bike.test.ts
│   │   └── raft.test.ts
│   ├── worker/
│   │   ├── auth.test.ts
│   │   ├── profile.test.ts
│   │   └── persistence.test.ts
│   └── browser/
│       ├── boot.spec.ts
│       ├── mobile-ui.spec.ts
│       └── pwa.spec.ts
└── docs/
    ├── quality/v0.1-android-acceptance.md
    └── superpowers/
        ├── specs/2026-08-17-tinyworld-web-v0.1-design.md
        └── plans/2026-08-17-tinyworld-web-v0.1.md
```

---

### Task 1: Repository foundation, deterministic build, and release/source guards

**Files:** Create `.nvmrc`, `.gitignore`, `README.md`, `AGENTS.md`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `index.html`, release/source/budget scripts, `src/generated/release.ts`, `src/game/main.ts`, styles and CI.

**Interfaces:** Produces `ReleaseMetadata { version, commitSha, buildTime, environment }` in TypeScript and `/release.json`; produces npm commands `dev`, `build`, `typecheck`, `test`, `test:unit`, `test:worker`, `test:browser`, `verify:source`, `verify:dist`, `ci`.

- [ ] **Step 1: Create the pinned package manifest and Node floor**

Use exactly:

```json
{
  "name": "tinygame",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24 <25" },
  "scripts": {
    "prebuild": "node scripts/write-release-metadata.mjs",
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:worker": "vitest run tests/worker",
    "test:browser": "playwright test",
    "verify:source": "node scripts/verify-source-contract.mjs",
    "verify:dist": "node scripts/verify-dist-budget.mjs",
    "ci": "npm run typecheck && npm run verify:source && npm test && npm run build && npm run verify:dist"
  },
  "dependencies": {
    "jose": "6.2.7",
    "playcanvas": "2.21.3",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "1.61.1",
    "typescript": "7.0.2",
    "vite": "8.2.0",
    "vitest": "4.1.10",
    "wrangler": "4.118.0"
  }
}
```

Set `.nvmrc` to `24`, run `npm install`, and commit the generated lockfile.

- [ ] **Step 2: Write the first failing release test**

```ts
import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../../src/generated/release';

describe('release metadata', () => {
  it('exposes the package version', () => {
    expect(APP_VERSION).toBe('0.1.0');
  });
});
```

Run `npm run test:unit -- tests/unit/schemas.test.ts`. Expected: FAIL because the generated module is absent/incomplete.

- [ ] **Step 3: Implement release metadata generation**

`write-release-metadata.mjs` reads `package.json`, resolves `GITHUB_SHA || CF_PAGES_COMMIT_SHA || git rev-parse HEAD || "local"`, resolves `TINY_ENV || "local"`, and writes `src/generated/release.ts` plus `public/release.json`. It must not throw merely because `.git` is absent.

- [ ] **Step 4: Add Vite and the minimal shell**

Use `build.target = 'baseline-widely-available'`, sourcemaps, and hashed `assets/`. `index.html` contains exactly the game canvas and UI root; `main.ts` shows a visible build stamp before any 3D code.

- [ ] **Step 5: Add source/distribution guards**

The source guard scans tracked source/config for forbidden V0.1 dependencies/terms (`R2Bucket`, `DurableObject`, Roblox/Rojo imports, production auth bypass), secret files, and private keys. The dist guard fails any asset >25 MiB or total initial `dist/` >20 MiB and prints byte totals by extension.

- [ ] **Step 6: Add credential-free CI**

GitHub Actions uses Node 24, `npm ci`, installs Playwright Chromium, runs `npm run ci`, then browser tests. No Cloudflare deployment occurs in this task.

- [ ] **Step 7: Verify and commit**

```bash
npm run ci
npm run test:browser
git add .
git commit -m "chore: bootstrap TinyWorld web foundation"
```

---

### Task 2: Shared contracts, Worker router, D1 schema, and local API harness

**Files:** Create `wrangler.jsonc`, `migrations/0001_v0_1_core.sql`, shared contracts, Worker env/response/router/index, and Worker tests.

**Interfaces:** `Env` exposes `DB`, `ASSETS`, `GOOGLE_CLIENT_ID`, `ALLOWED_ORIGIN`, `SESSION_PEPPER`, `AUTH_RATE_LIMIT_SALT`, `TINY_ENV`. Shared API types include `ApiSuccess<T>`, `ApiFailure`, `ApiErrorCode`.

- [ ] **Step 1: Write strict-schema tests**

```ts
expect(() => ProfilePatchSchema.parse({ playerName: 'Willow', coins: 999 })).toThrow();
expect(HomeStateSchema.parse({ lampOn: true })).toEqual({ lampOn: true });
expect(() => HomeStateSchema.parse({ lampOn: true, inventory: [] })).toThrow();
```

Run and confirm FAIL.

- [ ] **Step 2: Implement narrow shared contracts**

```ts
export const DISCOVERY_IDS = ['mountain-summit', 'woodland-grove', 'harbour-lookout'] as const;
export const SPAWN_IDS = ['village-square', 'home-lane', 'harbour'] as const;

export const ProfilePatchSchema = z.object({
  playerName: z.string().trim().min(1).max(24).optional(),
  lastSpawnId: z.enum(SPAWN_IDS).optional()
}).strict();

export const HomeStateSchema = z.object({ lampOn: z.boolean() }).strict();
```

Error codes are exactly `AUTH_REQUIRED`, `INVALID_REQUEST`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `SAVE_FAILED`, `UNSUPPORTED_VERSION`, `RATE_LIMITED`, `INTERNAL`.

- [ ] **Step 3: Create the core D1 migration**

Create tables `users`, `sessions`, `player_profiles`, `player_discoveries`, `player_home_state`, `auth_rate_limits`, foreign keys and indexes. Use `google_sub` as unique external identity, token hashes only for sessions, strict `(user_id, discovery_id)` primary key, and boolean-check constraint for `lamp_on`.

- [ ] **Step 4: Configure Wrangler for assets-first routing**

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "tinygame",
  "main": "./src/worker/index.ts",
  "compatibility_date": "2026-08-17",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*"]
  },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "tinygame-local",
    "database_id": "00000000-0000-0000-0000-000000000001",
    "preview_database_id": "00000000-0000-0000-0000-000000000001",
    "migrations_dir": "migrations"
  }]
}
```

The static UUID is local/test-only and must not be used remotely.

- [ ] **Step 5: Implement router shell**

`GET /api/health` returns version/environment in the shared success envelope. Unknown `/api/*` returns 404 `NOT_FOUND`. Worker code never proxies ordinary static files.

- [ ] **Step 6: Test local D1 + Worker**

Use Wrangler `createTestHarness()` in Vitest. Apply migrations locally and assert health + 404 contracts:

```bash
npx wrangler d1 migrations apply tinygame-local --local
npm run test:worker
```

- [ ] **Step 7: Commit**

```bash
git add wrangler.jsonc migrations src/shared src/worker tests
git commit -m "feat: add Cloudflare API and D1 foundation"
```

---

### Task 3: Google verification, opaque sessions, origin checks, and account bootstrap

**Files:** Create `security.ts`, Google/session/rate-limit modules, `db/users.ts`; modify router; add `auth.test.ts`.

**Interfaces:** `GoogleVerifier.verify(credential)` returns stable Google `sub` + optional metadata. `createSession` returns token/expiry. `requireSession` returns internal session identity. Routes: `POST /api/auth/google`, `POST /api/auth/logout`, `GET /api/me`.

- [ ] **Step 1: Write auth tests with injected verifier**

Cover missing/invalid credential, valid account bootstrap, secure cookie flags, `/api/me`, logout, wrong Origin, and >5 login attempts in 60 seconds. Automated tests must never call live Google.

- [ ] **Step 2: Implement Google verification using `jose`**

```ts
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
  issuer: ['https://accounts.google.com', 'accounts.google.com'],
  audience: env.GOOGLE_CLIENT_ID
});
if (typeof payload.sub !== 'string' || payload.sub.length === 0) throw new AuthError();
```

Do not trust client-supplied profile fields as identity proof.

- [ ] **Step 3: Implement opaque sessions**

Generate 32 random bytes, base64url encode, SHA-256 token + server pepper, store hash only, fixed 30-day expiry. Cookie is exactly `tinyworld_session; HttpOnly; Secure; SameSite=Lax; Path=/`.

- [ ] **Step 4: Implement mutation Origin validation and rate limit**

Require exact `Origin === ALLOWED_ORIGIN` for cookie-authenticated mutations. For login rate limit, hash `CF-Connecting-IP + AUTH_RATE_LIMIT_SALT`, never store raw IP, use a 60-second window/5 attempts, return `Retry-After: 60`.

- [ ] **Step 5: Implement first-login bootstrap**

Create user UUID, profile and home state transactionally. Default player name is truncated Google name or `Tiny Explorer`. Subsequent logins update login metadata and rotate session without resetting progression.

- [ ] **Step 6: Verify and commit**

```bash
npm run test:worker -- tests/worker/auth.test.ts
npm run typecheck
git add src/worker tests/worker/auth.test.ts
git commit -m "feat: add Google authentication and sessions"
```

---

### Task 4: Profile, discovery, home APIs, and authoritative persistence

**Files:** Create DB modules for profile/discovery/home; modify router; create persistence tests.

**Interfaces:** Routes `GET /api/profile`, `PUT /api/profile`, `GET /api/world/bootstrap`, `POST /api/discoveries/:id`, `POST /api/home/save`. Bootstrap returns `{ profile, discoveries, home }` only.

- [ ] **Step 1: Write persistence tests**

Test unauthenticated mutation, unknown/oversize profile fields, invalid spawn/discovery IDs, idempotent repeated discovery, exact home shape, bounded bootstrap, and DB failure -> `SAVE_FAILED`.

- [ ] **Step 2: Implement prepared-statement reads/writes**

No SQL string concatenation. Validate all mutation bodies with Zod before D1. Server owns timestamps.

- [ ] **Step 3: Implement idempotent discovery**

```sql
INSERT INTO player_discoveries (user_id, discovery_id, discovered_at)
VALUES (?1, ?2, ?3)
ON CONFLICT(user_id, discovery_id) DO NOTHING;
```

- [ ] **Step 4: Verify and commit**

```bash
npm run test:worker -- tests/worker/persistence.test.ts tests/worker/profile.test.ts
npm run typecheck
git add src/worker tests/worker
git commit -m "feat: add authoritative TinyWorld persistence"
```

---

### Task 5: Browser shell, Google UX, API client, and PlayCanvas bootstrap

**Files:** Create `ApiClient`, `GoogleAuth`, boot/GameApp, Shell/Hud, styles, `_headers`, browser boot tests.

**Interfaces:** `ApiClient` exposes `me`, `bootstrap`, `saveProfile`, `saveDiscovery`, `saveHome`, `logout`; `GameApp.start(bootstrap)`; UI states `loading | signed-out | entering | playing | fatal`.

- [ ] **Step 1: Write browser boot tests with mocked API**

Initial loading + build stamp; 401 -> Google button; authenticated bootstrap -> canvas/HUD; bootstrap failure -> retry screen; Android viewport keeps controls visible.

- [ ] **Step 2: Implement `ApiClient`**

Every call uses `credentials: 'include'`, bounded JSON and `X-TinyWorld-Version: APP_VERSION`; map non-2xx responses to typed shared codes.

- [ ] **Step 3: Implement Google Identity Services loader**

Load `https://accounts.google.com/gsi/client` once. Initialize with public `VITE_GOOGLE_CLIENT_ID`; post returned credential directly to `/api/auth/google`; do not decode it for authority. Private Worker material never uses `VITE_*`.

- [ ] **Step 4: Implement exactly one PlayCanvas `Application`**

Own canvas, resize and destruction in `GameApp`. Cap initial mobile DPR at 1.5. Add camera/light/background and a named `DevFlatGround` internal scaffold only; Task 7 must delete it before visual acceptance.

- [ ] **Step 5: Add restrictive static security headers**

`public/_headers` includes `nosniff`, strict referrer, DENY framing, camera/microphone/geolocation disabled and a CSP allowing only self + documented Google GIS script/frame/connect origins. Do not disable CSP to make login work.

- [ ] **Step 6: Verify and commit**

```bash
npm run build
npm run test:browser -- tests/browser/boot.spec.ts
npm run verify:source
git add src/game public/_headers tests/browser
git commit -m "feat: add TinyWorld browser and auth shell"
```

---

### Task 6: Unified touch/desktop input, deterministic player controller, and collision

**Files:** Input modules, collision/player controller/view, GameApp integration, movement/collision/mobile tests.

**Interfaces:**

```ts
export type InputFrame = {
  moveX: number; moveY: number;
  lookX: number; lookY: number;
  jumpPressed: boolean;
  interactPressed: boolean;
};
```

`PlayerController.update(dt,input)` returns snapshot; `CollisionWorld.resolveMove(position,delta,radius)` returns resolved position.

- [ ] **Step 1: Write failing deterministic movement/collision tests**

Axes clamped; speed stable across frame subdivision; jump grounded-only; AABB house blocks player; foliage can be non-collidable; below recovery Y returns safe spawn.

- [ ] **Step 2: Implement pure kinematic state**

Use circle footprint in XZ, AABB/circle colliders, sampled terrain height, gravity/jump and explicit `grounded | airborne | swimming | bike | raft` states. Do not add ammo.js, ragdolls or arbitrary rigid bodies.

- [ ] **Step 3: Implement keyboard and touch input**

Desktop: WASD, mouse, Space, E, Esc. Mobile: left Pointer-Event stick, right camera drag area, jump and context buttons. Use `touch-action:none` only on game controls, safe-area env vars and >=44x44 CSS px action targets.

- [ ] **Step 4: Implement stylised original player view**

Build a small cohesive PlayCanvas low-poly silhouette with visible head/body/legs and movement-facing orientation. Its visual acceptance remains human-gated.

- [ ] **Step 5: Verify and commit**

```bash
npm run test:unit -- tests/unit/collision.test.ts tests/unit/player-controller.test.ts
npm run test:browser -- tests/browser/mobile-ui.spec.ts
git add src/game/input src/game/player tests
git commit -m "feat: add mobile-first player controls"
```

---

### Task 7: Non-flat authored world: village, home lane, woodland, mountain, harbour

**Files:** Shared world contract, WorldDefinition, heightfield, meshFactory, WorldBuilder, InteractionSystem, GameApp, asset manifest, world tests.

**Interfaces:** `heightAt(x,z)`; `WORLD_DEFINITION`; `WorldRuntime { colliders, interactions, waterBounds, spawnPoints }`.

- [ ] **Step 1: Write topology tests before rendering**

Exactly five zones; summit >=18 units above square; >=2 mountain switchback/terrace waypoints; shoreline descends; ordinary routes >=6 units wide with target 8-12; all three discoveries reachable; no universal `groundY=0` authority.

- [ ] **Step 2: Implement deterministic varied terrain**

Use approximately 160x160 world. Village near origin; Mountain Rise north-east; Woodland west/north-west; Home Lane south-west; Harbour south-east. Combine gentle base slope, smooth mountain mound and terraces. No giant flat slab.

- [ ] **Step 3: Build low-poly heightfield + terrain-following path ribbons**

Generate a grid mesh with recalculated normals and reused materials; path ribbons sample `heightAt()` so they do not float as flat plates.

- [ ] **Step 4: Compose recognisable original forms**

Village marker/fountain, 4-6 small houses, distinct player home, clustered woodland canopy/trunks/rocks/logs, mountain terraces/lookout, harbour dock/beach/mooring. Hero structures use restrained body/trim colour families and must read with labels hidden.

- [ ] **Step 5: Delete `DevFlatGround` and guard it**

Remove the Task 5 scaffold. Extend source guard so `DevFlatGround` outside tests/docs fails.

- [ ] **Step 6: Register simple collision proxies + discoveries**

Foliage mostly non-collidable. Discovery triggers: `mountain-summit`, `woodland-grove`, `harbour-lookout`.

- [ ] **Step 7: Verify and commit**

```bash
npm run test:unit -- tests/unit/world.test.ts tests/unit/collision.test.ts
npm run build
npm run verify:dist
git add src/shared/world.ts src/game/world src/game/app/GameApp.ts public/assets tests/unit/world.test.ts scripts/verify-source-contract.mjs
git commit -m "feat: build TinyWorld village and terrain"
```

---

### Task 8: Home interaction, discovery saves, and honest save-state UI

**Files:** `HomeSystem`, InteractionSystem/GameApp/Hud changes, home tests, browser updates.

**Interfaces:** `HomeSystem.setLamp(on)` returns `saved|failed`; interactions emit discovery/home intents; HUD shows `saving`, `saved`, `save failed`.

- [ ] **Step 1: Write home/discovery state tests**

Lamp starts from bootstrap; visual change -> saving before API; success -> saved; failure rolls back or visibly remains unsaved; discovery persists once; movement never calls persistence API.

- [ ] **Step 2: Build enterable home with three readable interactions**

Persistent lamp toggle, transient chair sit/stand, transient cupboard open/close. No full furniture catalogue.

- [ ] **Step 3: Connect discovery persistence**

First trigger calls `/api/discoveries/:id`, then small toast after server confirmation. Client never supplies reward value.

- [ ] **Step 4: Implement truthful failure/retry**

Network/Worker failure shows `Save failed — retry`; never render `Saved` before a success response.

- [ ] **Step 5: Verify and commit**

```bash
npm run test:unit -- tests/unit/home.test.ts
npm run test:browser -- tests/browser/boot.spec.ts
git add src/game/home src/game/world src/game/ui src/game/app tests
git commit -m "feat: add home and persistent discoveries"
```

---

### Task 9: Swimming, shoreline transition, and recovery

**Files:** `WaterSystem`, PlayerController, WorldBuilder, water tests.

**Interfaces:** `WaterSystem.contains(x,z)`, `surfaceY`; player states remain mutually exclusive.

- [ ] **Step 1: Write water tests**

Enter water -> swimming; surface convergence; touch movement works; shoreline returns to grounded only when safe; below recovery Y restores safe spawn; swim cannot coexist with bike/raft.

- [ ] **Step 2: Build bounded mobile-safe water presentation**

Simple animated material only, no expensive reflection/refraction. Terrain slopes physically into water and recovery prevents an endless void.

- [ ] **Step 3: Implement swim state**

Swim slower than walk; stable surface damping; camera defaults above water; controls stay familiar.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:unit -- tests/unit/water.test.ts tests/unit/player-controller.test.ts
git add src/game/water src/game/player src/game/world tests/unit/water.test.ts
git commit -m "feat: add swimming and shoreline recovery"
```

---

### Task 10: Tiny Bike as a real mounted direct-control vehicle

**Files:** `BikeController`, PlayerController/View, WorldBuilder, bike tests.

**Interfaces:** `mount`, `update`, `dismount`, `reset`; no follower-transform architecture.

- [ ] **Step 1: Write lifecycle/handling tests**

Proximity required; mount disables walking; bike faster than walk; turning radius; safe dismount; water recovery; reset no duplicates; source guard forbids continuous unrelated bike-follow transform.

- [ ] **Step 2: Build recognisable bicycle visual**

Two wheels, visible frame, seat, handlebars. Mounted player visibly occupies the bike. Wheels rotate from travelled distance. It must read as bicycle with labels hidden.

- [ ] **Step 3: Implement direct controls + collision**

Move stick/WASD controls throttle/steer; one context action dismounts; larger collision footprint; dismount tests left/right safe candidates.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:unit -- tests/unit/bike.test.ts tests/unit/collision.test.ts
npm run build
git add src/game/vehicles/BikeController.ts src/game/player src/game/world tests/unit/bike.test.ts
git commit -m "feat: add real rideable Tiny Bike"
```

---

### Task 11: Tiny Raft as a physical harbour vehicle

**Files:** `RaftController`, PlayerController/View, WorldBuilder, WaterSystem, raft tests.

**Interfaces:** `mount`, `update`, `dismount`, `reset`; raft constrained to designated water.

- [ ] **Step 1: Write raft tests**

Starts at mooring in water; proximity boarding; no teleport traversal; continuous throttle/turn; speed < bike and calmer steering; cannot drive inland; safe dismount; reset no duplicate.

- [ ] **Step 2: Build charming original raft**

Low-poly wooden deck/planks, restrained lash/edge detail and small steering/pole visual. Spawn only at harbour mooring.

- [ ] **Step 3: Implement water-constrained direct controls**

Reuse unified input. Clamp/resolve against water bounds and harbour collision. No destination teleport.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:unit -- tests/unit/raft.test.ts tests/unit/water.test.ts
npm run build
git add src/game/vehicles/RaftController.ts src/game/player src/game/world src/game/water tests/unit/raft.test.ts
git commit -m "feat: add controllable Tiny Raft"
```

---

### Task 12: PWA, Android checks, Cloudflare DEV deployment, and human acceptance

**Files:** Manifest, service worker, original 192/512 icons, PWA tests, Android acceptance doc, `scripts/configure-d1-env.mjs`, Wrangler/README/CI/budget updates.

**Interfaces:** Installable Android PWA; exact DEV deployment procedure; release-blocking human evidence.

- [ ] **Step 1: Write PWA tests first**

Manifest 200 + TinyWorld/standalone/landscape/start URL; service worker registers in production preview; `/release.json` matches UI stamp; API never comes from SW cache; cache version upgrades cleanly; icons are valid PNG.

- [ ] **Step 2: Implement conservative service-worker caching**

Cache only successful same-origin immutable `/assets/*`, icons and manifest. Navigation is network-first. Never cache `/api/*`, Google responses or auth data. Cache name includes app version; activate deletes old TinyWorld caches.

- [ ] **Step 3: Add Android manifest/icons**

```json
{
  "name": "TinyWorld",
  "short_name": "TinyWorld",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#f4ead7",
  "theme_color": "#496a4f",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Icons are original repo-generated TinyWorld art, not third-party logos.

- [ ] **Step 4: Create DEV D1 and configure actual generated ID**

Create `scripts/configure-d1-env.mjs` to read `wrangler d1 info --json`, extract `uuid || database_id || id`, and write `env.dev` with `name=tinygame-dev`, `TINY_ENV=dev`, `DB` binding, exact returned ID and migrations directory.

Run:

```bash
npx wrangler d1 create tinygame-dev --location weur
npx wrangler d1 info tinygame-dev --json > /tmp/tinygame-dev-d1.json
node scripts/configure-d1-env.mjs dev /tmp/tinygame-dev-d1.json
```

Verify the committed ID exactly matches `d1 info` output.

- [ ] **Step 5: Configure Google DEV origin + Worker values**

In Google Cloud Console create a Web application OAuth client with authorized JavaScript origins for the exact DEV HTTPS origin and `http://localhost:5173`. No client secret ships to browser. Put the same public client ID in Worker `GOOGLE_CLIENT_ID` and the client build as `VITE_GOOGLE_CLIENT_ID`.

Set Worker values:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID --env dev
npx wrangler secret put SESSION_PEPPER --env dev
npx wrangler secret put AUTH_RATE_LIMIT_SALT --env dev
npx wrangler secret put ALLOWED_ORIGIN --env dev
```

Never reuse LIVE D1 or LIVE secret values.

- [ ] **Step 6: Apply migrations and deploy exact DEV candidate**

After exporting the actual Google client ID into the build shell as `GOOGLE_CLIENT_ID`:

```bash
npx wrangler d1 migrations apply tinygame-dev --env dev --remote
VITE_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" TINY_ENV=dev npm run build
npx wrangler deploy --env dev
```

Confirm `/release.json` Git SHA equals the exact commit being accepted.

- [ ] **Step 7: Run clean automated final gate**

```bash
npm ci
npm run ci
npm run test:browser
```

All must PASS.

- [ ] **Step 8: Run real Android acceptance and record evidence**

Record device/Android/Chrome, exact URL and SHA, cold load/bytes, observed FPS through village/woodland/mountain/bike/raft, Google auth, PWA install, touch movement/camera/jump, home save/reload, swim/recovery, bike, raft, console/network errors and human `ANDROID ACCEPTANCE: PASS|FAIL`. Missing observation is `NOT RUN`, not PASS.

- [ ] **Step 9: Run family gameplay acceptance**

Without mission instructions, record at least three independently enjoyed activities/discoveries; finished-vs-building-site feel; terrain; bike ride quality; raft physicality; touch obstruction; human `FAMILY ACCEPTANCE: PASS|FAIL`. Family FAIL blocks completion regardless of CI.

- [ ] **Step 10: Keep LIVE separate and explicit**

Do not create/deploy LIVE automatically. README states LIVE needs `tinygame-live` D1, production Google origin/client, fresh secrets, and explicit owner promotion. V0.1 completion means accepted DEV candidate ready for promotion, not silent LIVE publishing.

- [ ] **Step 11: Commit PWA/release contract**

```bash
git add public tests/browser/pwa.spec.ts docs/quality README.md wrangler.jsonc .github scripts
git commit -m "feat: add Android PWA and release acceptance gates"
```

---

## Final Verification Before PR Is Marked Ready

From a clean checkout of exact head:

```bash
npm ci
npm run typecheck
npm run verify:source
npm test
npm run build
npm run verify:dist
npm run test:browser
```

Then require the exact candidate evidence file to contain:

```text
ANDROID ACCEPTANCE: PASS
FAMILY ACCEPTANCE: PASS
```

with tested Git SHA matching `/release.json`. If either human result is FAIL or NOT RUN, keep issue #1 open and the candidate unaccepted.

## Plan Self-Review

- Spec coverage: repository/bootstrap, Cloudflare Free routing, D1, Google auth/session security, server-authoritative persistence, mobile controls, world topology, home, swimming, bike, raft, PWA, performance, DEV/LIVE separation, exact-build evidence, Android acceptance and family acceptance all map to tasks.
- Scope exclusions are guarded globally and by source verification; no multiplayer, R2, Durable Objects, Apple auth, missions/economy, portals or paid systems are introduced.
- V0.1 deliberately omits ammo.js because the approved spec requires it only where justified. Deterministic kinematic movement satisfies the required verbs while reducing first-load cost; adding ammo later requires measured evidence and a separate change.
- Interface names are consistent across tasks: `InputFrame`, `WorldBootstrap`, `ApiClient`, `CollisionWorld`, `PlayerController`, `WaterSystem`, `BikeController`, `RaftController`.
- External generated values are limited to Cloudflare D1 IDs and identity/secret values created by Cloudflare/Google; commands/scripts consume real generated values rather than committing dummy IDs.
- Automated checks never claim real-device visual/gameplay quality.