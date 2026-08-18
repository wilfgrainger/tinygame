# TinyWorld Web V0.1 Implementation Plan

**Status:** SUBSTANTIALLY EXECUTED / RELEASE HARDENING REMAINS  
**Original plan:** 17 August 2026  
**Refreshed:** 18 August 2026  
**Controlling issue:** #1  
**Implementation PR:** #2  
**Approved design:** `docs/superpowers/specs/2026-08-17-tinyworld-web-v0.1-design.md`

> Historical note: the original detailed task-by-task implementation plan is preserved in Git history. This refreshed file is the plan future sessions should execute. Do not replay completed bootstrap tasks from the historical version.

## Goal

Deliver an accepted TinyWorld V0.1: one Android-first browser/PWA game with Google sign-in, Cloudflare/D1 persistence, an authored world, reliable touch movement, swimming, Tiny Bike, Tiny Raft, a small persistent home interaction and exact-build Android/family acceptance.

## Architecture already established

- Node 24, TypeScript, Vite and PlayCanvas Engine.
- one package/codebase rather than a monorepo.
- `src/game` browser game, `src/worker` Worker API, `src/shared` contracts.
- Workers Static Assets serve the client; `/api/*` invokes Worker.
- Cloudflare D1 persistence.
- Google Identity Services with server verification and opaque TinyWorld sessions.
- deterministic kinematic movement/vehicles; no full rigid-body dependency in V0.1.
- Vitest + Playwright + source/dist guards.
- pinned dependencies and committed `package-lock.json`.
- storage-frugal public-repo GitHub Actions.

## Completed foundation

The following plan areas are implemented and should not be rebuilt unless a regression requires it:

- repository/build/release metadata foundation;
- source/security/distribution guards;
- Worker router and D1 migration;
- Google authentication and session rotation;
- strict profile/discovery/home contracts;
- DEV D1/Worker configuration and deployment;
- browser shell and Google sign-in UX;
- PlayCanvas application bootstrap;
- touch + desktop input;
- player controller/collision baseline;
- authored terrain and five core zones;
- contextual interaction framework;
- swimming;
- Tiny Bike;
- Tiny Raft;
- home interaction and lamp persistence;
- PWA manifest/service worker/icons;
- current optional roleplay texture (NPCs, shops, props, emotes, mini-car, music);
- CI and browser-emulation checks.

Current implementation facts must be read from `progress.md`, not inferred from this list.

## Feature freeze

No new gameplay system is planned before V0.1 acceptance.

Do not add more:

- jobs;
- shops;
- props;
- NPC collections;
- vehicles;
- missions;
- progression/economy;
- multiplayer/social systems;
- portals/worlds.

The remaining plan is **quality and evidence**, not feature count.

## Remaining release plan

### Task R1 — Restore terrain/road coherence

**Goal:** eliminate flat-road regression while keeping the town readable.

Requirements:

- no giant flat road slabs crossing undulating terrain;
- road surface follows terrain or intentionally flattens a bounded road corridor;
- curb/sidewalk treatment must not hover or bury unpredictably;
- mountain/home/woodland/harbour routes remain readable;
- no return to a giant flat baseplate.

Verification:

- deterministic/source regression test where appropriate;
- production build + browser tests;
- real-device visual check remains required.

### Task R2 — Add terrain traversability rules

**Goal:** paths and mountain design matter physically.

Requirements:

- walking allows small steps and normal slopes;
- abrupt height changes/cliffs reject movement;
- bike/car traversability is no more permissive than walking and preferably stricter;
- normal mountain route remains reachable;
- safe spawn/recovery remains reliable.

Implementation should extend the existing lightweight collision/heightfield model rather than importing a large physics engine.

TDD required: failing controller/collision tests first.

### Task R3 — Remove fake house-security promise

**Decision:** V0.1 does not need durable house claiming/locking.

Requirements:

- the player's home is simply their home;
- remove or neutralise UI/world text implying persistent ownership or enforced lock state unless a server-backed state/enforcement system exists;
- retain useful home interactions and lamp persistence;
- do not add a new ownership schema/API merely to preserve an unnecessary V0.1 feature.

### Task R4 — Strengthen critical browser regressions

Add high-value gameplay tests, not broad screenshot theatre.

Minimum:

1. touch movement changes player position and release/cancel stops continued movement;
2. one core vehicle path proves mount/control/dismount at controller/browser level where feasible;
3. persisted lamp/save-reload path remains covered at API/behaviour level.

The phantom-joystick bug must have a regression that would fail if release safety nets were removed.

### Task R5 — Produce exact acceptance candidate

After R1-R4:

1. run `npm run ci`;
2. run `npm run test:browser`;
3. confirm latest PR head is mergeable;
4. build with exact release SHA;
5. deploy exact candidate to DEV;
6. confirm `/release.json` matches the deployed candidate;
7. reset `docs/quality/v0.1-android-acceptance.md` to that exact SHA;
8. update `progress.md`.

### Task R6 — Real Android acceptance

On the agreed real Android phone, record:

- cold load to useful control;
- initial bytes/load budget where measurable;
- frame rate through Village → Woodland → Mountain → Harbour → Bike → Raft;
- Google sign-in;
- PWA install/launch;
- touch movement/camera/jump/action;
- stuck/phantom input checks;
- swimming/recovery;
- bike quality;
- raft quality;
- home persistence;
- critical console/network errors.

A failure becomes a code-owned blocker, not a waived acceptance item.

### Task R7 — Family acceptance

Uninstructed play session.

Record at least three activities/discoveries the players independently choose/enjoy.

Explicitly assess:

- finished little world vs building site;
- movement and touch comfort;
- visual coherence;
- woodland/mountain/water interest;
- Tiny Bike;
- Tiny Raft;
- UI obstruction/confusion;
- whether non-core roleplay texture adds life or clutter.

## Completion rule

Issue #1 / V0.1 may close only when the exact deployed candidate has:

```text
ANDROID ACCEPTANCE: PASS
FAMILY ACCEPTANCE: PASS
```

Green CI alone is not completion.

## After V0.1

Any substantial next phase starts with a new Superpowers design/spec rather than extending this plan indefinitely. Candidate directions are listed in `VISION.md`; none is pre-approved merely because it sounds useful.
