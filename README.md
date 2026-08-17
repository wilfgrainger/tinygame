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

## Development

Node 24 is required.

```bash
npm install
npm run dev
npm run ci
npm run test:browser
```

`progress.md` is the durable handoff across implementation sessions. Read it before working and update it before finishing.

## Environments

DEV and LIVE must use different D1 databases, Google OAuth origins/client configuration and secrets. V0.1 work targets DEV only. LIVE promotion is always explicit and human-approved.

## Release acceptance

Automated checks do not prove gameplay quality. The exact candidate must record both `ANDROID ACCEPTANCE: PASS` and `FAMILY ACCEPTANCE: PASS` before issue #1 can close.
