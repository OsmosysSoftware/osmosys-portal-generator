---
name: i18n
description: Add or manage internationalization (i18n) for Angular components. Use when adding translations, extracting messages, or configuring new locales.
---

# Internationalization (i18n)

This project uses Angular's built-in i18n with `@angular/localize`.

## Marking Text for Translation

### In Templates

Use the `i18n` attribute on any element with static text:

```html
<h1 i18n>Welcome to the Dashboard</h1>
<p i18n="dashboard|Welcome message for users">Hello, user!</p>
```

For attributes:
```html
<input i18n-placeholder placeholder="Search..." />
<img i18n-title title="Company Logo" />
```

With meaning and description (helps translators):
```html
<span i18n="menu|Navigation menu item@@menuDashboard">Dashboard</span>
```

Format: `i18n="{meaning}|{description}@@{custom_id}"`

### In TypeScript

Use `$localize` tagged template literals:

```typescript
const greeting = $localize`Hello, ${userName}!`;
const pageTitle = $localize`:page title|Title for settings page:Settings`;
```

### Plurals and Select

```html
<span i18n>{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}</span>
<span i18n>{role, select, admin {Administrator} user {User} other {Unknown}}</span>
```

## Extracting Translation Messages

```bash
npm run i18n:extract
```

This generates `src/locale/messages.xlf` — the source translation file.

## Adding a New Locale

1. Copy `messages.xlf` to `messages.{locale}.xlf` (e.g., `messages.fr.xlf`)
2. Translate the `<target>` elements in the new file
3. Add the locale to `angular.json`:

```json
"i18n": {
  "sourceLocale": "en",
  "locales": {
    "fr": "src/locale/messages.fr.xlf"
  }
}
```

4. Build for that locale:
```bash
ng build --localize
```

## Serving a Specific Locale

```bash
ng serve --configuration=fr
```

Add a build configuration in `angular.json` for each locale:
```json
"configurations": {
  "fr": {
    "localize": ["fr"]
  }
}
```

## Resources

- [Angular i18n Guide](https://angular.dev/guide/i18n)
- [Angular $localize API](https://angular.dev/api/localize/init/$localize)
