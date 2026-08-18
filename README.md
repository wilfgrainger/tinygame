# TinyWorld

**Build your life. Explore impossible worlds. Discover the secrets of TinyWorld.**

TinyWorld is a mobile-first browser/PWA game built with TypeScript, Vite, PlayCanvas Engine and Cloudflare. The immediate goal is a small, authored V0.1 world that feels good to move through on a real Android phone before the project expands into deeper systems.

## Start here

Read these in order before changing the game:

1. [`VISION.md`](VISION.md) — product promise, pillars, scope and quality bar.
2. [`AGENTS.md`](AGENTS.md) — hard engineering/agent rules.
3. [`progress.md`](progress.md) — factual current handoff, frozen candidate and remaining work.
4. [`ARCHITECTURE.md`](ARCHITECTURE.md) — implemented technical architecture and invariants.
5. [`docs/superpowers/specs/2026-08-18-v0.1-quality-20x-design.md`](docs/superpowers/specs/2026-08-18-v0.1-quality-20x-design.md) — active quality-pass design.
6. [`docs/superpowers/plans/2026-08-18-v0.1-quality-20x.md`](docs/superpowers/plans/2026-08-18-v0.1-quality-20x.md) — executed quality plan and open human gates.
7. [`docs/quality/v0.1-android-acceptance.md`](docs/quality/v0.1-android-acceptance.md) — exact-build Android/family acceptance record.

`progress.md` is the cross-session source of truth for what is actually done. Do not infer current status from an older commit message or historical plan checkbox.

## Current V0.1 shape

The release-critical experience is deliberately compact:

- Google sign-in;
- Village Square, Home Lane, Woodland, Mountain Rise and Harbour;
- camera-relative mobile movement and independent right-drag camera;
- avatar facing driven by actual travel direction;
- jumping, swimming and safe recovery;
- direct-control Tiny Bike and Tiny Raft;
- enterable home with one genuinely persistent lamp interaction;
- discoveries and server-authoritative persistence;
- installable PWA;
- Android landscape as the primary acceptance target.

Existing NPCs, shops, props, roles, emotes and the mini-car are non-core roleplay texture. They are **feature-frozen** until V0.1 passes Android and family acceptance.

## Active 20x quality candidate

The code-owned quality pass is frozen at the gameplay SHA recorded in [`progress.md`](progress.md). It improves controls, movement response, camera damping, bike/raft physicality, outer-zone composition and mobile rendering discipline without adding a new feature family.

Do not call the candidate released merely because CI is green. The exact gameplay build must be deployed to Cloudflare DEV, identified by `/release.json` + visible build stamp, then pass real Android and family playtests.

## Local development

Requirements:

- Node version from `.nvmrc`;
- npm;
- Wrangler via project dependencies.

Install and verify:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Run the complete local game + Worker/D1 path:

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
npm run dev
```

The local launcher applies D1 migrations and starts the local Worker/API plus Vite client. Production authentication must never use a debug bypass.

## Verification

The normal engineering gate is:

```bash
npm run ci
npm run test:browser
```

CI intentionally uses no routine Actions artifact/package uploads. A passing automated gate proves code/build contracts, **not** visual quality or fun.

## Cloudflare DEV

The repository contains `wrangler.dev.jsonc` for the provisioned `tinygame-dev` environment. Deployment requires an authenticated Cloudflare/Wrangler environment.

Typical exact-candidate flow:

```bash
git checkout <candidate-sha>
npm ci
npm run ci
npm run deploy:dev
```

After deployment, verify the live `/release.json` and visible build stamp identify the exact candidate before recording acceptance evidence.

## Release rule

Do not mark V0.1 accepted until the exact deployed candidate records both:

- `ANDROID ACCEPTANCE: PASS`
- `FAMILY ACCEPTANCE: PASS`

Human FAIL overrides CI PASS.
