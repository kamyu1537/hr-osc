---
description: "Ask and get approval before spawning subagents on an inferred interpretation of a vague user report"
---

## Confirm the interpretation before dispatching work

A vague report names no source, no setting and no user action, and reads just as easily as a bug report or a feature request.

Before you dispatch a subagent or claim a root cause:

1. **Restate the report in one line** as you understand it, including the heart rate source (HTTP, Stromno, Pulsoid legacy), the OSC host and port, the receiver (VRChat or another OSC app) and what the user saw on Home.
2. **Ask one question** when any of these is unknown: which hr-osc version, which settings (`config.json` values), what the user did step by step, what they expected instead.
3. **Get approval for the plan**, then dispatch. A plan is: the suspected cause, the file you will change, and how you will prove it.

A guessed interpretation that ships in a release costs the user more than one question. Diagnosis dispatched on an assumption is not evidence-first work.

One question, approval, plan, then act.
