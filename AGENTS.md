# TinyWorld Agent Contract

This repository is authoritative for the browser/mobile TinyWorld game.

## Read order

Before meaningful work, read in this order:

1. `VISION.md` — product truth and quality bar.
2. `progress.md` — current factual state, frozen gameplay candidate and blockers.
3. `ARCHITECTURE.md` — implemented system boundaries.
4. active approved design/spec under `docs/superpowers/specs/`.
5. active implementation plan under `docs/superpowers/plans/`, if one exists.
6. controlling issue / PR discussion.

If these documents disagree, stop treating the older statement as current truth. `VISION.md` owns product intent; `progress.md` owns current state; code/tests own implementation facts.

## V0.1 hard constraints

- Android phone landscape is the primary acceptance platform. Desktop web is secondary.
- Portrait is not the formal target but must remain mechanically correct.
- One TypeScript/PlayCanvas web/PWA codebase. No Android gameplay fork.
- Cloudflare Free-plan architecture only: Workers Static Assets + Worker + D1.
- Google sign-in only for V0.1.
- No R2 or Durable Objects in V0.1.
- No multiplayer, friends, open chat, trading, co-op, broad missions, paid mechanics, portals, pets, combat or Apple auth before V0.1 acceptance.
- Persistent player value/state is server-authoritative. Client sends intent, never authoritative rewards/value.
- Never persist ordinary movement/camera/animation state per frame.
- DEV and LIVE resources remain separate.

## Feature freeze

V0.1 is under **feature freeze** until Android and family acceptance pass.

The current game already contains non-core roleplay texture such as NPCs, shops, props, emotes, roles and a mini-car. Keep or improve those only when doing so directly improves V0.1 quality, performance or coherence.

Do **not** add more jobs, shops, props, NPCs, vehicles, menus or progression systems simply because they are easy to add.

When a system looks complete in UI but its world behaviour or persistence is fake, either make the promise real or remove/simplify it.

## Priority control contract

The control model is release-critical and was redesigned after real owner device evidence. Do not casually rewrite it.

Required behaviour:

- left stick movement is **camera-relative**;
- avatar visual body facing follows **actual travel direction**;
- right-side drag changes camera yaw/pitch independently of avatar body facing;
- standing still keeps the avatar's last facing while camera can orbit;
- no default sideways/backwards sliding or moonwalking presentation;
- camera pitch remains in the simple mobile range unless device evidence justifies changing it;
- radial deadzone suppresses tiny touch drift;
- movement release should feel prompt rather than floaty;
- animation speed follows actual displacement rather than raw stick noise;
- losing pointer/focus/visibility must not leave stuck movement.

Maintain separation between:

```text
raw input → camera-relative movement → player position → avatar visual facing
                              ↘ camera yaw/pitch remains independent
```

Do not merge camera yaw and avatar visual yaw back into one concept.

## World and movement rules

- No giant flat baseplate or giant flat road slabs across authored terrain.
- Roads/paths must follow or intentionally shape the terrain.
- Terrain has explicit step/slope traversability.
- A path to the summit must matter; players and vehicles must not mountain-goat directly up arbitrary cliffs.
- Decorative geometry must not create invisible collision clutter.
- `QualityScenery` is presentation-only and non-colliding unless a future approved design explicitly changes that contract.
- Water supports swimming, safe recovery and physical Tiny Raft use.
- Tiny Bike and Tiny Raft are quality gates: direct control, visible occupancy, safe mount/dismount, no follower-prop behaviour.

## 20x quality module boundaries

Preserve these focused boundaries rather than moving logic back into `GameApp.ts`:

- `player/controlModel.ts` — camera-relative control math.
- `player/movementFeel.ts` — deadzone and movement response.
- `player/cameraRig.ts` — camera target/damping math.
- `vehicles/vehicleFeel.ts` — bike/raft response and presentation math.
- `vehicles/RaftWake.ts` — cheap reusable raft wake visuals.
- `world/qualityComposition.ts` — deterministic authored decorative scene data.
- `world/QualityScenery.ts` — non-colliding quality scene renderer.
- `world/particlePool.ts` — bounded reusable atmosphere pools.

`GameApp.ts` is a composition root, not the preferred home for new algorithms.

## Mobile quality rules

- Touch controls are first-class, not emulated desktop controls.
- No stuck/phantom movement after pointer release, cancellation, app backgrounding or focus loss.
- Effective touch targets should be >=44x44 CSS px.
- UI must respect safe areas and not obscure core play.
- Main V0.1 directional shadow map is currently capped at 1024; do not increase it without real-device evidence.
- Avoid per-frame object/entity allocation in core update loops when a reusable object/pool is practical.
- Target sustained >=30 FPS on the real acceptance Android device.
- Measure before speculative performance optimisation, but fix measured regressions before adding features.

## Originality

TinyWorld must develop its own visual and product language.

Do not use another game name as an internal architecture/product identity. Comparisons may appear in research or historical notes only. Never copy identifiable maps, buildings, UI, characters, logos, assets, names or distinctive expression from another game.

## Engineering workflow

- Work on a branch/PR, never directly on `main` for meaningful implementation.
- Use TDD for deterministic bug fixes and behaviour changes: failing test first, then minimal fix.
- Run `npm run ci` and `npm run test:browser` before claiming automated completion.
- Keep dependencies pinned and `package-lock.json` committed.
- Keep GitHub Actions storage-frugal: public runner compute is allowed; routine CI must not upload artifacts/packages.
- No production debug-auth bypass, private keys, committed secret files, hot-linked production game assets or invented cloud IDs.
- Do not use a green older SHA as evidence for a newer gameplay commit.

## Handoff contract

`progress.md` is factual handoff state, not a marketing changelog.

Every implementation session that changes gameplay/runtime code must record:

- active branch and PR;
- **last code-verified gameplay candidate SHA**;
- latest exact-candidate CI evidence;
- what is genuinely implemented;
- known defects/risks;
- exact next actions;
- external/human tasks still required.

Documentation-only commits may advance the PR head after the frozen gameplay SHA. Do not recursively edit `progress.md` merely to chase its own documentation commit SHA; GitHub PR metadata is authoritative for the current branch head.

If gameplay/runtime code changes after a frozen candidate is named, replace that candidate only after fresh exact-head verification and reset affected human acceptance evidence.

Do not write `PASS` or `VERIFIED` where evidence is only code inspection or assumption.

## Release acceptance

V0.1 cannot be called accepted until the exact deployed gameplay candidate records:

- `ANDROID ACCEPTANCE: PASS`
- `FAMILY ACCEPTANCE: PASS`

in `docs/quality/v0.1-android-acceptance.md`.

Before testing, live `/release.json`, visible build stamp and the candidate named in `progress.md` must agree.

Missing evidence is `NOT RUN`. A human gameplay/visual FAIL overrides green CI.
