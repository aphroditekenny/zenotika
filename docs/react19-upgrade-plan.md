# React 19 / Ecosystem Upgrade Game Plan

_Last updated: 2025-10-05_

> **Status update (2025-10-05):** Upgrade executed successfully on branch `main`.
> - Runtime/tooling now at `react@19.2.0`, `react-dom@19.2.0`, `vite@7.1.9`, `@vitejs/plugin-react-swc@4.1.0`, `vitest@3.2.4`.
> - Post-upgrade validation passes: `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`, `npm run bundle:check`.
> - `npm audit` reports **0 vulnerabilities**; esbuild advisory cleared.
> - Bundle size check shows largest gzip bundle at 59.96 kB (limit 250 kB) — see `build/bundle-report.html` for full treemap (generated 2025-10-05).
> - Vite/Vitest versions verified via `npx vite --version` and `npx vitest --version`.
> - Baseline snapshot generated via `npm run baseline:collect` → see `reports/baseline-report.json` for latest metrics. Landmark violations resolved after removing duplicate `role="main"`.

**Performance summary** (`reports/baseline-report.json`)
   - Time to First Byte: ≈ 9.8 ms
   - DOMContentLoaded: ≈ 97 ms
   - First Contentful Paint: ≈ 0.32 s
   - Largest Contentful Paint: _not captured_ (hero image still completes after initial telemetry; re-run with site interaction if LCP visibility is required)
   - Cumulative Layout Shift: 0
   - Δ vs. prior snapshot (FCP ≈ 3.09 s): TTFB -2.9 ms, DCL -48 ms, FCP -2.77 s (likely due to freshly primed preview and asset caching on the runner). One intermediate run briefly regressed FCP to ≈ 3.2 s; re-run recovered instantly, so treat as an outlier but keep watching the hero image load path.
- **Accessibility findings** (Axe)
   - _Resolved (2025-10-05):_ removing `role="main"` from `.page-transition-wrapper` cleared all Axe violations. Retain this section for historical context; re-run baseline after future layout changes.
## 🔄 Staging soak checklist (pending)
1. Deploy the 2025-10-05 build to staging (preview deploy or staging branch).
2. Toggle feature flags and smoke test:
   - `VITE_ENABLE_PERF_METRICS=true`
   - `VITE_ENABLE_MONITORING=true`
   - Confirm Web Vitals collector updates and Speed Insights forwarding / network beacons.
3. Repeat with both flags disabled to ensure graceful degradation.
4. Capture notes (good / needs follow-up) and link to the staging session in this doc once complete.

### Staging soak log
| Date | Environment | Flags | Notes | Outcome |
| --- | --- | --- | --- | --- |
| _Pending_ | Staging | `true/true`, `false/false` | Awaiting staging deployment window access. Prep checklist complete; run steps 2-4 once deployed. | ⏳ |

_Next action:_ coordinate with release engineering for a staging deploy slot, then execute the table rows above and attach screenshots or Speed Insights links.

### Staging automation (GitHub Actions)
- Manual trigger via Actions → "Deploy to GitHub Pages" with inputs:
   - `enable_perf_metrics`: true/false
   - `enable_monitoring`: true/false
   - `ref`: branch or tag to deploy (default `main`)
- The workflow builds with the proper base path and publishes to GitHub Pages for a fast staging URL.

### CI baseline automation
- CI runs on push/PR: lint, test, build, bundle budget, and `baseline:collect`.
- Baseline JSON is uploaded as a build artifact (see Actions run artifacts: `baseline-report`).

> _Status:_ staging soak + accessibility fix remain outstanding (targeting Week 3).

## 🎯 Goals
- Move the app from React 18.3.x to React 19 while keeping runtime and test stability.
- Align supporting tooling (React DOM, types, Vite, Vitest, SWC plugin, shadcn/Radix, lucide-react, etc.).
- Resolve the current `npm audit` advisories that point to the old `esbuild` bundle when patched releases land.

