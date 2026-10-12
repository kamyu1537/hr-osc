# HTTP heart rate source

With the HTTP source selected, hr-osc listens on `http_server_port`, takes the bpm as a plain-text `POST /`, shows it on Home with the percent of `max_heart_rate`, and sends it to VRChat over OSC every second. With no data for `connected_timeout` seconds it shows Disconnected and sends `hr_connected` `false` once.

## Sub-features

- `http-receive` accepts `POST /` with an integer body from 0 to 300 and answers `ok`.
- `http-home` shows Connected, the bpm and the percent on Home.
- `http-osc` sends `hr_connected` `true` and `hr_percent` each second.
- `http-timeout` turns Disconnected and sends `hr_connected` `false` once after the timeout.
- `http-restart` restarts the receiver from the `Restart server` button.

## How to get to it (user POV)

- Choose `HTTP` in Settings › Source › Source.
- Send bpm from another program: `curl -X POST -d '60' http://localhost:<port>`.
- Choose `Restart server` on Home while Disconnected, or in Settings › Source.

## Driving it with cdp.mjs

Preconditions:

- Baseline instance; Home shows `Disconnected`.

- **Receive.** Run `curl -s -X POST -d '72' http://127.0.0.1:18080`. It prints `ok`.
- **Home.** Within 2 s run `node $S/cdp.mjs eval "document.querySelector('main').innerText"`. It prints `HTTP`, `Connected`, `72`, `36%`, `OSC 127.0.0.1:19000`.
- **OSC.** The listener prints `/avatar/parameters/hr_connected true` and `/avatar/parameters/hr_percent 0.36000001430511475` once per second.
- **Timeout.** Send nothing for 11 s, then `eval` `main` again. It prints `Restart server` and `Disconnected`, and the listener prints `/avatar/parameters/hr_connected false` once, about 10 s after the last POST.

## Gotchas

- The percent goes over OSC as a 32-bit float, so `0.36` prints as `0.36000001430511475`.
- Home polls the receiver once a second; check the screen at least 1 s after a POST.
- A body that is not an integer gets 400 `invalid heartrate`; an integer outside 0 to 300 gets 422 `heartrate out of range`. Neither changes the heart rate.
- When the port cannot be bound, Home shows `Can't open HTTP port <port>` in place of the OSC line.
