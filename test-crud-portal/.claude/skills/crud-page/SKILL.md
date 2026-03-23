---
name: crud-page
description: Generate a complete CRUD or read-only list page with service, routing, and menu integration. Use when adding a new feature page.
---

# Generate CRUD Page

Generate a complete feature page for `$ARGUMENTS`.

## Step 1: Gather Requirements

Ask the user using `AskUserQuestion` (max 4 per call):

### Batch 1

**Q1 — Page type:**
- **Full CRUD** (list + create/edit dialog + delete confirmation) — default
- **Read-only list** (list only, no create/edit/delete)

**Q2 — Access role:**
- **Any authenticated user** — no route guard
- **Specific role required** — add a `canActivate` guard

**Q3 — Menu group:**
- Which menu section? Also ask for a PrimeIcons icon name (e.g., `pi-users`)

**Q4 — API integration:**
- **Types exist** — type alias already in `core/models/api.model.ts`
- **Generate types** — run `npm run generate:api` first
- **No API yet** — stub service, user wires up later

### Batch 2

**Q5 — Entity fields:**
List fields as `field_name: type`. Annotate with:
- `*` = primary key (shown in table, not editable)
- `+` = editable (shown in both table and form)
- No annotation = display-only

**Q6 — Pagination:**
- **Client-side** — `p-table` handles pagination (small datasets)
- **Server-side** — `[lazy]="true"` with `(onLazyLoad)` (large datasets)

**Q7 — Default sort:**
- Which field? Sort order: Descending (default) or Ascending

## Step 2: Scaffold Files

```bash
ng generate component features/<feature-name>/pages/<feature-name>-list --flat
ng generate service features/<feature-name>/services/<feature-name>
```

## Step 3: Generate Code

### Mandatory patterns

- `ChangeDetectionStrategy.OnPush`
- `inject()` for DI — NOT constructor injection
- `signal()` / `computed()` for state
- `@if` / `@for` in templates — NOT `*ngIf` / `*ngFor`
- `templateUrl` — NO inline template
- `viewChild<Table>('dt')` for table reference

### Template structure

```html
<div class="card">
  <!-- Header -->
  <div><h1>icon + title</h1><p>subtitle</p></div>

  <!-- Toolbar -->
  <p-toolbar>
    #start: New button (CRUD only)
    #end: search input + refresh button
  </p-toolbar>

  <!-- Table -->
  @if (loading()) { <p-skeleton /> }
  @else {
    <p-table #dt [value]="items()" [paginator]="true" [rows]="10"
      [stripedRows]="true" [rowHover]="true"
      [sortField]="'default_field'" [sortOrder]="-1">
      #header: column headers with pSortableColumn
      #body: data rows with action buttons
      #emptymessage: "No items found"
    </p-table>
  }

  <!-- CRUD dialogs -->
  <p-dialog [visible]="dialogVisible()" ... />
  <p-confirmDialog />
</div>
```

### Service pattern

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/feature`;

  list(page = 1, limit = 20): Observable<PaginatedResponse<T>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<T>>(this.apiUrl, { params });
  }

  create(data: CreateInput): Observable<T> {
    return this.http.post<T>(this.apiUrl, data);
  }

  update(data: UpdateInput): Observable<T> {
    return this.http.put<T>(this.apiUrl, data);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(this.apiUrl, { body: { entity_id: id } });
  }
}
```

## Step 4: Wire Up Routing and Menu

Add route to `app.routes.ts` inside the layout children, and menu item to `app.menu.ts`.

## Step 5: Verify

1. `ng build` — must succeed
2. `npm run lint` — must pass
3. Navigate to the page in the browser
