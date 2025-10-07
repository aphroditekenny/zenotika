## Theme Attribute Migration Plan

Goal: Replace duplicated `.day` / `.night` DOM structures with a single semantic tree styled via `data-theme` (values: `day`, `night`).

### Current Issues
- Parallel markup for day/night variants inflates DOM & maintenance cost.
- Some gradients & background assets hard-coded per variant.
- JS logic branches on class presence rather than a single source of truth.

### Target State
- Root `<html data-theme="night">` (default resolved from system + user preference persistence).
- All variant styling expressed via `[data-theme="day"]` / `[data-theme="night"]` selectors or media queries fallback.
- Toggle component updates `data-theme` and persists choice in `localStorage` (`zen.theme`).

### Migration Steps
1. Introduce attribute toggle utility (`themeToggle.ts`) with `getInitialTheme()` + `applyTheme(theme)`.
2. Wrap existing theme switch UI to call `window.__zenTheme.toggle()`.
3. Replace `.day .selector` / `.night .selector` with `[data-theme=day] .selector` etc. in extracted CSS modules.
4. Remove legacy day/night container elements once all selectors migrated.
5. Add prefers-color-scheme bootstrap (if no stored preference, infer).
6. Provide reduced-motion synergy: retain separate attribute (`data-reduced-motion`).

### CSS Refactor Notes
- Use cascade layering: `@layer theme` for theme overrides after base tokens.
- Where duplicated backgrounds differ only by color stops, derive with `color-mix()` referencing shared tokens.
- For large hero/day vs night assets, consider `image-set()` with media/attribute fallback.

### Telemetry (Optional)
- Track manual theme toggles (count) to evaluate default strategy validity.

### Completion Criteria
- No `.day` / `.night` structural wrappers.
- Lighthouse / bundle diff shows DOM node reduction.
- Color report unaffected (no increase in unique hex).

---
Document will be updated iteratively during execution.