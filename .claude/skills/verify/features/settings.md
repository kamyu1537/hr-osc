# Settings

Settings edits the config in four tabs. A valid value saves to `config.json` 500 ms after the last keystroke and shows `Saved`; an invalid value shows an error under the field and is not saved. Running sources pick up the new value without reconnecting.

## Sub-features

- `settings-save` saves a valid value and shows `Saved`.
- `settings-invalid` shows the field error and leaves `config.json` unchanged.
- `settings-live` applies the saved value to the next heartbeat.

## How to get to it (user POV)

- Choose `Settings` in the nav bar, then the `Source`, `OSC`, `Params` or `General` tab.

## Driving it with cdp.mjs

Preconditions:

- Baseline instance with `max_heart_rate` 200.

- **Open the tab.** Run `node $S/cdp.mjs click Settings` and `node $S/cdp.mjs click Params`. It prints `clicked Params`.
- **Save.** Run `node $S/cdp.mjs fill max_heart_rate 100`, wait 1 s, then `grep max_heart_rate "$APPDATA/me.kamyu.hr-osc.verify/data/config.json"`. It prints `"max_heart_rate": 100,`, and `eval` of `document.querySelector('section').innerText` contains `Saved`.
- **Live.** Run `curl -s -X POST -d '72' http://127.0.0.1:18080`. The listener prints `/avatar/parameters/hr_percent 0.7200000286102295`, and Home shows `72%`.
- **Invalid.** Run `node $S/cdp.mjs fill max_heart_rate 0`. The section shows `Enter a number greater than 0` and `config.json` still holds `100`.
- **Restore.** Run `node $S/cdp.mjs fill max_heart_rate 200`.

## Gotchas

- `fill` replaces the whole value and fires one `input` event; it does not type key by key.
- Language changes relabel every button, so `click` labels follow the `language` setting.
