# Guideline Compliance Matrix (Updated)

Generated: 2025-10-08 (post color ratchet)
Scope: Same as initial pass. This section supersedes the malformed single-line encoding above.

## 1. Naming & Architecture
| Rule | Status | Evidence | Remediation | Priority | Owner | Target |
|------|--------|----------|------------|---------|-------|--------|
| Separate vendor/base layer from app components | Partial | Monolithic `index.css` still large | Extract base + legacy to `styles/base` & `styles/legacy` | M | FE | Iteration 2 |
| Use semantic variables instead of raw hex | Partial | 38 unique hex (down from 58) | Reduce to <30 (brand + one-offs) | H | FE | Iteration 2 |
| Consistent state modifiers (`.is-*`, `.has-*`) | Implemented | Pattern present | Periodic audit | L | FE | Iteration 3 |
| Avoid duplicated day/night DOM variants | Partial | `.day/.night` still present | `[data-theme]` migration plan (T-01) | H | FE | Iteration 2 |
| Modularize components styles | Partial | Extraction in progress | Continue sectional split | M | FE | Rolling |
| Central spacing scale | Implemented | Tokens present | Map residual ad-hoc values | M | FE | Iteration 1 |
| Central motion tokens | Partial | Durations/easings mixed | Define motion scale & map | M | FE | Iteration 2 |

## 2. Theming
| Rule | Status | Evidence | Remediation | Priority | Target |
|------|--------|----------|------------|---------|--------|
| Use CSS variables for theme colors | Implemented | Token files + usage | Continue consolidation | M | Rolling |
| Single DOM with attribute theme switch | Missing | Duplicated variants | Implement `[data-theme]` attr | H | Iteration 2 |
| Respect prefers-color-scheme | Missing | No auto detection | Add media + override logic | M | Iteration 2 |

## 3. Motion & Animation
| Rule | Status | Evidence | Remediation | Priority | Target |
|------|--------|----------|------------|---------|--------|
| Guard non-essential motion | Enforced | Keyframe report 0 unguarded | Maintain | H | Continuous |
| Avoid layout thrash | Implemented | transform/opacity usage | Add audit script (M-01) | M | Iteration 1 |
| Provide manual motion toggle | Partial | Toggle component exists | Wire to root attr | M | Iteration 1 |
| Normalize durations/easing | Partial | Mixed inline values | Introduce motion tokens | M | Iteration 2 |

## 4. Color & Tokens
| Rule | Status | Evidence | Remediation | Priority | Target |
|------|--------|----------|------------|---------|--------|
| No raw white hex overlays | Enforced | Replaced with `--zen-white-alpha-*` | N/A | - | Done |
| Reduce unique hex below threshold | Enforced | 38 < limit 50 | Next ratchet -> 40 (<30 stretch) | H | Iteration 2 |
| Use semantic brand palette | Partial | Brand pink inline (#ff7a8a) | Add brand tokens | H | Iteration 2 |
| Discourage low-frequency one-offs | Partial | Many count=1 | Fold into mixes/remove | M | Iteration 2 |

## 5. Accessibility (unchanged vs initial except motion toggle wiring)
| Focus visible | Implemented | `.focus-ring` utility | Normalize legacy outlines | M | Iteration 1 |
| Reduced motion support | Partial | Guarded animations; toggle un-wired | Wire toggle | M | Iteration 1 |

## 6. Tooling & Scripts (delta)
| Item | Status | Note |
|------|--------|------|
| Black alpha token ladder | Done | Added 25,50,70,90,95 extensions |
| Color entropy ratchet 70->50 | Done | RAW_HEX_LIMIT updated |
| Token directory excluded from color scan | Done | report-colors ignore implemented |
| Animation safety JSON | Partial | GuardedPct 81% (duplicate-name parsing) |

## 7. Metrics (Updated)
- Unique hex colors: 27 (below ratcheted limit 40; next goal <30 then <25)
- RAW_HEX_LIMIT: 40 (next planned 30)
- Unguarded keyframes (report-keyframes): 0
- Animation safety guardedPct: 94% (unsafe=3; severity classification active)

## 8. Updated Next Actions
1. Remediate 3 unsafe keyframes (remove box-shadow animation -> opacity/transform token).
2. Final prune of rare colors to reach <30 (done) then push toward <25.
3. Begin `[data-theme]` implementation replacing `.day/.night` wrappers.

---
This updated section will replace the earlier initial pass once verified; legacy encoded block retained temporarily for diff clarity.