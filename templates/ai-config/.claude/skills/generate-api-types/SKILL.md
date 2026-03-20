---
name: generate-api-types
description: Regenerate TypeScript types from the backend OpenAPI spec. Use after backend API changes.
allowed-tools: Bash, Read
---

# Generate API Types

## Generate

```bash
npm run generate:api
```

## After Generation

1. **NEVER manually edit** `src/app/core/types/api.types.ts`
2. Add type aliases in `src/app/core/models/api.model.ts`:
   ```typescript
   import { components } from '../types/api.types';
   export type MyEntity = components['schemas']['MyEntityResponseDto'];
   ```
3. Import from `api.model.ts` — NOT from `api.types.ts`
4. Use snake_case field names directly — NO camelCase conversion
5. `ng build` to verify no type errors
