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
- `signal()` / `computed()` for component state (loading, dialogVisible, etc.)
- `@if` / `@for` in templates — NOT `*ngIf` / `*ngFor`
- `templateUrl` — NO inline template
- `viewChild<Table>('dt')` for table reference
- **Reactive Forms** (`ReactiveFormsModule`) — NOT template-driven forms
- **Typed severity maps** (`Record<string, Severity>`) — NOT inline ternaries for status badges
- **ConfirmationService** for delete — NOT direct deletion
- **MessageService** for toast notifications on create/update/delete success

### Form pattern (REQUIRED — Reactive Forms)

```typescript
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// In component
private readonly fb = inject(FormBuilder);

readonly itemForm = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  status: [0, Validators.required],
});

openCreate(): void {
  this.editingItem.set(null);
  this.itemForm.reset({ name: '', email: '', status: 0 });
  this.dialogVisible.set(true);
}

openEdit(item: Item): void {
  this.editingItem.set(item);
  this.itemForm.patchValue(item);
  this.dialogVisible.set(true);
}

save(): void {
  this.itemForm.markAllAsTouched();
  if (this.itemForm.invalid) return;
  const value = this.itemForm.getRawValue();
  // ... API call with value
}
```

```html
<!-- In template — use formGroup and formControlName -->
<form [formGroup]="itemForm">
  <div class="flex flex-col gap-2">
    <label for="name" class="font-medium">Name *</label>
    <input pInputText id="name" formControlName="name" />
    @if (itemForm.controls.name.touched && itemForm.controls.name.hasError('required')) {
      <small class="text-red-500">Name is required</small>
    }
  </div>
</form>
```

**NEVER** use `FormsModule` + `[ngModel]` + `(ngModelChange)` + individual signals for form fields.
**NEVER** write manual `isFormValid()` methods — use `this.form.invalid` instead.

### Form submission rules (REQUIRED)

- ALWAYS wrap form fields in a `<form>` tag with `(ngSubmit)="save()"` so Enter key triggers submission
- ALWAYS use `type="submit"` on the submit `p-button` — PrimeNG buttons default to `type="button"` which won't trigger `ngSubmit`
- NEVER use `(onClick)` on the submit button when `(ngSubmit)` handles it — avoid double submission
- When using `ngModel` inside a `<form>`, ALWAYS add a `name` attribute on each control — Angular requires it

### Typed severity pattern (REQUIRED)

```typescript
type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

private readonly statusSeverityMap: Record<string, Severity> = {
  active: 'success',
  inactive: 'danger',
  pending: 'warn',
};

getStatusSeverity(status: string): Severity {
  return this.statusSeverityMap[status] ?? 'info';
}
```

```html
<!-- NEVER use inline ternaries for severity — use typed maps -->
<p-tag [value]="item.status" [severity]="getStatusSeverity(item.status)" />
```

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
  @if (loading()) { <p-skeleton height="300px" /> }
  @else {
    <p-table #dt [value]="items()" [paginator]="true" [rows]="10"
      [stripedRows]="true" [rowHover]="true"
      [sortField]="'default_field'" [sortOrder]="-1"
      [globalFilterFields]="['field1', 'field2']"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
      [rowsPerPageOptions]="[10, 20, 50]">
      #header: column headers with pSortableColumn
      #body: data rows with edit/delete action buttons
      #emptymessage: "No items found"
    </p-table>
  }

  <!-- CRUD dialog with Reactive Form -->
  <p-dialog [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [header]="editingItem() ? 'Edit Item' : 'New Item'" [modal]="true">
    <form [formGroup]="itemForm" (ngSubmit)="save()">
      <!-- formControlName fields with validation messages -->
      <ng-template #footer>
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="dialogVisible.set(false)" />
        <p-button type="submit" label="Save" icon="pi pi-check" [disabled]="itemForm.invalid || itemForm.pristine" [loading]="saving()" />
      </ng-template>
    </form>
  </p-dialog>

  <p-confirmDialog />
</div>
```

### Delete pattern (REQUIRED)

```typescript
private readonly confirmationService = inject(ConfirmationService);
private readonly messageService = inject(MessageService);

confirmDelete(item: Item): void {
  this.confirmationService.confirm({
    message: `Are you sure you want to delete "${item.name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonStyleClass: 'p-button-danger',
    accept: () => {
      this.featureService.delete(item.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `"${item.name}" deleted successfully`,
          });
          this.loadItems();
        },
      });
    },
  });
}
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
