# TinyWorld Web Agent Contract

1. Read `progress.md`, the controlling issue and approved spec/plan before meaningful work.
2. Work on a branch/PR; do not implement directly on `main`.
3. Keep `progress.md` current as the cross-session handoff.
4. V0.1 is Android-first, mobile landscape, Cloudflare Free only and Google-auth only.
5. Do not add R2, Durable Objects, multiplayer, chat, trading, co-op, broad missions, paid mechanics, portals, pets, combat, Apple auth or a separate Android game implementation.
6. Persistent state is server-authoritative. The browser sends intent, not rewards/value. Never persist movement per frame.
7. No production debug auth bypass, hot-linked third-party production assets, private keys or invented cloud IDs.
8. Use TDD for deterministic rules and source contracts. Human device/visual evidence stays human-gated.
9. Keep GitHub Actions storage-frugal: standard public-repo runner compute is allowed, but do not upload Actions artifacts/packages for routine CI.
10. Missing real-device/family evidence is `NOT RUN`, never PASS.
