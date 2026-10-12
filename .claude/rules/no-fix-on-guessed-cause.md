---
description: "Never change code or dispatch a fix on a guessed root cause; reproduce and measure first"
---

Do not edit code, dispatch a fix, or tell the user "the cause is X" from reading code or guessing.

Before any fix for a reported defect:
1. **Reproduce it in the running app** with the reported source and settings, using `.claude/skills/verify`: an isolated `pnpm tauri dev` instance, bpm posted to the HTTP receiver, and a UDP listener on the OSC port.
2. **Measure**: record the exact values before and after: the OSC packets received (address and value), the Home and Settings state, `config.json` on disk, the app log, or a failing `cargo test`.
3. Only then name the cause, and fix it at the source.

If you can't reproduce it, say that plainly and state what you measured. Don't write "most likely cause" and then ship a change.
