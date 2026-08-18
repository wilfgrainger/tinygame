# TinyWorld Web V0.1 Progress

**Repository:** `wilfgrainger/tinygame`  
**Main foundation merge:** `80951318b35f4130bf03eb653d137085ffa44542`  
**Active quality branch:** `feat/v0.1-quality-20x`  
**Active PR:** #4 — `feat: V0.1 20x quality pass`  
**Quality design:** `docs/superpowers/specs/2026-08-18-v0.1-quality-20x-design.md`  
**Quality plan:** `docs/superpowers/plans/2026-08-18-v0.1-quality-20x.md`  
**Frozen code-verified gameplay candidate:** `c3286c7d438d8ac0a79e5f8db9bbc22a8da59f75`  
**Candidate CI:** GitHub Actions run #117 — **PASS**  
**Last updated:** 2026-08-18 Europe/London

## Session handoff

TinyWorld is a mobile-first browser/PWA game. `VISION.md` defines the product. `AGENTS.md` defines agent rules. This file records facts and remaining work only.

The V0.1 foundation was merged to `main` as `80951318`. PR #4 is a quality-only pass built from that foundation. The code-owned 20x pass is now frozen at `c3286c7d438d8ac0a79e5f8db9bbc22a8da59f75`; later documentation-only commits do **not** change the gameplay candidate unless this file explicitly names a new code SHA.

The 20x branch remains feature-frozen. Do not add new feature families before Android/family acceptance.

## Owner evidence that triggered Priority 0

On 2026-08-18 the owner supplied a real Android browser recording showing:

- avatar body facing did not match actual travel;
- movement read as sideways/backwards sliding;
- camera heading and avatar heading were coupled;
- right-side camera/view control did not feel natural;
- the recording was portrait, while landscape remains the formal V0.1 acceptance orientation.

That defect is addressed in code but still requires real-device feel acceptance.

## 20x code-owned work completed

### Controls and movement

- Left stick is camera-relative.
- Avatar visual facing follows actual world travel, not camera yaw.
- Right drag changes camera yaw/pitch independently of avatar body facing.
- Standing still preserves avatar facing while the camera can orbit.
- Camera pitch is constrained to a simple mobile range (`-38°..12°`).
- 12% radial joystick deadzone removes small thumb/input drift.
- On-foot movement uses fast acceleration and faster release/deceleration.
- Walking/swimming animation speed now follows actual travel distance, not raw stick noise.
- Touch focus-loss / pointer-cancel / visibility protections remain in place.

### Camera

- Camera target math is isolated in `src/game/player/cameraRig.ts`.
- Follow damping is frame-rate independent.
- Camera vectors are reused rather than allocated every frame.
- Bike, raft and car use the wider vehicle camera framing.
- Portrait remains mechanically supported; landscape remains primary acceptance.

### Tiny Bike

- Progressive steering based on speed.
- Existing stricter terrain/slope limits preserved.
- Wheels still rotate from actual distance travelled.
- Visible speed-dependent bike lean added.
- Avatar receives bike steering feedback for riding pose.

### Tiny Raft

- Progressive speed-aware steering.
- Bounded low-frequency bob, roll and pitch.
- Lightweight reusable wake/ripple presentation.
- Existing water bounds, mount/dismount and recovery lifecycle preserved.
- Avatar no longer performs a walking animation while steering the raft.

### World composition

A non-colliding `QualityScenery` presentation layer now adds deterministic authored composition without changing gameplay routes or persistence:

- **Woodland:** threshold/arch framing, layered edge vegetation, grove framing and lighting punctuation.
- **Mountain Rise:** lower approach framing, upper-route rocks/posts and a summit cairn/lookout composition.
- **Harbour:** arrival scene, lantern/mooring posts, raft mooring framing and softened shoreline detail.
- **Home Lane:** front-garden clusters, warm lantern/bench/tree punctuation and home-boundary detail.

The goal is stronger visual sentences and landmarks, not uniform prop scattering.

### Mobile performance hardening

