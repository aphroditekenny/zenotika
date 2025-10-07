Berikut versi lebih mendalam dan terstruktur, tetap bersifat deskriptif (tanpa contoh kode implementasi). Fokus: mendeskripsikan kondisi saat ini, karakteristik khas things.inc (sesuai kutipan), dan memetakan area peluang pada Header, Main, Footer, serta lapisan lintas (teks, atmosfer, interaksi, performa, aksesibilitas) secara granular.

---

## 0. Batasan & Sumber Observasi
- Analisis kode berdasarkan potongan yang terindeks (pencarian terbatas): `Header.tsx`, `FooterSection.tsx`, `HomePage.tsx`, `App.tsx`, stylesheet modular (`header.css`, `footer.css`, `globals.css` pengurangan blok), dokumentasi `docs/css.md`.
- Sebagian struktur internal lain (misal detail penuh `header.css`, `ActiveSectionLink`, hook internal) tidak seluruhnya tampil.
- Deskripsi things.inc memakai kutipan hasil pencarian yang sudah tersedia; harus dipertahankan apa adanya.

---

## 1. Deskripsi Elemen Khas things.inc (kutipan apa adanya)

The notable design elements of the things.inc website center around its playfulness, retro-tech aesthetic, and a strong focus on creativity and collaborative play. Here's a breakdown of what makes its design stand out:

1. **Retro Computing Theme**: Upon visiting, the site simulates an old-school BIOS boot sequence, reminiscent of 1980s personal computers. This includes retro graphics, floppy disk references, and playful \"loading\" screens, creating a nostalgic and unique experience compared to typical startup websites[[1]](https://things.inc/).

2. **Interactive and Immersive Elements**: The site encourages exploration and emergent play, reflecting its software philosophy. For instance, their products like \"Rooms\" enable users to create interactive 3D environments, echoing the site’s emphasis on creative freedom and modular digital experiences inspired by toys like LEGO or early graphics software such as Kid Pix[[2]](https://www.cbinsights.com/company/things-2).

