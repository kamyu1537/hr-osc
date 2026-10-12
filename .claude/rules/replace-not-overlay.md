---
description: "Change code by replacing the old implementation outright, never by layering new code over it"
---

Don't layer the change on top of the existing code.

Replace the old implementation outright:
- Move or rewrite the code into its proper place, and delete what it replaces: functions, components, store fields, i18n keys in all of `en`, `ko` and `ja`, Tauri commands on both the Rust and the TS side, capability permissions nothing uses any more.
- Update every caller in the same change. No old path kept beside the new one, no flag that switches between them, no adapter that calls another adapter and patches its result.
- The diff should read as if the new design had always been there.

Overlays hide the real behaviour behind two code paths, and every later fix has to reason about both.
