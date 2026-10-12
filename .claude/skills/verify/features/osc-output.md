# OSC output

hr-osc sends the two avatar parameters to `osc_client_host:osc_client_port`. When the host cannot be resolved or the send fails, Home replaces the `OSC host:port` line with `Can't send OSC to host:port`, and Settings › OSC shows `Can't send to this host` under Host, until a send to the current address succeeds.

## Sub-features

- `osc-target` sends to the configured host and port.
- `osc-failure` shows the failure on Home and Settings for an unresolvable host.
- `osc-recover` clears the failure after the host is fixed.

## How to get to it (user POV)

- Choose `Settings`, then the `OSC` tab, and edit `Host` or `Port`.
- Read the OSC line under the heart on Home.

## Driving it with cdp.mjs

Preconditions:

- Baseline instance; heart rate is flowing (`curl -s -X POST -d '72' http://127.0.0.1:18080` within the last 10 s).

- **Break the host.** Run `node $S/cdp.mjs click Settings`, `node $S/cdp.mjs click OSC` and `node $S/cdp.mjs fill osc_client_host no-such-host.invalid`, then POST bpm again and wait 2 s. `eval` of `document.querySelector('section').innerText` contains `Can't send to this host`.
- **Home.** Run `node $S/cdp.mjs click Home` and `eval` `main`. It prints `Can't send OSC to no-such-host.invalid:19000`, and the listener prints nothing new.
- **Recover.** Run `node $S/cdp.mjs click Settings`, `node $S/cdp.mjs click OSC`, `node $S/cdp.mjs fill osc_client_host 127.0.0.1`, POST bpm and wait 2 s. Home prints `OSC 127.0.0.1:19000` and the listener prints packets again.

## Gotchas

- The failure shows only after a send, so heart rate must be flowing.
- UDP has no delivery report: a port nobody listens on is not a failure.