## 🧭 Overview
| Area | Current | Target | Notes |
| --- | --- | --- | --- |
| Runtime | `react@18.3.1`, `react-dom@18.3.1` | `19.x` | Requires matching `@types/react`, `@types/react-dom` and checking all external component libraries. |
| Bundler | `vite@6.3.5`, `@vitejs/plugin-react-swc@3.11.0` | `vite@7.x`, `@vitejs/plugin-react-swc@4.x` | Vite 7 lifts to the patched `esbuild` line and tracks React 19 fast refresh improvements. |
| Tests | `vitest@2.1.9` | `vitest@3.x` | Needed once Vite 7 lands; brings the fixed `esbuild` as well. |
| Icons | `lucide-react@0.487.0` (versioned path imports) | `lucide-react@0.544.0`+ | New major reorganizes exports; imports must drop the version suffix (`"lucide-react"`). |
| UI Primitives | Radix v1.2/1.1, shadcn/ui snapshot | Stay pinned or update to the latest patch that declares React 19 support | Track Radix release notes for official React 19 compatibility statement. |

## ✅ Pre-flight Checklist
1. **Stakeholder alignment:** confirm with design/dev leads when downtime is acceptable.
2. **Create feature branch:** e.g. `feat/react19-rollout`.
3. **Freeze deploys** during migration or ensure a rollback path from your platform (Vercel/Netlify/etc.).
4. **Snapshot perf/a11y baselines** (Lighthouse, `npm run bundle:check`, `vitest --run`) for comparison after upgrade.

