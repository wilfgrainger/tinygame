# TinyWorld Agent Contract

This repository is authoritative for the browser/mobile TinyWorld game.

## Read order

Before meaningful work, read in this order:

1. `VISION.md` — product truth and quality bar.
2. `progress.md` — current factual state, exact candidate and blockers.
3. `ARCHITECTURE.md` — implemented system boundaries.
4. active approved design/spec under `docs/superpowers/specs/`.
5. active implementation plan under `docs/superpowers/plans/`, if one exists.
6. controlling issue / PR discussion.

If these documents disagree, stop treating the older statement as current truth. `VISION.md` owns product intent; `progress.md` owns current state; code/tests own implementation facts.

## V0.1 hard constraints

- Android phone landscape is the primary acceptance platform. Desktop web is secondary.
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

The current branch already contains non-core roleplay texture such as NPCs, shops, props, emotes, roles and a mini-car. Keep or improve those only when doing so directly improves V0.1 quality, performance or coherence.

Do **not** add more jobs, shops, props, NPCs, vehicles, menus or progression systems simply because they are easy to add.

When a system looks complete in UI but its world behaviour or persistence is fake, either make the promise real or remove/simplify the feature.

## Originality

TinyWorld must develop its own visual and product language.

Do not use another game name as an internal architecture/product identity. Comparisons may appear in research or historical notes only. Never copy identifiable maps, buildings, UI, characters, logos, assets, names or distinctive expression from another game.

## World and movement rules

- No giant flat baseplate or giant flat road slabs across authored terrain.
- Roads/paths must follow or intentionally shape the terrain.
- Terrain must have meaningful traversability: step/slope limits matter.
- A path to the summit should matter; players and vehicles must not mountain-goat directly up arbitrary cliffs.
- Decorative geometry should not create invisible collision clutter.
- Water must support swimming, safe recovery and physical Tiny Raft use.
- Tiny Bike and Tiny Raft are quality gates: direct control, visible occupancy, safe mount/dismount, no follower-prop behaviour.

## Mobile quality rules

- Touch controls are first-class, not emulated desktop controls.
- No stuck/phantom movement after pointer release, cancellation, app backgrounding or focus loss.
- Effective touch targets should be >=44x44 CSS px.
- UI must respect safe areas and not obscure core play.
- Target sustained >=30 FPS on the real acceptance Android device.
- Measure before speculative performance optimisation, but fix measured regressions before adding features.

## Engineering workflow

- Work on a branch/PR, never directly on `main` for meaningful implementation.
- Use TDD for deterministic bug fixes and behaviour changes: failing test first, then minimal fix.
- Run `npm run ci` and `npm run test:browser` before claiming automated completion.
- Keep dependencies pinned and `package-lock.json` committed.
- Keep GitHub Actions storage-frugal: public runner compute is allowed; routine CI must not upload artifacts/packages.
- No production debug-auth bypass, private keys, committed secret files, hot-linked production game assets or invented cloud IDs.

## Handoff contract

`progress.md` is factual handoff state, not a marketing changelog.

Every implementation session that changes the candidate must update it with:

- branch HEAD SHA;
- playable/deployed candidate SHA, if different;
- latest CI evidence;
- what is genuinely implemented;
- known defects and risks;
- exact next actions;
- external/human tasks still required.

Do not write `PASS` or `VERIFIED` where evidence is only code inspection or assumption.

## Release acceptance

V0.1 cannot be called accepted until the exact deployed candidate records:

- `ANDROID ACCEPTANCE: PASS`
- `FAMILY ACCEPTANCE: PASS`

in `docs/quality/v0.1-android-acceptance.md`.

Missing evidence is `NOT RUN`. A human gameplay/visual FAIL overrides green CI.
