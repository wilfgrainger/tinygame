# TinyWorld Web V0.1 Progress

**Repository:** `wilfgrainger/tinygame`  
**Main foundation merge:** `80951318b35f4130bf03eb653d137085ffa44542`  
**Active quality branch:** `feat/v0.1-quality-20x`  
**Active PR:** #4 — `feat: V0.1 20x quality pass`  
**Quality design:** `docs/superpowers/specs/2026-08-18-v0.1-quality-20x-design.md`  
**Last verified gameplay SHA:** `e8ce2e34225679b3385e276ddb7920e2785e5454`  
**Last updated:** 2026-08-18 Europe/London

## Session handoff

TinyWorld is a mobile-first browser/PWA game. `VISION.md` defines the product. `AGENTS.md` defines agent rules. This file records facts and remaining work only.

The original V0.1 implementation foundation was merged to `main` as `80951318`. A separate quality-only branch and draft PR #4 now implement the **20x quality pass**. This pass is feature-frozen: improve feel, composition, camera, movement, vehicle physicality, atmosphere and mobile performance; do not expand into new feature families.

### Latest owner evidence

On 2026-08-18 the owner supplied a real Android browser screen recording showing a clear control problem:

- the avatar body did not face actual travel direction;
- movement therefore read as sideways/backwards sliding;
- camera heading and avatar heading felt coupled;
- camera orbit/view control did not feel natural;
- the recording was portrait, while landscape remains the primary V0.1 acceptance orientation.

This evidence moved **controls/camera to Priority 0** ahead of visual-world polish.

### Priority 0 control fix now implemented

Verified gameplay candidate: `e8ce2e34225679b3385e276ddb7920e2785e5454`.

Changes:

1. Added `src/game/player/controlModel.ts` as the small pure control-math boundary.
2. Left-stick movement is explicitly camera-relative.
3. Right-side drag changes camera/movement heading and pitch, not the avatar's visual body facing.
4. Avatar visual facing is derived from actual world displacement and turns toward travel direction.
5. Standing still preserves avatar facing while the camera can orbit independently.
6. Camera pitch range is deliberately narrower to avoid extreme ground/sky views.
7. Vehicles retain their own direct heading/facing behaviour.

TDD evidence:

- RED commit: `04c31a2d1e9348b739af986848da83c9d48c17fb` defined the new control contract before implementation.
- GREEN candidate: `e8ce2e34225679b3385e276ddb7920e2785e5454`.
- GitHub Actions CI run #93: **PASS** on that exact SHA.
- The full source/type/test/build/browser gate passed.

The control rewrite is **code-verified but not yet human-feel accepted**. It must be deployed and played on the real phone before it can be called fixed.

## Canonical current product rules

- Product identity is **TinyWorld**, not another game's clone or named style.
- Android landscape is the primary V0.1 acceptance target; portrait should remain mechanically correct.
- Place before systems; dense/authored beats large/sparse.
- Left stick moves relative to camera.
- Moving avatar faces actual travel direction; no default strafe/backpedal presentation.
- Right drag orbits/tilts camera independently of avatar facing.
- Jump + one contextual Action button remain the simple core controls.
- Roads/paths follow terrain.
- Walking, bike and car have meaningful step/slope traversal limits.
- Home only promises persistence that actually exists. The lamp state is persistent; fake house ownership/lock semantics are not V0.1 product promises.
- Cloudflare Free-plan architecture only.
- Persistent state is server-authoritative.
- Real Android and family acceptance override green CI.

## Implemented foundation already on `main`

- TypeScript + Vite + standalone PlayCanvas Engine.
- Cloudflare Worker + D1 persistence architecture.
- Google sign-in/session foundation.
- PWA shell and release metadata/build stamp.
- Village Square, Home Lane, Woodland, Mountain Rise and Harbour.
- Terrain-following roads and non-flat heightfield.
- Walking step/slope constraints plus stricter bike/car traversal limits.
- Swimming and safe recovery.
- Direct-control Tiny Bike and Tiny Raft.
- Enterable home with a genuinely persisted lamp interaction.
- Existing town/NPC/roleplay texture may remain where useful but is non-core V0.1 texture.
- Touch phantom-input protections on pointer release/cancel, focus loss and visibility loss.
- Locked npm dependencies and storage-frugal public-repository CI.

## 20x quality pass status

| Area | Status | Next evidence/action |
|---|---|---|
| Controls / avatar facing | CODE GREEN | Deploy `e8ce2e34` or later exact candidate and replay on Android. |
| Camera orbit / pitch | CODE GREEN, HUMAN TEST REQUIRED | Verify right-drag orbit feels natural and no extreme view traps occur. |
| World composition | PENDING | Improve authored density and silhouettes after controls are accepted. |
| Woodland | PENDING | Denser layered edges, clear paths/openings, no uniform tree scattering. |
| Mountain | FOUNDATION READY | Preserve intended traversable route; improve summit payoff/composition. |
| Home Lane / home warmth | PENDING | Improve domestic composition without adding new persistence domains. |
| Harbour / raft presentation | PENDING | Improve waterfront composition and lightweight raft feedback. |
| Tiny Bike feel | FOUNDATION READY | Progressive feedback/lean/feel pass after core controls. |
| NPC/living-world polish | PENDING | Improve presentation cheaply; no feature expansion. |
| Mobile performance | MEASURE ON DEVICE | Target sustained >=30 FPS on acceptance Android. |
| Android acceptance | NOT RUN ON QUALITY CANDIDATE | Must use exact deployed candidate SHA. |
| Family acceptance | NOT RUN ON QUALITY CANDIDATE | Three independently enjoyed activities + explicit PASS/FAIL. |

## DEV / deployment state

A Cloudflare DEV environment has previously been provisioned. **Do not assume it contains the latest quality branch.** Before human testing, deploy the exact intended candidate and confirm `/release.json` / visible build stamp match the SHA under test.

Do not let an older DEV deployment certify a newer branch.

## Owner-only actions still expected

1. After the quality candidate is deployed, test left-stick movement and right-drag camera on the real Android phone.
2. Prefer landscape for the formal acceptance route; also sanity-check portrait because the supplied failure recording was portrait.
3. Record whether the avatar always turns into its travel direction and whether camera orbit remains independent while standing still.
4. Later, run the full Android acceptance route on the final exact candidate.
5. Run the uninstructed family playtest and record three independently enjoyed activities plus explicit PASS/FAIL.

## Completion rule

Do not mark V0.1 or the 20x pass accepted until the exact deployed candidate records both:

- `ANDROID ACCEPTANCE: PASS`
- `FAMILY ACCEPTANCE: PASS`

A green CI run proves engineering checks. It does not prove that controls feel good, the world looks finished, or the game is fun.
