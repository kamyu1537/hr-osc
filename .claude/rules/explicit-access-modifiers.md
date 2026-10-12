---
description: "Every TypeScript class member carries an explicit public, protected or private"
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

Write an access modifier on every TypeScript class member, even when it equals the default. Fields, methods, constructors, accessors and constructor parameter properties each take `public`, `protected` or `private`: write `private count = 0;`, not `count = 0;`.

- Rust is excluded: it has no keyword for private.
- Apply it to declarations you add or change. Report missing modifiers in existing code; fix them in bulk only when the owner asks.
- `pnpm run lint` enforces it with `@typescript-eslint/explicit-member-accessibility` (`accessibility: "explicit"`). Never bypass it with `eslint-disable`, a lower severity, or by removing the rule.
- Before reporting work done, check every declaration you added or changed for a missing modifier.