## 🔍 Compatibility Research
- **Radix UI / shadcn**: monitor the [Radix UI changelog](https://www.radix-ui.com/docs/primitives/changelog) and shadcn template updates. They typically add React support flags per release. Block upgrade if any package still pins `< 19`.
- **react-day-picker**, **react-hook-form**, **embla-carousel**, **vaul**: verify their peer dependency ranges (`npm info <pkg> peerDependencies`). Many already accept `^18 || ^19`, but double-check before bumping.
- **Next themes**: ensure `next-themes@0.4.6` (or newer) loosens the peer range to include 19. If not, take the maintainer’s recommended version or consider swapping for a lighter theme switcher.
- **Testing utilities**: `@testing-library/react@16` fully supports React 19; keep it aligned.

> 📌 **Compatibility tracker** (checked via `npm view <pkg> peerDependencies` on 2025-10-05):
>
> | Package | Min supported React in latest release | Status |
> | --- | --- | --- |
> | `@radix-ui/react-*` | `^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc` | ✅ React 19 ready |
> | `next-themes` | `^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc` | ✅ React 19 ready |
> | `react-day-picker` | `>=16.8.0` | ✅ React 19 ready |
> | `react-hook-form` | `^16.8.0 || ^17 || ^18 || ^19` | ✅ React 19 ready |
> | `embla-carousel-react` | `^16.8.0 || ^17.0.1 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc` | ✅ React 19 ready |
> | `vaul` | `^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc` | ✅ React 19 ready |
> | `lucide-react` | `^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0` (≥0.544.0) | ✅ React 19 ready — remove versioned imports |
> | `@testing-library/react` | `react: ^18.0.0 || ^19.0.0` (requires `@types/react`/`@types/react-dom` `^18.0.0 || ^19.0.0`) | ✅ No changes required (keep types in sync) |
>
> _Re-verified with `npm view <pkg> peerDependencies` on 2025-10-05._
>
> Keep this table fresh if new dependencies are added or packages change their peer ranges.

## 🧱 Breaking-Change Watchlist
- **React 19 JSX Transform Updates:** minimal impact because the project already uses the new JSX runtime and `react-dom/client`. Ensure there are no references to removed APIs (`ReactDOM.render`, `ReactDOM.hydrate`).
- **Deprecated React APIs audit (2025-10-05):** `grep -R "ReactDOM.render" src` and `grep -R "ReactDOM.hydrate" src` both return no matches; continue to re-run after major refactors.
- **useEffect flushing + Strict Mode**: Expect double-invocation dev behavior; confirm custom hooks (`IntersectionObserver`, performance metrics) are idempotent.
- **Idempotency spot-check (2025-10-05):** `IntersectionObserver` disconnects observers on cleanup and `performanceMetrics` guards dynamic imports; dev-mode double invokes remain side-effect safe. Re-validate if new effects add network calls or DOM mutations without guards.
- **Third-party peer ranges**: failing to update will surface as warnings/errors during install. Do not ignore; update or pin the React version until upstream releases.

## 🛠️ Implementation Steps
1. **Update dependency ranges** in `package.json`:
   - `react`, `react-dom`, `@types/react`, `@types/react-dom` → latest 19.x.
   - `@vitejs/plugin-react-swc` → `^4.0.0`; update `vite` to `^7.0.0`.
   - `vitest` → `^3.0.0` (and, if needed, tweak config per release notes).
   - `lucide-react` → newest minor; remove versioned alias lines in `vite.config.ts` and adjust imports (`import { Icon } from "lucide-react"`).
2. **Adjust Vite aliases**: delete `'lucide-react@0.487.0': 'lucide-react'` and any other version-locked alias that is no longer necessary.
3. **Codemod lucide imports**:
   ```powershell
   Get-ChildItem src -Recurse -Filter *.tsx | % {
     (Get-Content $_.FullName) -replace '"lucide-react@0.487.0"', '"lucide-react"' | Set-Content $_.FullName
   }
   ```
4. **Install & rebuild lockfile**: `rm package-lock.json && npm install` (or `npm install --package-lock-only` if you prefer to avoid the nuke).
5. **Update TypeScript config** if the new JSX transform requires it (React 19 keeps `"jsx": "react-jsx"`, no change expected).
6. **Run validation suite**:
   ```powershell
   npm run lint
   npm run test
   npm run build
   npm run test:e2e
   npm run bundle:check
   ```
   Address any new warnings (especially from Radix components) before merge.
7. **Performance smoke**: capture Lighthouse + Web Vitals (`npm run baseline:collect`) to compare against pre-flight baselines.
8. **Deploy to staging** with flags toggled both on/off to ensure lazy loading & monitoring still behave.

## 🧪 Post-upgrade Verification
- `npm audit` — expect the esbuild advisory to disappear with Vite 7 / Vitest 3; document any residual warnings in this file along with upstream issue links.
- Confirm `vite --version` reports 7.x and `vitest --version` reports 3.x.
- Diff the generated bundle (`npm run analyze`) to ensure split points for lazy sections remain healthy; note regressions if bundle budgets creep upward.
- Capture before/after Web Vitals samples (Chrome DevTools or Speed Insights dashboard) while both `performanceMetrics` and `monitoring` flags are enabled.

## 🚑 Rollback Plan
- Keep a git tag (e.g. `pre-react19`) before merging the upgrade branch.
- If production issues arise, re-deploy the tagged build and investigate logs (likely peer range or Suspense regressions).

## 🧾 npm Audit Follow-up
Current audit output (2025-10-05):
```
found 0 vulnerabilities
```
Follow-up tasks:
- ✅ React 19 migration pulled in the patched `esbuild` through Vite 7 / Vitest 3.
- 📅 Schedule a fresh `npm audit` on **2025-10-12** (ticket #OPS-2411). Update this section with results and note any newly surfaced advisories.
- 🔁 Subscribe to Radix UI release notes and review monthly to catch any new React 19 compatibility advisories or API shifts.

## 🕒 Proposed Timeline
1. ✅ **Week 1** – Compatibility confirmations, create tracking issues, baseline metrics.
2. ✅ **Week 2** – Implement dependency bumps on feature branch, adjust imports, fix compile/test issues.
3. ⏳ **Week 3** – QA + design review, staging soak, finalize documentation. _Action items: run staging soak checklist, monitor Axe results after layout tweaks, refresh baseline report post-staging._
4. 🔜 **Week 4** – Production deployment during a low-traffic window, monitor for regressions, close out tasks. _Schedule once Week 3 sign-off is complete._

## ✅ Definition of Done
- All packages list React 19 in their peer ranges with no install warnings.
- Lint, unit, E2E, build, bundle checks all pass on CI.
- `npm audit` reports 0 (or mitigated) vulnerabilities for the esbuild advisory.
- Lazy-loading and monitoring feature flags behave identically pre/post upgrade.
- Documentation updated (README + CHANGELOG + here) noting new minimum React version.

---
_Keep this file updated as upstream packages announce React 19 readiness and as mitigation steps for the `npm audit` advisories complete._
