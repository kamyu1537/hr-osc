---
description: "Code explains itself. A comment is one short line, only where the code cannot say it, in every code file (TS, TSX, Rust, scripts)"
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.rs"
  - "**/*.mjs"
---

Code must be readable on its own; a comment that walks through complicated code is a sign the code should be simpler.

- **Default is no comment.** Make the code say it: a better name, an extracted well-named function, a simpler structure.
- **A comment is allowed only for what the code cannot say and a reader would get wrong**: a VRChat, OSC, Tauri, WebView2 or Stromno gotcha, a unit, an invariant, a non-obvious external fact. Example: `// VRChat listens on 127.0.0.1, and localhost can resolve to ::1 first.`
- **One short line.** Two consecutive comment lines, a multi-line `/* */` block, or a multi-line `///` doc comment is too long; cut it to the one fact that matters.
- **Never:**
  - narrating what the next statement does, or restating a name (`// 500ms 마다 재시도` above a 500 ms sleep);
  - rationale essays or design discussion; those belong in the PR description;
  - history: what the code used to do, which bug this fixed, what an earlier revision broke; that belongs in the commit message and the PR;
  - commented-out code.

Before writing a comment, ask: would a competent reader misread this code without it? If not, delete it.
