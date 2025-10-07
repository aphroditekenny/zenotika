# Tokens Directory (Phase 1)

Purpose: incremental extraction of design primitives from the legacy monolithic `globals.css` & historical Webflow export into discrete, composable token layers.

## Files
| File | Role |
|------|------|
| `spacing.css` | Space scale (`--space-*`) replacing ad-hoc margin/padding utility classes. |
| `motion.css` | Duration & easing tokens plus global reduce-motion guard. |
| `accessibility.css` | Focus ring tokens + generic selectors (will replace scattered outline rules). |
| `colors.css` | Indirection tokens (`--token-color-*`) referencing existing semantic vars for future decoupling. |

## Principles
1. Non-breaking: existing component CSS still works; tokens are additive.
2. Indirection first: use `--token-*` so underlying brand/color variables can shift without mass refactors.
3. Progressive adoption: new/updated components prefer tokens; legacy classes migrate opportunistically.
4. Accessibility by default: unified `:focus-visible` styling sourced from tokens.

## Migration Checklist (Phase 1 → 2)
- [ ] Audit literal colors & map to `--token-color-*` or introduce new token.
- [ ] Replace repeated focus outline rules in `header.css`, `footer.css`, sections with `.focus-ring` utility or rely on base selectors.
- [ ] Introduce spacing utility generator (optional PostCSS) to output margin/padding classes from `--space-*`.
- [ ] Document deprecations list for variables slated for removal.

## Adding New Tokens
1. Add primitive (e.g. `--color-brand-lilac`) in `globals.css` (temporary) or a dedicated primitives file (Phase 2).
2. Create corresponding indirection alias in `colors.css` → `--token-color-brand-lilac`.
3. Update docs & run `npm run lint:colors` (ensure rule set recognizes new token) if linter extended.

## Focus Strategy
- Current global selectors cover interactive elements.
- For custom focus styling (e.g., pill buttons) add class `.focus-ring` instead of redefining outline.
- Long term: remove one-off outline declarations in component styles to reduce bundle size & inconsistency.

## Future Phases
Phase 2: Extract primitives to `primitives/` + generate JSON design tokens for cross-platform (Lottie theming, docs site).
Phase 3: Automated purge + enforce token usage via stylelint custom rules.

---
Questions or want to expand? Open an issue or mention in code review.