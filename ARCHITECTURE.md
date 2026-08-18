# Architecture Blueprint

TinyWorld Web is a lightweight, mobile-first 3D roleplay game built as a progressive web app (PWA) with serverless persistence.

```
┌────────────────────────────────────────────────────────┐
│                   BROWSER / CLIENT                     │
│  PlayCanvas 3D Engine • Web Audio Synth • Glassmorphism │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Character &  │  │ Brookhaven   │  │ Vehicles &   │  │
│  │ Hand Props   │  │ Town World   │  │ Interactions │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────▲────────────────────────────┘
                            │ HTTPS / API
                            ▼
┌────────────────────────────────────────────────────────┐
│               CLOUDFLARE WORKER BACKEND                │
│  Static Assets • Google OAuth Auth • Rate Limiting    │
│                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │   Auth & Session      │  │  Persistence Service  │  │
│  │   (SHA-256 Peppering) │  │  (Prepared Queries)   │  │
│  └───────────────────────┘  └───────────────────────┘  │
└───────────────────────────▲────────────────────────────┘
                            │ SQL
                            ▼
┌────────────────────────────────────────────────────────┐
│             CLOUDFLARE D1 SQL DATABASE                 │
│  Profiles • Persistent Discoveries • Home World State  │
└────────────────────────────────────────────────────────┘
```

---

## 1. Core Architectural Invariants

1. **Free Tier Boundary**: Built strictly for Cloudflare Free tier (<100,000 requests/day, <5M D1 reads/day, <100,000 D1 writes/day).
2. **Server-Authoritative Persistent State**: Player inventory/discoveries and home state save on user intent, never per-frame. Client predicts movement and physics locally.
3. **Zero-Byte Procedural Assets**: Sound effects (footsteps, bells, cash registers, coffee brew, horns) are procedurally synthesized in real-time via Web Audio API. 3D geometry and terrain textures are procedurally generated in PlayCanvas.
4. **Android-First & PWA Native**: Designed for mobile landscape touch control (virtual analog stick, action prompts) and responsive desktop keyboard/mouse controls.
5. **Storage-Frugal CI**: Zero GitHub Actions artifact storage quota usage with immutable, locked dependencies.

---

## 2. Client Architecture (`src/game/`)

The client runs a single PlayCanvas WebGL instance driven by TypeScript:

| Module | Responsibility | Key Files |
|---|---|---|
| **Lifecycle & App** | Canvas lifecycle, lighting, camera director, event coordination | [`src/game/app/GameApp.ts`](file:///src/game/app/GameApp.ts) |
| **Player & Kinematics** | Locomotion physics, collision resolution, character model, hand props | [`src/game/player/PlayerController.ts`](file:///src/game/player/PlayerController.ts), [`PlayerView.ts`](file:///src/game/player/PlayerView.ts), [`HandProps.ts`](file:///src/game/player/HandProps.ts) |
| **World & Atmosphere** | Vertex-blended terrain, town grid, enterable buildings, depth fog, particles | [`src/game/world/WorldBuilder.ts`](file:///src/game/world/WorldBuilder.ts), [`meshFactory.ts`](file:///src/game/world/meshFactory.ts), [`Atmosphere.ts`](file:///src/game/world/Atmosphere.ts) |
| **Vehicles** | Direct-control car, bicycle, and water raft physics | [`src/game/vehicles/CarController.ts`](file:///src/game/vehicles/CarController.ts), [`BikeController.ts`](file:///src/game/vehicles/BikeController.ts), [`RaftController.ts`](file:///src/game/vehicles/RaftController.ts) |
| **Audio Synthesizer** | Real-time Web Audio sound synthesis with zero download footprint | [`src/game/audio/SoundFx.ts`](file:///src/game/audio/SoundFx.ts) |
| **UI & Controls** | Glassmorphism HUD, virtual joystick, quick props drawer, action buttons | [`src/game/ui/Hud.ts`](file:///src/game/ui/Hud.ts), [`src/game/ui/styles.css`](file:///src/game/ui/styles.css) |

---

## 3. Serverless Backend (`src/worker/`)

The backend runs inside Cloudflare Workers using standard ES modules (no Node.js native dependencies):

| Component | Responsibility | Implementation |
|---|---|---|
| **Entrypoint & Router** | Serves static assets and maps REST endpoints (`/api/*`) | [`src/worker/index.ts`](file:///src/worker/index.ts), [`src/worker/router.ts`](file:///src/worker/router.ts) |
| **Authentication** | Google Identity token validation & hashed session cookie creation | [`src/worker/auth/google.ts`](file:///src/worker/auth/google.ts), [`src/worker/auth/session.ts`](file:///src/worker/auth/session.ts) |
| **Database Access** | Parameterized SQL queries against Cloudflare D1 relational database | [`src/worker/db/d1Store.ts`](file:///src/worker/db/d1Store.ts) |
| **Security & CORS** | Strict origin validation, rate limiting, and security headers | [`src/worker/security.ts`](file:///src/worker/security.ts), [`src/worker/response.ts`](file:///src/worker/response.ts) |

---

## 4. Data Storage & Schema

The Cloudflare D1 relational schema is managed with versioned SQL migrations in `migrations/`:

- `players`: Google subject ID mapping, display name, account creation timestamp.
- `profiles`: Last known spawn position, current activity state, last login timestamp.
- `discoveries`: Unlocked landmark discoveries (e.g. Mountain Summit, Woodland Grove).
- `home_state`: Persistent suburban estate state (e.g. lamp state, customization).
- `auth_rate_limits`: Hashed IP window tracker for anti-abuse protection.
