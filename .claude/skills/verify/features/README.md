# hr-osc verification map

Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- An instance launched by `../SKILL.md` with the seeded verification config: HTTP source on 18080, OSC to `127.0.0.1:19000`, `max_heart_rate` 200, English UI.
- The OSC listener runs on UDP 19000 and was started before the app.
- The Doctor checks in `../SKILL.md` pass.
- Never drive an instance this run did not start.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Reach screens through the nav links (`Home`, `Settings`, `About`) and the Settings tabs (`Source`, `OSC`, `Params`, `General`) with `cdp.mjs click`.
- Change settings with `cdp.mjs fill <config key> <value>`; wait 1 s for the 500 ms save debounce before checking `config.json`.
- Restore every setting you changed before the next recipe.

## Proof and skip reporting

- Capture the user action and the resulting state: the commands, `main`'s text after them, the OSC lines and `config.json`.
- A UI change also gets a screenshot of the changed state, in en and ko.
- Report a path you could not reach with the command you tried and the unmet precondition. Do not report the widget sources as verified through the HTTP source.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behaviour, then four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with cdp.mjs`, `Gotchas`.

## Features

- [HTTP heart rate source](./http-source.md) covers receiving bpm, the connected state, the percent and the timeout.
- [Settings](./settings.md) covers editing a field, validation errors and persistence to `config.json`.
- [OSC output](./osc-output.md) covers the target address and the send-failure message.
