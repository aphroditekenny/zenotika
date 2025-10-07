# Unified Progress Model

Tanggal: 2025-10-08 (diperbarui – pasca integrasi analytics & microcopy)

Dokumen ini melengkapi `docs/focus.md` (Section 13) dengan detail teknis implementasi model progres terpadu.

## 1. Tujuan
Menyatukan dua domain progres (eksplorasi section & koleksi scavenger hunt) menjadi satu sumber kebenaran untuk UI (Header, overlay, future analytics) tanpa prop drilling berlebih.

## 2. Sumber Data
- Section exploration: dihitung dari `useSectionTracker` → visitedIds / totalSections.
- Collection: `HUNT_ITEMS` + localStorage key `zenotika-hunt-progress`.
- Event sinkronisasi:
  - `zen:hunt-progress` (mutasi koleksi)
  - `zen:progress-milestone` (pencapaian ambang kombinasi)
  - `zen:progress-update` (emisi koarse setiap delta n%—default 5%)

## 3. Hook `useUnifiedProgress`
Signature: `useUnifiedProgress({ visitedCount, totalSections }, options?)`.

Opsi:
- `explorationWeight`, `collectionWeight` (manual baseline; diabaikan jika `adaptiveWeighting` true)
- `adaptiveWeighting` (default false): fase <50% eksplorasi 0.65/0.35, 50–79% 0.55/0.45, ≥80% 0.4/0.6
- `milestoneThresholds` (default `[25,50,75,100]`)
- `terminalStyle` (default true → pseudo-terminal)
- `analytics` (default true) aktifkan emisi `progress_update` & `progress_milestone`
- `progressEventGranularity` (default 5) ambang delta minimal persen untuk `progress_update`

Return fields:
```
{
  visitedCount, totalSections,
  collectedCount, totalCollectibles,
  explorationPercent, collectionPercent,
  completion,                  // weighted integer 0..100
  statusLine,                  // plain (microcopy template)
  statusLineTerminal,          // stylized (microcopy template)
  explorationWeight, collectionWeight, weightingStrategy
}
```

## 4. Perhitungan
```
explorationPercent = visitedCount / totalSections * 100
collectionPercent  = collectedCount / totalCollectibles * 100
completion = round(explorationPercent * wE + collectionPercent * wC)
```
Bobot dinormalisasi jika jumlah != 1.

## 5. Events & Analytics
### 5.1 Milestone
Ambang default: 25, 50, 75, 100 (guard Set mencegah duplikasi). Payload:
```
CustomEvent<'zen:progress-milestone', { threshold: number; completion: number }>
```
Analytics (jika aktif): `track('progress_milestone', { threshold, completion, weights, strategy })`.

### 5.2 Progress Update (Koarse)
Dipicu ketika |completion - lastReported| >= `progressEventGranularity`.
```
CustomEvent<'zen:progress-update', {
  completion,
  explorationPercent,
  collectionPercent,
  explorationWeight,
  collectionWeight,
  strategy
}>
```
Analytics: `track('progress_update', {...})`.

### 5.3 Hunt Mutation
`zen:hunt-progress` tetap sebagai sumber sinkron koleksi.

## 6. Aksesibilitas
- `statusLine` & `statusLineTerminal` dihasilkan dari microcopy dictionary.
- Tambahan template khusus screen reader (`progressA11yTemplate`) mengurangi noise simbol.
- Segmented unified bar sekarang `role="progressbar"` + `aria-valuenow/min/max` dan `aria-describedby` legend sr-only (memuat bobot & komposisi).
- Milestone announcements pada live region terpisah agar tidak menginterupsi progres utama.

## 7. Ekstensi Mendatang
- Debounce tambahan progress update saat keadaan hiperaktif.
- Persist snapshot ke sessionStorage (hydration konsisten).
- Narrative HUD konsumsi `zen:progress-update`.
- i18n microcopy multi-locale.

## 8. Testing
`__tests__/useUnifiedProgress.test.tsx` meliputi:
- Default & custom weighting.
- Adaptive weighting shift.
- Milestone unik (guard).
- Debug output analytics (DEV mode) memverifikasi event.

## 9. Risiko
- Interpretasi bobot (misleading 100% vs 0%) → mitigasi: legend & edukasi tooltip.
- Event noise → mitigasi granularity + guard.
- Screen reader verbosity → mitigasi pemisahan live region + template tereduksi.

## 9b. Naming Harmonization (OPP-8.14)
Events, hook & microcopy diselaraskan (namespace `zen:`). Lihat `docs/naming-harmonization.md`.

## 10. Changelog
- 2025-10-08: Versi awal.
- 2025-10-08: Tambahan analytics, progress-update event, microcopy terpusat, a11y progressbar & naming harmonization.