3. **Minimalist Yet Whimsical Layout**: While the content is straightforward, the visual presentation is playful, using animated transitions and quirky, conversational language (“We are a team of evolved monkeys…”). There’s a strong embrace of “weird > normal,” which sets a friendly, open creative tone[[1]](https://things.inc/).

4. **Consistent Branding for Collaborative Creation**: All aspects of the site—the product pages, company philosophy, and even the mailing list signup flow—underscore their identity as makers of software for collaborative creation and emergent play. The website functions both as a showcase and as an experience that mirrors their product design[[3]](https://www.nocodesupply.co/item/things-inc)[[2]](https://www.cbinsights.com/company/things-2).

5. **Recognition for Design Excellence**: The website, and particularly their Rooms app, won a 2024 Apple Design Award for Visuals and Graphics, highlighting the innovative and visually compelling user experience they offer – both in their web presence and product design[[2]](https://www.cbinsights.com/company/things-2).

In summary, things.inc is notable for merging a nostalgic computing motif with cutting-edge interactive design. Their website isn’t just a static page – it’s an invitation to experience their philosophy through digital storytelling, interactivity, and creative encouragement. This helps them stand out among other tech startups, whose sites are often much more conventional.

---
1. [Things, Inc.](https://things.inc/)  
2. [Things - Products, Competitors, Financials, Employees, Headquarters ...](https://www.cbinsights.com/company/things-2)  
3. [Things, Inc. [Website] <> No-Code Supply Co.](https://www.nocodesupply.co/item/things-inc)

---

## 2. Kerangka Perbandingan Makro (Konstelasi Identitas)

| Dimensi | things.inc (deskriptif) | zenotika (deskriptif) |
|---------|-------------------------|------------------------|
| Motif Naratif Awal | Boot retro “BIOS” → nostalgia computing | Overlay atmosfer + struktur section lazy; belum ada layer naratif di atas fold berupa simulasi sistem |
| Nada Bahasa | Konsisten, penuh humor eksentrik, intensitas “weird > normal” menyeluruh | Playful pada label navigasi & deskripsi link (prefiks “> …”), tetapi belum merata ke semua section |
| Eksplorasi | Didorong rasa penasaran & emergent play tersirat | Eksplisit via scavenger hunt, visited count, progres numerik |
| Atmosfer | Nostalgia + modular creative space | Kosmik / nebula: gradient, mist, stars, parallax ringan di footer |
| Gamifikasi | Implisit dalam cara konten mendorong eksplorasi | Eksplisit (visited sections, counter, collection/scavenger section) |
| Branding Tekstual | Identitas filososfis dijahit ke setiap alur | Fragmented: filosofi hadir terpisah, tidak menyelimuti seluruh narasi |
| Transisi | Diposisikan sebagai bagian pengalaman (boot, load illusions) | Suspense fallback per section; transisi masih fungsional |
| Visual Layers | Konsistensi sistemik retro + layering hikayat | Layer atmosfer modular (header/footer) + overlay grid di main |
| Theming | Nuansa menyatu dengan motif retro (kesan epok) | Toggle day/night manual memengaruhi kelas & asset sosial |
| Keterlibatan Emosional | Nostalgia + rasa “ruang bermain” kreatif | Discovery + ambient kosmik + enumerasi progres |

---

## 3. Header: Observasi Sangat Terperinci

### 3.1 Struktur Fungsional
- Elemen utama: `<header>` dengan kelas komposit dinamis (`zen-header`, varian: `--dark`, `--light`, `--scrolled`, `--hidden`, `--menu-open`).
- Layer dekoratif internal: `zen-header__atmosphere` + nested gradient/stars/glow — memunculkan identitas atmosfer tanpa retro motif terminal/BIOS.
- Nav container: `zen-header__nav` membagi “left” (menu trigger, logo, quick section links) dan “right” (theme toggle, meta cluster, chips).
- Menu panel (desktop overlay) & aside mobile menu: dua struktur berbeda untuk viewport berbeda.

### 3.2 State & Logika Interaksi
- Scroll state: memantau `window.scrollY`; menentukan visible/hidden (meniru pattern “auto-hide on scroll down”).
- Breadcrumb integration: memproduksi crumbSegments (home, previous, current, step/progress token).
- Progress: visited vs total sections, memunculkan angka padded (00/00) + bar internal di tombol “collection”.
- Focus trap menu: memanipulasi daftar focusable; wrap Tab/Shift+Tab.
- Prefetch intensional: hooking khusus link “Log book” & “Contact” untuk preloading modul berat.

### 3.3 Aksesibilitas
- ARIA states: `aria-expanded`, `role="dialog"` untuk panel, `aria-live="polite"` status section.
- Escape & click-outside untuk menutup menu.
- Mobile breadcrumb teks (“Active section…” / visited count) → memberi ringkasan kontekstual.
- Potential layering: multiple dynamic regions (status, overlay) sudah mengadopsi pola cukup tertib.

### 3.4 Identitas Tekstual & Microcopy
- Pola label: “> step 0 …” konsisten di array link.
- Belum terlihat lapisan tagline dinamis / rotasi microcopy tematik.
- “Things navigator” — frasa tematik bridging; tetapi intensitas narasi belum menembus seluruh sub-elemen (misal status bar tidak menirukan sistem pseudo-terminal).

### 3.5 Atmosfer Visual
- Mengandalkan gradient cosmic + stars + glow; tidak ada motif “scanline”, “CRT phosphor”, atau pseudo boot text.
- Perpindahan day/night effect memengaruhi kelas dan icon, belum melibatkan transisi multi-phase (dawn/dusk) atau modul progres waktu.

### 3.6 Representasi Progres
- Dua bentuk: crumb progress (numeric step) & visited count (X / Y).
- Terpisah dari narasi; tidak dipersonifikasikan (misal tidak ada “module loaded 5/12”).

### 3.7 Distribusi Tanggung Jawab Kode
- `Header.tsx` memegang: state scroll, menu toggling, breadcrumbs, progress metric, a11y trap, theme toggle, PWA chips, prefetch hooking — konvergensi banyak domain dalam satu file (observasi netral).
- Potensial segmentasi (deskriptif): area atmosfer vs area navigasi vs area telemetry vs area theming — saat ini berada di satu lapis.

---

## 4. Main (HomePage dan Section Orchestration) — Observasi Granular

### 4.1 Arsitektur Section
- Susunan: Hero → BootSequenceSection (?) → ScavengerHunt → Portfolio Interaktif → Quote (lazy) → Philosophy → Log Book (lazy) → Footer (lazy).
- Lazy gating diatur via flag `lazyHomeSections`; fallback menampilkan placeholder “Loading …”.
- Tracking section: hook `useSectionTracker` memunculkan activeSection + visited; dipakai untuk breadcrumb & progress.

### 4.2 Latar Visual
- Grid overlay animatif (AnimatedGridOverlay) + “stars-overlay” di page top.
- Scroll progress bar (transform scaleX) di bagian atas — berperan sebagai affordance global.

### 4.3 Gamifikasi
- Scavenger hunt section: “collection”, mengimplikasikan item collectible.
- Progress integrasi ke header (visited count).
- Belum ada narasi evaluatif (misal milestone messages) terdistribusi lintas section; gamifikasi lebih fungsional.

### 4.4 Performa & Loading Persepsi
- Suspense fallback per section memberi chunked emergence (mirip modul loading).
- Prefetch on intent partial (dari header). Fallback copy simple (“Loading {label}…”).
- Belum ada ilusi retro boot penuh di atas fold (fallback terfragmentasi).

### 4.5 Mikro Struktur Naratif
- Hero memulai pengalaman tetapi bukan ritual sistem awal (kontras motif boot sistem di things.inc).
- Pola labeling internal (tidak semua potongan tampil) menunjukkan modul disusun fungsional, bukan storyline berlapis.

### 4.6 Koherensi Theming
- Day/night toggle dari header memengaruhi visual area lain (cloud ikon, gradient); belum disertai transisi temporal multi-phase.
- Section ornamental (parallax / grid) sejalan dengan gaya kosmik.

### 4.7 Aksesibilitas & Motion
- Reduced motion mematikan parallax & animasi berat.
- Scroll snapping/observasi section tidak memaksa user interplay berlebihan.
- Fallback “Loading …” punya role status (sesuai snippet) — komunikasi state asinkron.

---

## 5. Footer — Observasi Mendalam

### 5.1 Struktur Konten
- Kolom: Newsletter form, Navigation groups, Social links card grid, Utility links, Attribution, Cloud decorative layer.
- Newsletter: validasi sederhana (regex email), status success/error ephemeral 6 detik.
- Social links: varian day/night ikon (CDN), tagline ringkas per platform.

### 5.2 Atmosfer & Layering
- Grid rotasi (rotate(8deg)), mist, gradient, stars; intensitas opacity dibedakan day vs night.
- Floating clouds: array metadata (posisi, driftX/Y, durasi) → menambah kesan sinematik.

### 5.3 Interaktivitas Halus
- Hover animasi (translate-y kecil, shadow).
- Parallax container offset berdasarkan posisi viewport (translate3d Y).
- Tagline sosial tidak dinamis berganti (statis per link).

### 5.4 Teks & Nada
- Microcopy newsletter: “Stay up to date … playful release notes…”
- Pesan status form: personal (“You’re on the list!”, “so the Things can find you.”) — sudah cukup tematik.

### 5.5 Aksesibilitas
- Form: `aria-invalid`, `role="status"` untuk feedback.
- Struktur heading terselubung (sr-only) untuk hierarki semantik.

### 5.6 Keterhubungan dengan Header
- Atmosfer estetik konsisten (grid, stars).
- Tidak memantulkan visited progress yang ditampilkan di header (isolasi fungsional).

---

## 6. Dokumentasi & Taksonomi CSS (docs/css.md) — Observasi
- Dokumentasi menekankan kategori: navigasi multi-layer, hero variasi, project card grid, log feed, scavenger gamification, rooms interactive, FAQ, social feed, dsb.
- Beberapa kelas historis (misal `.navigation-bar`, `.menu-panel`, `.menu-overlay`) berbeda terminologi dengan implementasi terbaru (`zen-header__...`, `zen-menu-panel`) menunjukkan proses evolusi / refaktor penamaan.
- Tipologi radius besar, gradient multi-lapis, grid adaptif responsif — konsisten dengan pendekatan “soft modular surfaces”.

---

## 7. Mikro Dimensi Analitis Lintas Komponen

### 7.1 Konsistensi Naratif
- things.inc: narasi mengikat semua area, tone menyatu ke struktur fungsional.
- zenotika: tone muncul spasial (navigasi link label + newsletter copy), tidak menembus layer status (misal progress button messaging masih literal).

### 7.2 Pola Informasi Progres
- Ada dualitas: visited sections (eksplorasi konten) + scavenger hunt (koleksi khusus).
- Belum ada kalibrasi hubungan semantik antar dua domain progres (apakah scavenger items terkait visited ratio?).

### 7.3 Layer Atmosfer
- Header & footer menyajikan definisi atmosfer kuat; main menambahkan overlay tetapi tanpa integrasi dinamika lintas fase (misal intensitas menurun/meningkat sesuai penggal scroll atau waktu lokal).
  
### 7.4 Theming Temporal
- Implementasi: biner (day/night).
- Tidak terlihat varian transisi (dawn/dusk) atau adaptasi otomatis (jam/waktu pengguna).

### 7.5 Microcopy & Lexicon
- Prefiks “> ” pada deskripsi link adalah motif pseudo-terminal ringan.
- Tidak meluas menjadi sistem frase global (status, progres, hint, error) yang konsisten.
  
### 7.6 Struktur Aksesibilitas
- Penggunaan focus trap, ARIA labels, polite live region → baseline kuat.
- Elevator status (“Active section … visited …”) sudah informatif; belum menambahkan narasi tematik di status.

### 7.7 Keringkasan vs Kelimpahan Visual
- Visual kaya (gradient, mist, stars) disertai layout tipografi rapi — mendekati kedewasaan sistem.
- Potensi edge: layering bisa kompetitif dengan keterbacaan jika kontras di varian day dilemahkan (tidak terlihat sample, asumsi sebagai potensi).

### 7.8 Modularitas Kode
- “Header.tsx” memusatkan beberapa dimensi (scroll, progress, theming, PWA, nav).
- Abstraksi sekunder (hooks & modul prefetch) sudah menurunkan sebagian beban, tetapi domain antarmuka & domain telemetry masih bercampur (deskriptif).

### 7.9 Aspek Gamifikasi
- Eksplisit (counter) berbeda dari pendekatan implisit things.inc — memunculkan kesan sistem instrumentasi (metrik) vs “creative discovery” naratif.

---

## 8. Peluang (Didata Secara Deskriptif, Tanpa Instruksi Implementasi Langsung)

Berikut enumerasi “bidang peluang” (opportunity space) yang tampak secara tematik dan struktural:

### 8.1 Narative Envelope / Ritual Awal
Bidang peluang untuk menambahkan lapisan pembuka terkoherensi (ritual / pseudo sistem) sehingga layering atmosfer bukan hanya visual, melainkan juga naratif (serupa motif boot retro yang dikutip).

### 8.2 Integrasi Progres & Narasi
Bidang peluang menyatukan visited sections + scavenger hunt menjadi narasi progres tunggal (misal menampilkan framing konseptual lama “module / artifact discovery” daripada dua entitas terpisah).

### 8.3 Ekspansi Microcopy Konsisten
Bidang peluang untuk menginterlink label nav, status aria-live, pesan form, progressive disclosure (hint/hints) menjadi kamus naratif terpadu (tone ≈ label playful saat ini, diperluas secara seragam).

### 8.4 Atmosfer Multi-Phase
Bidang peluang menambahkan fase tematik (dawn/dusk) untuk memperkuat rasa “living system” di luar toggling biner.

### 8.5 Lapisan Terminal / System Feedback
Bidang peluang memberi konsistensi gaya pseudo-terminal pada elemen status (progress bar, visited count, newsletter success/error) agar sejalur dengan motif deskriptif retro-playful yang dikutip.

### 8.6 Konsolidasi Indikator Progres
Bidang peluang memvisualkan progres terpadu (visited + collected) dalam satu sistem representasi (dalam batas narasi, bukan instruksi implementasi).

### 8.7 Dinamisasi Sosial & Footer
Bidang peluang memperluas bagian sosial/komunitas menjadi surface living (rotasi tagline, ephemeral highlight) agar footer lebih dari sekadar terminus — menjadi gateway komunitas.

### 8.8 Orkestrasi Section
Bidang peluang memformalkan event internal (enter/exit section) menjadi konsep storyline (bukan sekadar telemetri user scroll) demi menambah immersive continuity.

### 8.9 Visual Phase Interlocked
Bidang peluang menjadikan intensitas grid, mist, stars adaptif terhadap progres halaman atau waktu sehingga layering atmosfer mendapat dimensi semantik (fase eksplorasi meningkat → intensitas berubah).

### 8.10 Keseragaman Aksesibilitas + Narasi
Bidang peluang meng-inject nada playful juga ke jalur a11y (aria-labels naratif yang masih bermakna) tanpa mengorbankan kejelasan.

### 8.11 Asset Konsolidasi
Bidang peluang menyelaraskan sumber icon day/night & brand (mengurangi ketergantungan asset eksternal) agar identitas merasa “self-contained”.

### 8.12 Variasi Feedback Form
Bidang peluang memetakan error/success state newsletter ke narasi sistem (tanpa kehilangan pesan literal) membantu memperluas konsepsi “system atmosphere > form”.

### 8.13 Keterbacaan & Layer Komposisi
Bidang peluang mengkalibrasi ambience (glow/mist density vs text contrast) pada kondisi tema terang untuk memastikan fidelity tipografi terjaga dalam semua fase.

### 8.14 Konsistensi Penamaan & Dokumentasi
Bidang peluang menyelaraskan naming historis (“navigation-bar”, “menu-panel”) dengan naming aktual “zen-header__…” demi mengurangi debt kognitif di dokumentasi.

### 8.15 Telemetri Pengalaman
Bidang peluang menyandingkan metrik internal (progress) dengan micro-narrative line sehingga angka tidak berdiri sendiri.

---

## 9. Tabel Pemetaaan Peluang per Lapisan

| Lapisan | Kondisi Teramati | Peluang Deskriptif |
|---------|------------------|--------------------|
| Header Atmosfer | Gradient + stars + glow | Menjadikan atmosfer responsif terhadap fase/ritual naratif |
| Navigation Structure | Group Navigate / Our Things | Memperluas ke sense “system modules / creative zones” |
| Progress Indicators | Dual (visited, scavenger) | Penyatuan naratif tunggal (eksplorasi artefak) |
| Microcopy | Lokal (link description) | Merata ke status, feedback, aria-live |
| Theming | Day/night toggle | Multi-phase temporal (dawn/dusk) + integrasi naratif waktu |
| Footer Atmosfer | Grid rotasi + clouds | Dinamis intensitas berdasarkan interaksi / waktu |
| Footer Content | Static tagline sosial | Variasi/rotasi kontekstual (komunitas hidup) |
| Section Lifecycle | Tracking fungsional | Storyline event (penahapan “module loaded”) |
| A11y Messaging | Jelas, literal | Narasi sistem + tetap accessible |
| Visual Balance | Layer dekor + text | Penyesuaian adaptif (kontras/ densitas) |
| Asset Sourcing | Ikon sosial via URL eksternal | Self-contained identitas (konsistensi availability) |
| Form Feedback | Pesan playful lokal | Integrasi ke narasi sistem global |
| Documentation | Legacy vs refaktor | Harmonisasi taksonomi & penamaan |
| Gamifikasi | Angka eksplisit | Pengayaan metafora (eksplorasi kreatif) |

---

## 10. Distilasi Diferensiasi Saat Ini
- zenotika telah memajukan gamifikasi eksplisit (visited/collection) yang tidak tampak di deskripsi things.inc; hal ini bisa menjadi pembeda kuat bila disatukan dengan narasi retro/terminal.
- Layer atmosfer kosmik memberi identitas unik dibanding motif murni retro computing; potensi bridging di antara dua definisi metafor (cosmic system + creative bios) masih terbuka.
- Basis a11y & fallback modular sudah menjadi pondasi untuk ekspansi naratif tanpa memicu debt besar.

---

## 11. Fokus Domain untuk Penguatan “Feel Keseluruhan”
(Disampaikan tetap deskriptif, bukan instruksi implementasi.)
1. Narasi menyatu lintas header–section–footer.
2. Konsistensi voice microcopy multi-surface.
3. Sinkronisasi progres & metafora (eksplorasi = discovery kreatif).
4. Atmosfer adaptif (fase, waktu, progres).
5. Integrasi status sistem (pseudo-system messages) tanpa mengurangi aksesibilitas.

---

## 12. Rekap Singkat
- Karakter unik things.inc (berdasar kutipan) terletak pada konkatenasi retro computing + playful emergent creativity.
- zenotika saat ini sudah kuat di atmosfer kosmik, gamifikasi eksplisit, modularitas lazy sections, dan baseline aksesibilitas.
- Peluang terbesar berada pada penyatuan narasi & progres, ekspansi microcopy sistemik, multi-phase theming, dan internalisasi narasi sistem ke elemen status.

---

Jika diperlukan versi fokus tunggal (misal “hanya peluang di Footer” atau “hanya analisis progress system”), atau ingin seluruh enumerasi peluang dipetakan ke kategori prioritas kuantitatif, sila sampaikan. Saya dapat lanjutkan dalam format lanjutan yang Anda inginkan.

---

## 13. Addendum Pembaruan Implementasi (2025-10-08)
Status terbaru setelah perubahan kode (ref: commit lokal – ekstraksi hunt items & unified progress hook). Bagian ini menandai realisasi sebagian peluang yang sebelumnya bersifat prospektif.

### 13.1 Ringkas Perubahan Kode
- Ekstraksi data scavenger hunt ke modul pusat: `src/data/huntItems.ts` (mengurangi coupling dengan `HomePage.tsx`).
- Penambahan hook baru: `useUnifiedProgress` yang menggabungkan dua domain progres: eksplorasi section (visited) + koleksi relic (hunt).
- Header sekarang:
	- Memanggil `useUnifiedProgress` untuk menghitung `explorationPercent`, `collectionPercent`, dan `completion` (rata‑rata sederhana tahap awal).
	- Mengganti aria-live status menjadi narasi terpadu: `Exploration XX/YY · Relics AA/BB · System CC%`.
	- Tooltip (title) pada tombol progress menampilkan ringkasan kombinasi sections + relics.
- Scavenger Hunt Section sekarang mem-broadcast event kustom `zen:hunt-progress` setiap perubahan—memungkinkan sinkronisasi progres lintas komponen tanpa prop drilling tambahan.
- Penyimpanan progres masih via `localStorage` (kunci: `zenotika-hunt-progress`) dengan fallback initial collected berdasarkan properti `initiallyCollected`.

### 13.2 Dampak terhadap Peluang (Mapping OPP)
| Kode | Judul | Status Implementasi | Catatan Lanjutan |
|------|-------|---------------------|------------------|
| OPP-8.2 | Integrasi Progres & Narasi | PARTIAL | Sudah ada model gabungan + status line; belum ada weighting adaptif atau storyline milestone. |
| OPP-8.6 | Konsolidasi Indikator Progres | PARTIAL | Visual bar masih menampilkan eksplorasi saja; opsi: dual-bar, segmented, atau overlay meter tunggal. |
| OPP-8.5 | Terminal / System Feedback Layer | BELUM | Narasi sudah lebih ringkas, tetapi belum memakai gaya pseudo-terminal penuh (prefix `SYS>` / animasi prompt). |
| OPP-8.3 | Ekspansi Microcopy Sistemik | PARTIAL | Header status diperluas; form feedback & aria status lain belum dinarasikan uniform. |
| OPP-8.10 | A11y + Narasi Sinkron | PARTIAL | Status line accessible; perlu audit istilah & mungkin mode verbose untuk screen reader. |
| OPP-8.14 | Harmonisasi Penamaan | BELUM | Dokumentasi fokus belum diperbarui untuk menandai sumber baru `huntItems.ts`; section ini melakukannya. |

### 13.3 Model Data Progres (Snapshot)
```
UnifiedProgressResult {
	visitedCount: number;          // jumlah section pernah dilihat
	totalSections: number;         // total section terdaftar dalam breadcrumb
	collectedCount: number;        // jumlah relic terkumpul (Set size)
	totalCollectibles: number;     // panjang HUNT_ITEMS
	explorationPercent: number;    // 0..100 (float)
	collectionPercent: number;     // 0..100 (float)
	completion: number;            // Math.round((explorationPercent + collectionPercent)/2)
	statusLine: string;            // Narasi ringkas terformat
}
```

### 13.4 Jalur Evolusi yang Disarankan (Iterasi Berikut)
1. Ganti `completion` dengan skema berbobot (misal eksplorasi 60%, koleksi 40%) atau fase adaptif (pre-50% eksplorasi > koleksi, sebaliknya setelah threshold).
2. Tambahkan milestone event (CustomEvent `zen:progress-milestone`) untuk 25/50/75/100% guna memicu microcopy episodik.
3. Visual: implementasi bar tersegmentasi (exploration vs relic) atau stacked micro-bar agar pengguna memahami komposisi tanpa membaca tooltip.
4. Terminal Layer: gaya prompt `SYS>` + animasi type-in (respect prefers-reduced-motion) untuk `zen-header__status`.
5. A11y variant: jika user mengaktifkan reduce motion atau high contrast, fallback status line lebih literal (hilangkan separator simbol).
6. Persist unified snapshot (cache JSON) agar hook lain bisa melakukan analitik ringan tanpa re-derive.

### 13.5 Risiko / Konsiderasi
- Event Storming: terlalu banyak CustomEvent bisa menambah noise; batasi ke perubahan state material (debounce?).
- Penggabungan persentase rata-rata bisa menimbulkan interpretasi keliru (misal 100% relic + 0% exploration = 50% “System”). Perlu tooltip edukatif atau weighting jelas.
- Aksesibilitas: Status line multi-separator perlu diuji dengan pembaca layar (NVDA/JAWS) untuk memastikan tidak dibaca sebagai string datar yang membingungkan.

### 13.6 Checklist Singkat untuk Iterasi Berikut (Opsional)
- [ ] Weighted completion formula
- [ ] Segmented progress bar UI
- [ ] Milestone narrative events
- [ ] Terminal-styled status (progressive enhancement)
- [ ] A11y variant status line
- [ ] Test unit hook (exploration vs collection cases)

---