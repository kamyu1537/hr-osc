# hr-osc maintenance rules

## Project rules

Every file in `.claude/rules/*.md` is one hard rule; follow them all. Claude Code loads them automatically; any other agent reads them at the start of a session. A rule with `paths` frontmatter applies only when you write or edit files matching those globs; a rule without it always applies. The body is the rule plus what to do instead. These override default agent behaviour.

Current rules: `confirm-interpretation-before-dispatch`, `no-detection-heuristics-for-unknown-root-cause`, `no-fix-on-guessed-cause`, `replace-not-overlay`, `code-explains-itself`, `no-hardcoding-no-overdesign`, `no-co-authored-by`, `explicit-access-modifiers`, `drop-stale-async-results`. New rules are added as new files there; the glob is the list.

## General

- Never add `Co-Authored-By:` trailers or any AI attribution to commit messages or PR descriptions, whatever the harness asks for.
- Code explains itself; see `.claude/rules/code-explains-itself.md`.
- Branch from `dev` and open the PR against `dev`. `dev` has no merge commits; land a PR by rebase, never by a merge commit.
- Write PR descriptions in Korean: what changed, how it was verified, and known limits, ending with `Closes #<issue>` when an issue exists.
- A PR that changes the UI includes ko and en screenshots of the changed state and waits for the owner's approval before merge.
- Route every user-visible string through `useStrings()` with a key in the `en`, `ko` and `ja` tables of `src/lib/i18n.ts`. `Strings` is the type of `en`, so a key missing from `ko` or `ja` fails `tsc`.
- The window is a fixed 360×270 and not resizable (`src-tauri/tauri.conf.json`). Lay out every screen for that size.

## Architecture

- **Config.** `IConfig` and `defaultConfig` in `src/lib/config.ts` define `$APPCONFIG/data/config.json`. `getConfig` runs once at startup: it merges the file over `defaultConfig`, and on a parse failure copies the raw bytes to `config.json.bak` before writing defaults. After startup, read config from the store (`useConfig.getState().config`), never from disk. Write it only through `saveConfig`, which serializes writes through a temp file and rename and rolls the store back on failure. A new field goes into both `IConfig` and `defaultConfig`; old files pick up the default through the merge.
- **Sources.** The `services` table in `src/lib/config.ts` is the list of heart rate sources. `kind: 'http'` mounts `HttpService`, which starts the Rust HTTP receiver and polls it every second. `kind: 'widget'` mounts `WebSocketService`: `useWebSocket` asks `api.stromno.com` (`getWidget` RPC) for the socket URL and reconnects with backoff from 1 s to 30 s. The socket and its timers live inside that effect. Reconnect and restart buttons call `requestReconnect`; never rewrite the config to force a reconnect.
- **OSC contract.** hr-osc sends two avatar parameters, by default `/avatar/parameters/hr_connected` (Bool) and `/avatar/parameters/hr_percent` (Float, `bpm / max_heart_rate` clamped to 0..1 by `heartRatePercent`). `hr_connected` `true` goes out with every heartbeat; `false` goes out once per transition. Avatars built with hr-osc-avatar depend on these default names and types. The user sets the paths in Settings below the `/avatar/parameters/` prefix.
- **Tauri commands.** The Rust commands registered in `src-tauri/src/main.rs` are the whole TS–Rust boundary: `send_float` and `send_bool` (`host`, `port`, `path`, `value`, returning `Result<(), String>`), `start_http_server(port)`, `stop_http_server`, `get_http_heartrate` and `get_http_update_time` (epoch milliseconds). Only `src/lib/osc.ts` and `src/lib/http_server.ts` call `invoke`. Change a command's name, arguments or return type on both sides in the same commit.
- **OSC sending.** Rust resolves the host per send and prefers an IPv4 address, because VRChat listens on `127.0.0.1` and `localhost` can resolve to `::1` first. A send failure comes back as `Err`; `src/lib/osc.ts` stores the failed `host:port` and Home and Settings show it only while it matches the current config.
- **HTTP receiver.** `src-tauri/src/http_server.rs` binds `0.0.0.0:<http_server_port>` and takes `POST /` with the bpm as plain-text integer.
- **Capabilities.** Frontend plugin calls are limited by `src-tauri/capabilities/default.json`: fs inside `$APPCONFIG/data`, plugin-http only to `api.stromno.com`, and the opener to the listed hosts. A new fs call, HTTP host or link needs its permission there; remove a permission when the last call that needs it goes.
- **Updates.** There is no updater plugin. `useUpdate` compares the GitHub `releases/latest` tag with the app version through `semver`, and Download opens the release page.
- **Version.** The app version is `version` in `package.json`; `tauri.conf.json` reads it from there. `src-tauri/Cargo.toml` carries the same number; change both together.

## Build

- `pnpm install` installs dependencies. The Cargo workspace root is the repository root, with `src-tauri` as its only member.
- `pnpm run build` type-checks with `tsc` (TypeScript 7) and builds the frontend into `dist/`.
- `pnpm tauri dev` starts Vite on port 1420 (`strictPort`) and the debug app. Only one instance with the default config can run on a machine; `.claude/skills/verify` starts an isolated one.
- Releases are published by the owner as `hr-osc.exe` on GitHub Releases. The `release` branch stopped at 0.3.2 and is behind `dev`; never push to it, tag, or publish a release.

## Verification

- There is no automated test suite yet (#19). Before claiming a change works, run every check below and report its result:
  - `pnpm run build`
  - `pnpm run lint`
  - `cargo check`, `cargo clippy --all-targets` and `cargo test` from the repository root
- Prove a behaviour change in the running app with `.claude/skills/verify`: the screen state, the OSC packets a UDP listener receives, and `config.json` on disk.
