# TinyWorld Vision

## Product promise

> **Build your life. Explore impossible worlds. Discover the secrets of TinyWorld.**

TinyWorld is a warm, tactile, mobile-first 3D world about **living somewhere you care about, moving through it, discovering things, and gradually making it yours**.

The long-term game may grow into social play, quests, professions, vehicles, unusual worlds and deeper progression. None of those systems matter if the ordinary village is not enjoyable by itself.

## V0.1 promise

> **Open TinyWorld on a phone and immediately enjoy being there.**

V0.1 succeeds when a player can understand the place without instructions, move naturally, explore contrasting spaces, interact with recognisable things, swim, ride the Tiny Bike, use the Tiny Raft, visit their home, and want to keep playing after the novelty of first load has passed.

## Product pillars

### 1. Place before systems

TinyWorld is a world first and a feature list second. Terrain, routes, skyline, buildings, trees, water, sound and motion must create a place with character. A menu cannot rescue an empty or confusing world.

### 2. Physical play

The best TinyWorld interactions happen in the 3D space. Walk to the cafe. Climb the mountain. Board the raft. Ring the bell. Sit down. Ride the bike. UI should support physical play rather than replace it.

### 3. Small, dense and authored

A compact world with memorable corners is better than a large sparse map. Every major route should change what the player sees or feels. Avoid stretched-out empty travel, evenly scattered props and flat fields.

### 4. Recognisable, original visual language

TinyWorld should be readable at a glance, warm, playful and deliberately simplified. Use strong silhouettes, restrained palettes, clustered vegetation, vertical terrain and clear object identity.

Other games may be references for quality or readability, never templates to copy. Do not reproduce identifiable maps, buildings, characters, UI, logos, assets, names or distinctive expression from another game.

### 5. Mobile is the real platform

Android landscape is the primary V0.1 acceptance target. Desktop support is useful, but touch ergonomics, camera behaviour, frame rate, load time and small-screen readability win design conflicts.

### 6. Movement quality is a feature

Walking, camera control, jumping, swimming and vehicles must feel predictable and pleasant. Terrain must constrain movement meaningfully: roads and paths follow the land, cliffs are not casually climbable, and vehicles do not behave like player-shaped teleporters.

### 7. Living world, not scenery warehouse

Things that imply life should move or react. NPCs should read as people rather than statues. Water should behave as water. Vehicles should be driven. Ambient effects must add life without damaging mobile performance.

### 8. Persistent state must be trustworthy

When TinyWorld says something is saved, it is saved by the server. The browser never awards itself valuable state. Persistence is discrete and low-frequency, never per-frame.

### 9. Family-safe by construction

V0.1 has no open chat, trading or multiplayer. Future social systems require their own privacy, moderation and child-safety design before implementation.

### 10. Quality beats feature count

A feature that exists but feels fake is worse than no feature. Remove, simplify or defer systems that do not meet their promise. A green CI run proves engineering checks, not fun or visual quality.

## V0.1 core experience

The release-critical experience is:

1. sign in and enter quickly;
2. arrive in a readable Village Square;
3. choose a route toward Home Lane, Woodland, Mountain Rise or Harbour;
4. enjoy touch movement and camera control without fighting the UI;
5. discover places through movement rather than mission arrows;
6. swim and recover safely at the shore;
7. ride a convincing direct-control Tiny Bike;
8. board and steer the Tiny Raft;
9. enter the player's home and prove one small persistent interaction;
10. leave with a reason to return.

## V0.1 non-core texture

The current branch also contains NPCs, a cafe, supermarket, town hall, mini-car, props, emotes, role costumes, music and other roleplay touches. They may remain where they improve the world and meet performance/quality expectations.

They are **not V0.1 release dependencies** and must not delay or degrade the core experience. No further feature expansion is allowed before V0.1 acceptance unless it fixes a release-critical quality problem.

## Explicit V0.1 exclusions

Do not add before V0.1 acceptance:

- multiplayer, friends or open chat;
- trading or co-op systems;
- broad missions or quest framework;
- economy, paid mechanics or monetisation;
- portals or additional worlds;
- pets or combat;
- Apple sign-in;
- iOS packaging;
- R2 or Durable Objects;
- a separate Android gameplay implementation;
- large new roleplay systems, jobs, shops, props or vehicles.

## Release quality bar

V0.1 is accepted only when all of the following are true:

- automated tests/build checks pass on the exact candidate;
- real Android route passes;
- sustained gameplay meets the agreed >=30 FPS target on the acceptance device;
- cold load/useful-control targets are measured and acceptable;
- touch movement, camera, jump and interaction feel reliable;
- Village Square, Woodland, Mountain and Harbour feel authored rather than assembled;
- Tiny Bike and Tiny Raft feel like real controlled vehicles;
- persistence survives reload where promised;
- family playtest records at least three independently enjoyed activities;
- family verdict is that the game feels like a finished little world, not a building site.

A human FAIL overrides CI PASS.

## Long-term direction

After V0.1 proves the ordinary world is fun, TinyWorld can grow outward in deliberate layers:

1. deeper home customisation and progression;
2. richer professions and town life;
3. additional vehicles and exploration rewards;
4. carefully designed social/multiplayer play;
5. quests and cooperative discoveries;
6. portals and impossible worlds;
7. longer-term economy, events and prestige only when the underlying game earns them.

The rule never changes: **make the world worth caring about before adding another system.**
