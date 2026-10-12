---
description: "An async result applies only while the state it was started for is still current; check before writing it"
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

Config saves, OSC sends, the Stromno URL request and socket events can finish after the user changed a setting, switched the source or left the screen. Writing their result unconditionally puts a stale value on screen or in the store.

Before an async callback writes state, check that what it was started for is still current:

- Compare against the store at completion time, not a value captured at start: `src/lib/osc.ts` sets `oscFailure` only while `getAddr(state.config)` still equals the failed address.
- Roll back only what you wrote: `saveConfig` restores the persisted config only while the store still holds the config it tried to save.
- Inside an effect, keep a `cancelled` flag and check it after every `await`: `useWebSocket` creates no socket once its effect has been cleaned up.

Each of these shipped as a bug first (#29, #32, `fix: ignore late osc failures for an old host`). Prove a new guard by changing the setting while the async call is in flight.
