---
description: "Never hardcode. Write only the code the task needs, shaped like the code around it, with no extra logic"
---

Check the code against all four before writing it; breaking any one makes the change wrong.

1. **Never hardcode.** No literal OSC paths, ports, hosts, timeouts, source names, colours or user-visible strings in logic. Derive each value from its source: the store's config, `defaultConfig`, the `services` table, `useStrings()`, the theme tokens in `src/style.css`. If no source exists, define one named constant where the existing code keeps its constants (module top, like `RETRY_BASE_MS`), and use it everywhere.
2. **Write only the code the task needs.** No abstraction with one implementation, no option, flag or extension point nobody asked for, no helper for a single call site, no guard for a case that cannot happen, nothing "for later".
3. **Write it like the existing code.** Use the helpers, types, naming, file layout and patterns already in the repo: the zustand store in `src/lib/states.ts`, `ConfigField` with a `Parse` function for settings inputs, the `Failure` keys for Home messages, `Result<_, String>` from Tauri commands. Code that solves the same problem a second way is wrong even if it works.
4. **Add no logic the task does not require.** No extra checks, fallbacks, logging, caching, retries or convenience behaviour. Every branch must be explained by the request.

Before you report the work done, reread your diff: point to any literal that has a source, any line the request does not explain, and any place that differs from how the surrounding code does it, then fix it.
