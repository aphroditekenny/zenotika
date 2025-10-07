# Penamaan & Harmonisasi (OPP-8.14)

Tanggal: 2025-10-08
Status: INITIALIZED

Dokumen ini menginventarisasi istilah historis vs istilah aktif yang dipakai di basis kode dan dokumentasi; tujuan: menurunkan beban kognitif, mencegah duplikasi konsep, memudahkan onboarding, dan menjadi referensi lintas commit.

## 1. Prinsip
- Satu konsep → satu prefiks dasar ("zen-" untuk komponen produksi UI inti).
- Hindari campuran legacy generic (`navigation-bar`, `menu-panel`) dengan BEM baru (`zen-header__nav`, `zen-menu-panel`).
- Microcopy & event names memakai namespace `zen:` untuk browser CustomEvent, hindari varian campuran (`hunt-progress` → sudah digeser ke `zen:hunt-progress`).
- Hook & modul: awali dengan `use` (React), data modul dengan domain eksplisit (`huntItems`, `microcopy`).

## 2. Inventaris Istilah (Ringkas)
| Domain | Legacy / Lama | Baru / Konsisten | Status | Catatan |
|--------|---------------|------------------|--------|---------|
| Header Container | `navigation-bar`, `nav_*` | `zen-header` | Replaced | Semua referensi runtime sudah pakai `zen-header`. Tinggal referensi di `docs/css.md` lama. |
| Menu Overlay | `.menu-overlay` | `zen-header__overlay` | Replaced | Atribut ARIA dan state sekarang hidup di kelas baru. |
| Menu Panel (Desktop) | `.menu-panel` | `zen-menu-panel` | Replaced | Role=dialog; test a11y menunjang. |
| Mobile Menu | `.zen-mobile-menu` | `zen-mobile-menu` | Stable | Prefiks sudah konsisten. |
| Breadcrumb Items | `.breadcrumb-*` | `crumbSegments` (in‑memory) + `ActiveSectionLink` | Partially Unified | Perlu docs snippet ringkas. |
| Progress Unified | (implicit dual progress) | `useUnifiedProgress` | Added | Dokumen sinkron. |
| Hunt Event | `hunt-progress` | `zen:hunt-progress` | Unified | Namespaced. |
| Milestone Event | (baru) | `zen:progress-milestone` | Added | Namespaced. |
| Progress Update Event | (baru) | `zen:progress-update` | Added | Namespaced. |
| Storyline Section | (baru) | `zen:storyline:section-enter/exit` | Added | Memakai sub-namespace ganda. |
| Atmosphere Phase | implicit day/night | `phase` (dawn/day/dusk/night) | In Progress | Theming context diperluas; docs perlu contoh. |
| Terminal Status Voice | ad-hoc string | `renderProgressVoice` (microcopy) | Unified | Satu sumber format. |
| Milestone Copy | local const object | `MICROCOPY.milestoneXX` | Unified | Refactor complete. |

## 3. Konversi yang Sudah Dilakukan
- Header komponen utama telah diganti keseluruhan ke nama baru (prefiks `zen-`).
- Hook progres terpusat menggantikan pola manual di `Header.tsx`.
- Event namespace terpadu `zen:*` menghilangkan ambiguitas domain.
- Microcopy milestone dipindah ke `src/content/microcopy.ts` mematikan duplikasi literal.

## 4. Konversi yang Belum / Tertunda
| Item | Status | Rencana |
|------|--------|---------|
| Referensi legacy di `docs/css.md` | OUTDATED | Tambah tabel mapping + penanda deprecated. |
| Kelas konseptual breadcrumb lama (`breadcrumb-*`) | PARTIAL | Tambah catatan bridging ke `ActiveSectionLink`. |
| Penamaan anim registry vs a11y flags | REVIEW | Konsistensi prefix `animationRegistry` vs `zen-*` tidak wajib (domain util). |
| Future analytics event grouping | PLANNED | Potensi prefiks `zen:analytics:*` jika jumlah bertambah. |

## 5. Pedoman Penamaan Praktis
- Component root: `zen-[component]`.
- Element: `zen-[component]__[element]`.
- State / variant: modifier class `is-[state]` atau `--[variant]` (hindari campur dua bentuk untuk hal sama).
- Data attributes prefiks: `data-zen-*` bila butuh instrumentation (saat ini cukup implicit).
- CustomEvent: `zen:[domain]:[action]` (dua tingkat domain opsional). Hindari >3 tingkat kecuali narasi hierarkis (contoh acceptable: `zen:storyline:section-enter`).

## 6. Format Deprecation
Gunakan blok berikut di doc/komentar saat menemukan nama lama:
```md
Deprecated: gunakan `zen-header__nav` menggantikan `navigation-bar`.
Rasional: konsistensi BEM + brand prefix.
```

## 7. Checklist Harmonisasi (Iteratif)
- [x] Event namespace progress & hunt
- [x] Milestone microcopy konsolidasi
- [x] Terminal status unify
- [ ] Docs/css mapping legacy → baru
- [ ] Breadcrumb docs bridging
- [ ] Deprecation format sample di `docs/css.md`
- [ ] Add lint rule suggestion (eslint custom) OPTIONAL

## 8. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Fragmentasi tetap hidup di dokumentasi lama | Onboarding lambat | Tabel mapping + catatan deprecation ber-phase |
| In-flight features menambah nama tanpa pedoman | Drift baru | Referensi pedoman (section 5) di PR template |
| CustomEvent bertambah liar | Noise inspeksi devtools | Namespace pattern + audit incremental |

## 9. Next Steps
1. Update `docs/css.md` menambahkan tabel mapping dan label deprecated.
2. Tambah referensi cepat pedoman di README atau CONTRIBUTING.
3. Opsional: script audit grep nama legacy untuk CI warning.

---
Harmonisasi menurunkan cognitive switching cost dan mencegah multi-vocabulary. Dokumen ini harus direvisi setiap penambahan domain baru (storyline overlay, HUD, dsb.).
