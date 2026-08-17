# TinyWorld Web

Mobile-first TinyWorld rebuilt as a browser-native 3D game and installable Android PWA.

## V0.1

The V0.1 target is a compact, authored world that is fun before missions exist: Village Square, Home Lane, Woodland, Mountain Rise and Harbour; touch-first movement; swimming; a real Tiny Bike; Tiny Raft; a small persistent home interaction; Google sign-in; Cloudflare D1 persistence.

## Architecture

- TypeScript + Vite + standalone PlayCanvas Engine
- Cloudflare Workers Static Assets + Worker + D1
- Google Identity Services for production sign-in
- one web/PWA codebase; no Android gameplay fork
- no R2 or Durable Objects in V0.1

## Local development

Node 24 is required. Copy the two committed templates, put the same public Google Web client ID in both, and replace the local pepper/salt values with long random strings:

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
npm install
npm run dev
```

`npm run dev` applies local D1 migrations and starts both services:

- Vite client: `http://127.0.0.1:5173`
- Wrangler Worker/D1: `http://127.0.0.1:8787`
- Vite proxies `/api/*` to Wrangler, so the browser uses one origin.

Verification:

```bash
npm run ci
npm run test:browser
```

`progress.md` is the durable handoff across implementation sessions. Read it before working and update it before finishing.

## Google OAuth setup for DEV

Create a **Web application** OAuth client in Google Cloud. Add these Authorized JavaScript origins:

```text
http://127.0.0.1:5173
https://<your-final-tinygame-dev-worker-hostname>
```

Google client IDs are public identifiers. Never put an OAuth client secret into the browser or repository.

## Cloudflare DEV setup

V0.1 targets DEV only. Create the Western Europe D1 database and capture Cloudflare's real UUID:

```bash
npx wrangler d1 create tinygame-dev --location weur
npx wrangler d1 info tinygame-dev --json > tinygame-dev-d1.json
node scripts/configure-d1-env.mjs dev tinygame-dev-d1.json
```

That generates `wrangler.dev.jsonc` with the real D1 binding. Review it and commit it to the implementation branch before accepting the candidate.

Configure the required Worker values against that config:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID --config wrangler.dev.jsonc
npx wrangler secret put ALLOWED_ORIGIN --config wrangler.dev.jsonc
npx wrangler secret put SESSION_PEPPER --config wrangler.dev.jsonc
npx wrangler secret put AUTH_RATE_LIMIT_SALT --config wrangler.dev.jsonc
```

Use the Google Web client ID for `GOOGLE_CLIENT_ID`, the exact final DEV HTTPS origin for `ALLOWED_ORIGIN`, and separate long random values for the pepper and salt.

Apply the remote migration and deploy the exact candidate:

```bash
npx wrangler d1 migrations apply tinygame-dev --remote --config wrangler.dev.jsonc
VITE_GOOGLE_CLIENT_ID="<same-public-google-client-id>" TINY_ENV=dev npm run build
npx wrangler deploy --config wrangler.dev.jsonc
```

Cloudflare's current Wrangler supports custom config files and remote D1 migrations; do not hand-edit a guessed database UUID.

## DEV and LIVE separation

DEV and LIVE must use different D1 databases, Google OAuth origins/client configuration and Worker secrets. LIVE is never generated or deployed automatically. A future LIVE promotion starts by creating `tinygame-live` and generating a separate `wrangler.live.jsonc`.

## Release acceptance

Automated checks do not prove gameplay quality. The exact candidate must record both:

```text
ANDROID ACCEPTANCE: PASS
FAMILY ACCEPTANCE: PASS
```

in `docs/quality/v0.1-android-acceptance.md` before issue #1 can close. A failed or unobserved human check remains release-blocking even when CI is green.
