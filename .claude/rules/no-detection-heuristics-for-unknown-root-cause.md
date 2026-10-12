---
description: "Never dispatch detect-and-special-case heuristics as a fix; find and fix the root cause first"
---

A heuristic that detects a situation and branches around it is a symptom patch, not a fix.

Before writing any detect-and-special-case logic:

1. **Name the observable defect** in terms of a concrete value: which OSC address and value was sent, which config field held what, which Tauri command returned what, what VRChat or the user actually saw.
2. **Read the consuming source** (VRChat's OSC documentation, the Tauri plugin, the Stromno RPC response, `rosc`, `axum`) and confirm the semantics of every value you send or read. Most "we need to detect X" bugs are really "we sent the wrong value" or "we read the right value with the wrong semantics".
3. **Reproduce with measurement**, not reasoning: one run of the real app that prints before/after values.
4. Only then choose the fix. A correct mapping, a correct conversion, or a correct default beats any detector.

A detector is acceptable **only** when the upstream data is genuinely ambiguous and you can state, with evidence, that no deterministic rule exists. Say so explicitly and show the evidence.

Cost of getting this wrong: the heuristic misfires on a case you did not anticipate, the real bug stays, and every later fix has to reason around the detector before it can be removed. The OSC host regex that silently turned host names into `127.0.0.1` (#14) was such a detector.
