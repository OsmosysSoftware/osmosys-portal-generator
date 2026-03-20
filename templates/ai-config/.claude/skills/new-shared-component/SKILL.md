---
name: new-shared-component
description: Scaffold a reusable shared component with Osmosys patterns (standalone, OnPush, signals, separate template).
---

# New Shared Component

Create a reusable shared component for `$ARGUMENTS`.

## Step 1: Scaffold

```bash
ng generate component shared/components/<component-name> --flat
```

This creates `.ts` and `.html` files in `src/app/shared/components/<component-name>/`.

## Step 2: Apply Patterns

Ensure the generated component follows all project standards:

```typescript
import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'app-<component-name>',
  imports: [],
  templateUrl: './<component-name>.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <PascalName>Component {
  // Use input() for props
  readonly label = input.required<string>();
  readonly disabled = input(false);

  // Use output() for events
  readonly clicked = output<void>();

  // Use signal() for internal state
  readonly loading = signal(false);
}
```

## Step 3: Export

Add to `src/app/shared/components/index.ts` (create if it doesn't exist) for clean imports:

```typescript
export { <PascalName>Component } from './<component-name>/<component-name>';
```

## Step 4: Verify

1. `ng build` — must succeed
2. `npm run lint` — must pass
