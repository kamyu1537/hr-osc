---
name: verify
description: Launch an isolated hr-osc desktop app (Tauri 2, WebView2 on Windows), drive its UI over CDP, feed it heart rate over HTTP, and capture the OSC packets it sends. Use to reproduce a bug or prove a change in the running app before claiming it works.
---

# Verify hr-osc in the running app

All commands run in Git Bash from the repository root unless marked PowerShell. `S=.claude/skills/verify/scripts`.

## Isolation

A verification instance never shares state with the owner's own hr-osc or another agent's dev instance:

| Resource | Default | Verification instance |
| --- | --- | --- |
| App identifier and config dir | `me.kamyu.hr-osc` (`%APPDATA%\me.kamyu.hr-osc\data`) | `me.kamyu.hr-osc.verify` |
| Vite dev server | 1420 | 1421 |
| HTTP receiver (`http_server_port`) | 8080 | 18080 |
| OSC target (`osc_client_port`) | 9000 | 19000 |
| WebView2 CDP port | none | 9334 |

Run one verification at a time: the config dir above is shared by every verification instance. Before launching, confirm these ports are free. If one is taken, another verification run is active; wait for it to finish. Do not pick other ports.

```bash
netstat -ano | grep -E ':(1421|18080|19000|9334) ' | grep -E 'LISTENING|^ *UDP'
```

## Launch

1. Seed the verification config. English UI keeps the `click` labels below valid.

   ```bash
   mkdir -p "$APPDATA/me.kamyu.hr-osc.verify/data"
   cat > "$APPDATA/me.kamyu.hr-osc.verify/data/config.json" <<'EOF'
   {
     "service_type": "http",
     "http_server_port": 18080,
     "osc_client_host": "127.0.0.1",
     "osc_client_port": 19000,
     "max_heart_rate": 200,
     "language": "en"
   }
   EOF
   ```

2. Start the OSC listener as a background command. It prints one line per packet: time, address, value.

   ```bash
   node $S/osc-listen.mjs 19000
   ```

3. Start the app as a background command. The first build compiles the Rust crate and takes a few minutes.

   ```bash
   WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9334 pnpm tauri dev --config '{"identifier":"me.kamyu.hr-osc.verify","build":{"devUrl":"http://localhost:1421","beforeDevCommand":"pnpm run dev --port 1421"}}'
   ```

4. Wait until the receiver and the webview answer:

   ```bash
   until curl -s -m 1 http://127.0.0.1:18080/ | grep -q 'hr-osc http server' && curl -s -m 1 http://127.0.0.1:9334/json/version >/dev/null; do sleep 1; done
   ```

5. Record the processes listening on 18080, 1421 and 19000, with their start times, for Cleanup. The ports were free before launch, so their listeners are yours. `$OUT` is the evidence directory:

   ```bash
   pwsh -NoProfile -File $S/processes.ps1 record "$OUT/pids.txt"
   ```

## Doctor

Run this first, and again whenever something looks off. All three must hold.

```bash
curl -s http://127.0.0.1:9334/json | grep -E '"(title|url)"'   # title "hr-osc", url http://localhost:1421/
curl -s http://127.0.0.1:18080/                               # hr-osc http server
grep -E 'http_server_port|osc_client_port' "$APPDATA/me.kamyu.hr-osc.verify/data/config.json"
```

An instance whose page URL is `localhost:1420`, or whose receiver is on 8080, is not yours; do not drive it.

## Drive

`cdp.mjs` talks to the page over CDP:

```bash
node $S/cdp.mjs eval "document.querySelector('main').innerText"   # any expression; prints the value
node $S/cdp.mjs click Settings                                     # button or link whose text is exactly this
node $S/cdp.mjs fill max_heart_rate 100                            # input or select by id; fires input/change
node $S/cdp.mjs screenshot "$OUT/home.png"
```

Settings inputs use the config key as their `id` (`http_server_port`, `connected_timeout`, `osc_client_host`, `osc_client_port`, `osc_path_connected`, `osc_path_percent`, `max_heart_rate`); the selects are `service_type` and `language`. Text fields save 500 ms after the last change.

Feed heart rate to the HTTP source the way a user's sender does:

```bash
curl -s -X POST -d '72' http://127.0.0.1:18080   # ok
```

The per-feature recipes are in `features/README.md`.

## Evidence

Write proof to a directory outside the checkout, such as the session scratchpad (`OUT`). A proof has three parts:

- the user action (the `cdp.mjs` and `curl` commands you ran);
- the screen after it (`eval` of `main`'s text, plus a screenshot for a UI change);
- the side effects: OSC lines from the listener, and `config.json` from the verification config dir.

Drive the real path: UI controls through `cdp.mjs`, heart rate through `POST /`. Never call `invoke` or set the zustand store from `eval` to fake a state.

## Cleanup

Stop only the processes recorded in `$OUT\pids.txt`, with their children. Windows reuses the PID of an exited process, so `processes.ps1 stop` opens each process, checks its start time against the record, suspends it and every descendant it finds so none can spawn more, and terminates them through those handles; children count only when the handle shows them started by that process after it. Never use `taskkill` or match by executable path: the owner's `pnpm tauri dev` from the same checkout runs from the same `target\` directory. PowerShell:

```powershell
pwsh -NoProfile -File .claude/skills/verify/scripts/processes.ps1 stop "$OUT\pids.txt"
Get-NetTCPConnection -State Listen -LocalPort 1421,18080,9334 -ErrorAction SilentlyContinue
Get-NetUDPEndpoint -LocalPort 19000 -ErrorAction SilentlyContinue
```

The last two commands print nothing when every port is free. Keep `OUT`. Delete `%APPDATA%\me.kamyu.hr-osc.verify` only when the next run needs a fresh config.

## Gotchas

- Never kill `hr-osc.exe` or `hr-osc-tauri.exe` by name. The owner's app and other agents' instances use the same names.
- Vite watches the whole checkout, so `file watcher error: EBUSY ... target\debug\...` lines during the Rust build are noise.
- `hr_connected` `false` is sent once at startup and then only on a transition; `true` repeats with every heartbeat. Start the listener before the app to see the startup packet.
- The widget sources (Stromno, Pulsoid legacy) need a real widget ID and `api.stromno.com`. No mock recipe exists yet; say so instead of claiming the widget path is verified.
