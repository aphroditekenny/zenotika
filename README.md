# Zenotika

  <!-- Update the badge below with your repository owner/name -->

![Build status](https://github.com/aphroditekenny/zenotika/actions/workflows/build.yml/badge.svg)

Zenotika is a performance-focused React 19 + Vite PWA demonstrating accessible, modern UI/UX patterns with progressive enhancement.

> Runtime requirement: Node.js 22 LTS (>=22.0.0). Node 20 is now in maintenance and Node 18 is EOL.

Original inspiration Figma exploration: https://www.figma.com/design/qMHRh7E036Z4CmNzdch7HK/Replicate-Existing-UI-UX.

## Highlights

- ⚡ React 19 + Vite build pipeline
- 📱 Installable PWA with offline fallback & update flow
- ♿ Accessibility-first components & automated axe smoke tests
- 📊 Web Vitals collection + optional analytics/monitoring hooks
- 🧩 Feature-flag driven progressive delivery
- 🧪 Playwright + Vitest coverage for critical flows

## SEO & Metadata

The HTML head includes:

- Descriptive `<meta name="description">` aligned with this README
- Open Graph + Twitter summary large image tags
- Canonical URL pointing to GitHub Pages deployment
- JSON-LD `WebSite` structured data block for richer search presentation

If you add a custom domain later, update:

1. `index.html` canonical + og:url
2. `public/sitemap.xml` loc values
3. `public/robots.txt` sitemap URL
4. Adjust CSP in `netlify.toml` or hosting config

## Project baseline

- `src/App.tsx` is the single application entry point.
- Global styles are sourced from `src/styles/globals.css`.
- Accessibility and theming are provided by `AccessibilityProvider` and `ThemeProvider` inside `App.tsx`.

## Commands

```bash
node -v             # should be v22.x LTS (>=22.0.0)
npm install         # install dependencies
npm run dev         # start the Vite dev server (http://localhost:5173 by default)
npm run lint        # run ESLint (React + a11y rules)
npm run test        # execute Vitest + axe accessibility smoke checks
npm run test:e2e    # execute Playwright smoke covering theme + filters (run `npx playwright install` once)
npm run test:e2e:pwa# build with PWA flag, serve preview, and run offline/update toast end-to-end checks
npm run build       # create a production build in /build
npm run bundle:check# validate gzip bundle budget (250 kB limit)
npm run analyze     # emit build/bundle-report.html with treemap metrics
```

## Feature flags

Toggle performance and monitoring behaviour via Vite environment variables (set in `.env` or your deployment provider):

| Flag                                  | Behaviour                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_ENABLE_LAZY_HOME_PAGE=true`     | Lazily load the `HomePage` bundle using `React.lazy` + suspense; prefetches on navigation.                                                             |
| `VITE_ENABLE_LAZY_HOME_SECTIONS=true` | Splits the quote, log book, and footer sections into their own suspense boundaries with progressive fallbacks.                                         |
| `VITE_ENABLE_PERF_METRICS=true`       | Registers Web Vitals listeners (CLS/FID/LCP/INP/TTFB), records them via the in-app collector, and dispatches `perf-metric` events for custom handling. |
| `VITE_ENABLE_ANALYTICS=true`          | Injects [Vercel Analytics](https://vercel.com/analytics) for real-time engagement/performance tracking.                                                |
| `VITE_ENABLE_MONITORING=true`         | Boots [Sentry](https://sentry.io/) in production (requires `VITE_SENTRY_DSN`) to capture runtime errors and traces.                                    |
| `VITE_ENABLE_PWA=true`                | Registers the service worker, surfaces install prompts, and enables update toasts (production builds only).                                            |
| motionToggle | `VITE_ENABLE_MOTION_TOGGLE` | Show floating motion preference override panel |
| segmentLoop (hook opt) | n/a (per-hook option) | In `useLottie`, when `segmentLoop: true` + `segmentIndex`, the specified segment loops instead of full animation |

### Accessibility Preference Overrides

The accessibility layer auto-detects user preferences via media queries and interaction heuristics. We also provide **manual overrides** (persisted in `localStorage`) for testing or explicit user control:

Key `localStorage` entries:
- `a11y.reducedMotionOverride` : `'true' | 'false'` or removed (null) to follow system.
- `a11y.highContrastOverride` : `'true' | 'false'` or removed.
- `a11y.focusVisibleOverride` : `'true' | 'false'` or removed.

When `motionToggle` flag is enabled, a floating control allows toggling reduced motion and resetting to system defaults. High contrast & focus visibility overrides can be set programmatically via the `AccessibilityContext` setters (future UI can surface these if needed).

All flags default to `false`, keeping the legacy behaviour until you're ready to roll out.

## CSS Layering & Governance

We use `@layer` to enforce a predictable cascade and future purge friendliness. Current ordering:

1. `base` – tokens (`spacing`, `motion`, `accessibility`, `colors`, `typography`) + resets.
2. `components` – extracted modular component/section styles (migrating from legacy monolith).
3. `utilities` – Tailwind utility layer (imported after tokens so it can reference vars).
4. `overrides` – one-off patches / deprecation shims scheduled for removal.

### Token Expansion Phase (In Progress)

Typography tokens added (`src/styles/tokens/typography.css`) define the initial fluid scale + utility classes (`heading-token-*`, `paragraph-token-*`). Future steps:

- Replace ad-hoc `heading-style-h2`, `intro-paragraph`, etc. with token utilities.
- Migrate raw hex colors to semantic tokens (see color report script below).
- Introduce `[data-theme]` root scoping to remove duplicated day/night DOM variants.

### Reporting Scripts

Run these to guide refactors:

```bash
npm run report:colors      # raw hex usage + frequency guidance
npm run report:keyframes   # list keyframes + reduced-motion guard heuristic
npm run report:daynight    # detect duplicated day-/night- prefixed DOM siblings
npm run style:audit        # run reports + enforce thresholds (CI friendly)
```

Add them to CI later to prevent regressions once the purge pipeline lands.

## Monitoring

## PWA & offline testing

The service worker lives in `public/sw.js` and stays dormant unless `VITE_ENABLE_PWA=true` at build time. To validate the offline experience without impacting local dev:

- Create a `.env.local` with `VITE_ENABLE_PWA=true` and build the project (`npm run build`), or set the flag in your hosting environment for a staging deploy.
- Preview with `npm run preview:pages`, install the app prompt, and toggle airplane mode to confirm navigation falls back to `offline.html`.
- If you ship new assets, bump `CACHE_VERSION` inside `sw.js` so stale caches are purged during `activate`.
- Each production build writes `build/asset-manifest.txt`; the service worker consumes it to precache hashed JS/CSS and eligible images/fonts.

## Continuous integration

Every push and pull request runs linting, tests, `npm run build`, the bundle budget check, and emits a bundle report artifact via GitHub Actions (see `.github/workflows/build.yml`). Replace the badge placeholder above with your repository slug to display live status.

## Manual smoke checklist

Run through these steps after significant UI changes:

1. `npm run dev` and open the served URL.
2. Landing → home transition animates without console errors; browser back/forward updates history correctly.
3. Portfolio filters/search update the project grid and screen-reader announcement region.
4. Log Book section reveals on scroll with animations intact.
5. Theme toggle switches light/dark variants and persists across refresh.
6. Run Lighthouse or axe browser extension; elevate any P0 accessibility issues immediately.