- Main directional shadow map reduced from 2048 to 1024.
- Smoke and fountain effects use fixed reusable pools rather than routine entity create/destroy churn.
- Smoke/fountain spawn cadence is time-based rather than frame-probability-based.
- Camera update avoids per-frame `pc.Vec3` allocation.
- No new backend, network loop, asset pack or physics dependency was introduced.

### Product-contract cleanup

- Home interaction now says **Welcome Home**, not Claim/Lock House.
- V0.1 still promises only persistence that actually exists; lamp state is the real home persistence example.
- TinyWorld terminology remains original; other games are not durable product/style contracts.

## Verification evidence

TDD checkpoints intentionally went RED before implementation for controls, movement/camera, vehicle feel, authored composition and particle pooling.

Final gameplay candidate:

`c3286c7d438d8ac0a79e5f8db9bbc22a8da59f75`

GitHub Actions run #117 passed the exact candidate:

- dependency install: PASS
- local D1 migration: PASS
- TypeScript typecheck: PASS
- source guards: PASS
- unit + Worker tests: PASS
- production build: PASS
- distribution budget: PASS
- Playwright Chromium install: PASS
- desktop browser tests: PASS
- Android-landscape browser tests: PASS

CI uses read-only permissions and uploads no Actions artifacts/packages.

## Current status

| Area | Status | Remaining evidence/action |
|---|---|---|
| Simple mobile control model | CODE PASS | Real Android feel test. |
| Avatar facing | CODE PASS | Confirm no sideways/backwards sliding on device. |
| Camera orbit / pitch | CODE PASS | Confirm right-drag feels natural on device. |
| Joystick deadzone / release | CODE PASS | Confirm no drift or floatiness on device. |
| World composition | CODE PASS | Human visual judgement required. |
| Woodland authored density | CODE PASS | Family/device visual judgement required. |
| Mountain route + summit | CODE PASS | Confirm route remains clear and payoff feels worthwhile. |
| Home Lane warmth | CODE PASS | Human visual judgement required. |
| Harbour / raft presentation | CODE PASS | Human visual/feel judgement required. |
| Tiny Bike feel | CODE PASS | Human riding feel test required. |
| Tiny Raft feel | CODE PASS | Human steering feel test required. |
| Ambient allocation/perf hardening | CODE PASS | Measure real Android FPS/thermal behaviour. |
| Cloudflare DEV deployment of candidate | **NOT DONE** | Deploy exact `c3286c7d...`; verify `/release.json` and visible stamp. |
| Android acceptance | **NOT RUN** | Run exact deployed candidate. |
| Family acceptance | **NOT RUN** | Three independently enjoyed activities + explicit PASS/FAIL. |

## DEV / deployment state

Cloudflare DEV is provisioned at:

`https://tinygame-dev.zerobytemode.workers.dev`

**Do not assume that URL contains `c3286c7d`.** This chat has no Cloudflare connector or authenticated Cloudflare deployment surface, and the repository currently has no default-branch deploy workflow. The latest quality candidate has therefore **not been claimed as deployed**.

Before human testing:

1. deploy exact gameplay candidate `c3286c7d438d8ac0a79e5f8db9bbc22a8da59f75` from an authenticated Cloudflare/Wrangler environment;
2. confirm `/release.json` reports the candidate SHA;
3. confirm the visible in-game build stamp matches;
4. only then record Android/family evidence.

## Owner-only actions still required

1. **Deploy the frozen candidate to Cloudflare DEV.**
2. **Android control check:** left-stick movement, avatar facing and right-drag camera in landscape; also sanity-check portrait because the original failure recording was portrait.
3. **10-minute Android route/performance check:** target sustained >=30 FPS with no serious hitching/thermal issue.
4. **Family playtest:** uninstructed session with at least three independently chosen/enjoyed activities and an explicit PASS/FAIL.

## Completion rule

Do not mark V0.1 or the 20x pass accepted until the exact deployed candidate records both:

- `ANDROID ACCEPTANCE: PASS`
- `FAMILY ACCEPTANCE: PASS`

A green CI run proves engineering checks. It does not prove that controls feel good, the world looks finished, or the game is fun.
