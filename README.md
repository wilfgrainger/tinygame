# TinyWorld Web

TinyWorld is a mobile-first browser-native 3D game and installable Android PWA.

> **Build your life. Explore impossible worlds. Discover the secrets of TinyWorld.**

For V0.1, the target is deliberately smaller: open the game on a phone and immediately enjoy being in a compact, authored world with satisfying movement, exploration, swimming, a real Tiny Bike, Tiny Raft and a small persistent home interaction.

## Start here

- [VISION.md](VISION.md) — product promise, design DNA, V0.1 quality bar and long-term direction.
- [progress.md](progress.md) — current branch/candidate state, blockers and exact next actions.
- [ARCHITECTURE.md](ARCHITECTURE.md) — implemented technical architecture and engineering invariants.
- [AGENTS.md](AGENTS.md) — hard rules for Codex/agent sessions.
- [V0.1 acceptance](docs/quality/v0.1-android-acceptance.md) — exact-build Android and family release evidence.

## V0.1 core

Release-critical:

- Android-first landscape touch controls;
- compact authored Village Square, Home Lane, Woodland, Mountain Rise and Harbour;
- meaningful terrain and routes;
- third-person movement, jump and camera control;
- swimming and safe shore recovery;
- direct-control Tiny Bike;
- direct-control Tiny Raft;
- player home with one small server-persisted interaction;
- Google sign-in;
- Cloudflare D1 persistence;
- installable PWA;
- visible build/release identity;
- real Android + family acceptance.

The branch also contains extra roleplay texture including NPCs, shops, props, emotes, roles, music and a mini-car. These are **non-core V0.1 extras**. The repo is feature-frozen until core acceptance passes.

## Stack

- TypeScript + Vite
- standalone PlayCanvas Engine
- Cloudflare Workers Static Assets + Worker + D1
- Google Identity Services
- Vitest + Playwright
- one web/PWA client; no Android gameplay fork
- no R2 or Durable Objects in V0.1

## Local development

Node 24 is required.

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
npm ci
npm run dev
```

Put the same public Google Web client ID in `.env.local` and `.dev.vars`. Replace local pepper/salt placeholders with separate long random values.

`npm run dev` applies local D1 migrations and starts:

- client: `http://127.0.0.1:5173`
- Worker/D1: `http://127.0.0.1:8787`
- `/api/*` proxied from Vite to Wrangler for one-origin local play.

Verification:

```bash
npm run ci
npm run test:browser
```

## DEV deployment

The current development environment uses a separate `tinygame-dev` D1 database and Worker configuration. Never guess or hand-edit a D1 UUID.

Create/configure a new DEV database only when required:

```bash
npx wrangler d1 create tinygame-dev --location weur
npx wrangler d1 info tinygame-dev --json > tinygame-dev-d1.json
node scripts/configure-d1-env.mjs dev tinygame-dev-d1.json
```

Required Worker secrets/values:

```text
GOOGLE_CLIENT_ID
ALLOWED_ORIGIN
SESSION_PEPPER
AUTH_RATE_LIMIT_SALT
```

Apply migrations and deploy the exact candidate:

```bash
npx wrangler d1 migrations apply tinygame-dev --remote --config wrangler.dev.jsonc
VITE_GOOGLE_CLIENT_ID="<public-google-client-id>" TINY_ENV=dev npm run build
npx wrangler deploy --config wrangler.dev.jsonc
```

## Google OAuth

Use a Google **Web application** OAuth client. Authorized JavaScript origins must include the local Vite origin and the final DEV HTTPS origin being tested.

The Google client ID is public. Do not put an OAuth client secret in the browser or repository.

## Environment separation

DEV and LIVE must use distinct:

- D1 databases;
- Worker configuration/secrets;
- allowed origins;
- release evidence.

LIVE promotion is a separate future step. Never turn DEV configuration into LIVE by renaming it.

## Release rule

Green CI is necessary but insufficient.

The exact deployed candidate must record both:

```text
ANDROID ACCEPTANCE: PASS
FAMILY ACCEPTANCE: PASS
```

in `docs/quality/v0.1-android-acceptance.md` before V0.1 is accepted.
