Berikut “terjemahan” idiomatik lengkap dan mendalam dari isi file CSS yang Anda lampirkan (pasted2.txt). Saya tidak menerjemahkan baris demi baris secara literal (karena itu tidak terlalu membantu secara praktis), melainkan memetakan arsitektur sistem gaya, maksud fungsional tiap kelompok kelas, pola desain, dan implikasi pengelolaan / refaktor. Anggap ini sebagai dokumentasi rekayasa front‑end berbahasa Indonesia untuk tim.

---

## 1. Gambaran Umum

File ini adalah gabungan antara:
1. Reset & normalisasi (basis Webflow + sedikit modifikasi).
2. Paket gaya bawaan Webflow (prefiks `.w-...`): form, grid 12 kolom, lightbox, slider, dropdown, tabs, rich text, widget sosial, background video.
3. Sistem tipografi kustom menggunakan font keluarga Roobert & RoobertMono.
4. Design token via variabel CSS di `:root` (tema siang/malam, warna brand, warna status success/error/warning, gradien, offset animasi).
5. Koleksi besar utility classes (spacing generik, max-width, overflow, z-index, text-weight, alignment, pointer events).
6. Komponen kompleks bertema produk/brand:
   - Navigasi adaptive + breadcrumb bertumpuk dinamis
   - Hero (home, about, rooms, bot, contact, log book)
   - Toggle mode day/night (dengan scene layer & animasi offset)
   - Kartu proyek / project showcase
   - Sistem blog/log: featured dan non-featured, hover overlay, layout grid responsif
   - Sistem “collection / scavenger hunt” (gamifikasi, progress bar, collectible item states)
   - Halaman “Rooms” dengan animasi scrolling (parallax / staged sticky + anotasi)
   - Panel CTA multi-kolom (gradient brand)
   - Halaman “Bot” (produk) dengan panel video, CTA, badge & layout besar
   - Social feed aggregator (grid kolom vertikal)
   - FAQ accordion
   - Contact form panel berlapis (UI panel dalam panel)
   - Preloader, 404 “playful” & draggable UI (mini sandbox interaktif)
   - Slider Splide (kustomisasi track, arrow, progress)
7. Responsiveness di tiga breakpoint: 991px, 767px, 479px dengan pendekatan “agresif” (re-layout, sembunyikan state hover, ubah ukuran masif).
8. Strategi state visual dengan kelas modifier `.is-*`, `.hide-*`, `.reveal`, `.hover-state`, `.is-hover-style`.

Filosofi desainnya: brand playful + retro-futuristik (warna kontras tinggi; gradient pelangi; kartu bulat besar) dipadukan dengan interaksi kaya (animasi room, kumpulkan item, motif awan/bintang). Pendekatan Webflow memunculkan banyak kelas deklaratif.

---

## 2. Reset & Base Webflow

Bagian awal hingga kumpulan `.w-*`:
- Mengatur display HTML5 elements (article, aside, dsb.) → block.
- Normalisasi input, button, table, media (audio/video).
- Menghapus margin default (body), border image, outline hover anchor.
- Mendefinisikan sistem grid Webflow ( `.w-container`, `.w-row`, `.w-col-1..12` ) dengan float berdasarkan lebar persentase.
- Memasang font ikon Webflow (`@font-face webflow-icons`) dan pseudo `content` untuk ikon slider / nav / file upload.
- Komponen bawaan: lightbox (`.w-lightbox-*`), slider (`.w-slider-*`), dropdown (`.w-dropdown-*`), tabs (`.w-tabs-*`), rich text (`.w-richtext`), file upload, custom radio/checkbox redirect styling.

Intinya: menyediakan fondasi out-of-the-box agar builder Webflow bekerja konsisten. Anda dapat menganggap blok ini sebagai “vendor layer”.

---

## 3. Tipografi & Skala Heading

Kustom override setelah base:
- Heading (h1–h6) diberi ukuran default Webflow (38px → 12px menurun) lalu ditimpa style kustom besar:
  - h1 utama situs: 6rem (turun progresif di breakpoint)
  - Varian heading sistem: `.heading-style-h1/h2/h3/h4/h5/h6` + varian konten (log, job posting, featured log).
- Paragraf default: `font-size: 1.1rem` (lebih besar dari 14px base Webflow).
- `.text-rich-text` & `.text-rich-text-job-posting`: mengontrol ritme vertical (margin heading, list, blockquote) + line-height khusus (1.9 untuk paragraf).
- Bobot font utilities: `.text-weight-light (300)`, `.normal (400)`, `.medium (500)`, `.semibold (600)`, `.bold (700)`, `.xbold (800)`.

Penggunaan varian ganda (native tag + class “heading-style”) memudahkan: 
- heading semantik (SEO) tetap → styling diseragamkan lewat utility.

---

## 4. Design Tokens & Variabel Tema

Di `:root` terdapat puluhan variabel dengan pola:
- `--color--*` / `--background-color--*` / `--text-color--*` / `--border-color--*`
- Prefiks `--dark--` versi mode malam (bukan sekadar dark = gelap, tapi “versi alternate”).
- Warna brand dasar: `--base-color-brand--blue`, `--base-color-brand--pink`.
- Warna sistem status: success/error/warning + versi dark.
- Tema day/night:
  - Gradien: `--color--switch-background-gradient-*`, `--color--footer-gradient-*`, `--color--cta-panel-gradient-*`, `--color--404-gradient-*`.
  - Offset animasi: `--color--scene-offset-day/night` untuk memindahkan layer grafis di toggle.
- Komponen spesifik:
  - `--rooms-card-border-radius`, `--bot-project-card-border`, `--rooms-project-card-border-padding`.
  - Warna slider track, copy button, highlight checkbox.
  - Font boolean detection (fallback sistem jika variabel berbeda).
- Elemen dynamic collection / navigation UI.

Catatan penting:
- Ada variabel yang masih memuat sisa metadata impor Webflow (misal `<deleted|variable-...>`). Secara teknis ini masih valid di runtime, tapi secara kebersihan sebaiknya di-“rename” manual jika keluar dari ekosistem Webflow.
- Struktur token ini sudah siap untuk diangkat menjadi “Design System layer” (misal migrasi ke CSS Modules / Tailwind config / tokens JSON).

---

## 5. Pola Penamaan Kelas

Karakter & konsistensi:
- Utility generik memakai format `margin-*`, `padding-*`, `max-width-*`, `text-weight-*`, `overflow-*`.
- Modifier state: `.is-hover-style`, `.is-featured`, `.is-default-style`, `.is-hover-state`, `.is-night-open`, `.hide-*`, `.reveal`, `.collection-complete`, `.background-*`.
- Komponen domain:
  - Navigasi: `nav_*`, `navigation-bar`, `menu-*`, `toggle-*`, `breadcrumb-*`.
  - Blog/log: `log-book-*`, `featured-log_*`, `log-title-wrap`.
  - Project: `project-card*`, `design-award-badge`, `project-square`.
  - Gamifikasi: `collection-*`, `scavanger-*`, `hunt-item-*`.
  - Rooms: `rooms-hero_*`, `animated-room-*`, `annotation-*`, `train-animation-*`.
  - Bot: `bot-hero_*`, `bot-page-*`, `vision-pro-button`, `bot-cta-*`.
  - CTA: `cta-panel`, `cta-cell-inner`.
  - Social: `social-feed-*`, `social-card`, `footer-social-*`.
  - Preloader: `preloader-*`, `loading-*`, `typewriter-*`.
- Kombinasi paradigma: campuran BEM long-form (block_modifier) + atomic/utility + state ephemeral.

Implikasi:
- Mudah ditebak fungsinya, tetapi volume besar → risiko “class bloat” & kesulitan konsolidasi jangka panjang.
- Banyak kelas multi-peran (layout + color + spacing dalam satu): sulit untuk tema alternatif granular tanpa duplicating.

---

## 6. Utility & Spacing System

Skala spacing eksplisit:
- Margin & Padding: `tiny (.125rem)` → `xxhuge (12rem)` + custom1/2/3 (1.5, 2.5, 3.5) dan “0”.
- Section spacing: `.padding-section-small/medium/large`.
- Arah khusus: `.margin-horizontal`, `.padding-vertical`, etc. (meniadakan sisi lain = memaksa kebersihan).
- Spacer “kosong” untuk styleguide visual: `.spacer-[size]` memanfaatkan `padding-top` persen sebagai pengukur ritme.

Kritik & saran:
- Redundansi tinggi (banyak definisi margin/padding di-breakpoint diulang identik).
- Bisa diformalisasi jadi scale token: `--space-1 … --space-10` → kurangi ratusan deklarasi.
- Utility sudah efektif untuk prototyping cepat di Webflow, tapi di refaktor lebih baik group ke layer terpisah agar minifikasi maksimal.

---

## 7. Komponen Utama (Per Domain)

### 7.1 Navigasi & Breadcrumb
- Struktur multi-layer:
  - `.navigation-bar` kontainer utama (fixed pada wrapper `.navigation-wrapper`).
  - Toggle hamburger: `.menu-trigger-wrap` (dengan varian open/close, night, hover).
  - Breadcrumb sistem unik: `.button.breadcrumb` + kapas ( `.menu-cap`, `.breadcrumb-panel-background` ) meniru “capsule stack”.
  - Panel menu overlay: `.menu-overlay` (default transform -100%), `.menu-panel` (panel geser), `.menu-panel-inner` (scroll container).
  - Dynamic states mobile vs desktop: banyak elemen disembunyikan di <=991 / <=767 / <=479 untuk menyederhanakan interaksi.
- Fitur toggling day/night dipadukan di area nav: `.toggle_wrap`, `.toggle_inner`, `.scene-image.day/night`, `--color--toggle-offset` menggeser knob.

Nilai desain: menonjolkan identitas brand melalui bentuk kapsul, multi-layer depth (z-index tinggi 5000).

### 7.2 Hero & Visual Atmosfer
- `.section_hero` + varian `.home-hero`, `.rooms-hero`, `.bot-hero`, `.contact-hero`.
- Aset awan & bintang: `.floating-cloud*`, `.stars-overlay.*` (dipertukarkan lewat opacity + conditional kelas hide).
- Logo besar & meta text: `.home-logo-wrap`, `.hero-title`, `.hero-meta-text`.
- Scroll prompt bulat: `.scroll-prompt` (disembunyikan di mobile).
- Gradien background adaptif: `.background-day-gradient`, `.background-night-gradient`.
- “Scene toggle” day/night dalam switch komponen (SVG / PNG).

### 7.3 Project Cards
- Kelas inti: `.project-card` (varian `main`, `coming-soon`, `bot`).
- Border adaptif & rounding besar (44px → 3.14rem).
- Struktur internal:
  - `.project-card_image-wrap` (image overflow outward 250% width untuk komposisi visual).
  - `.project-card-title-wrap` layering default & hover (hover state ditiadakan di mobile).
  - `.design-award-badge` + gradient border `.gradient-border`.
  - `.project-square` (ikon / app icon).
- Responsif:
  - Desktop: grid `1fr .7fr`.
  - Mobile: single column, tinggi ditetapkan vw/explicit adjusting, hilangkan hover overlay.

### 7.4 Blog / Log System
- Grid feed: `.log-book-grid` (5 kolom → 2 → 1).
- Item:
  - `.log-book-item_image` (radius 30px).
  - Metadata strip: `.log-book-item_data` (opacity adaptif).
  - Featured: `.featured-log-item` (besar sekali: 58rem height di desktop).
  - Overlay judul: `.featured-log-item_title` ganda (default vs hover).
- Single log page:
  - Wrapping card: `.page-content_wrap.log-inner` + `.lift-up-wrap` memberikan efek kartu terangkat (shadow).
  - Artikel container: `.log-article-wrap` width 75ch (tipografi readability).
- Mobile menghapus overlay interaktif (hover) demi kesederhanaan.

### 7.5 Collection / Scavenger Hunt Gamifikasi
- Kontainer: `.collection-panel` + varian `unlock-panel`.
- Progress: `.collection-progress-container` + `.collection-progress-bar` (width dianimasi).
- Grid item: `.collection-item-panel` berisi `scavanger-item-card`, latar `undiscovered-item-bg`, state: `.scavanger-item-container.is-collected` memperbesar item.
- Title & indicator: `.scavanger-card-title`, “question mark” overlay (day/night).
- Panel text & angka ganda untuk day/night ( `.collection-count-numbers.light/dark` ) dengan manipulasi opacity.
- Mobile banyak penyusutan tinggi & scroll internal (grid menjadi 2 kolom tinggi tetap).

### 7.6 Rooms Interactive + Animasi Scroll
- Struktur kayu:
  - `.animated-room-track` tinggi 500vh (desktop) / 300vh (mobile) → membuat efek “journey” sticky.
  - `.animated-room-stage` sticky viewport 100vh.
  - Di dalamnya `.animated-room-container` (44vw / 60rem max) berisi layer `.room-image.*` (z-index staging).
  - Anotasi: `.annotation-track` grid overlay, `.annotation-block` kartu teks.
- Elemen hunt item (key, gem, coin, chick, book, crab) ditempatkan absolute → integrasi gamifikasi ke perjalanan scroll.
- Train animation: `.train-animation-container` + `.train-animation-track` translasi besar ( -50rem dsb.).
- Responsive:
  - Skala container diturunkan (40rem → 70vw → 90vw) agar tetap proporsional di layar kecil.
  - Height track dikurangi untuk menghindari scroll terlalu panjang di mobile.

### 7.7 Bot Product Page
- Panel & hero: `.bot-hero_panel` (grid auto 3 blok), judul besar `.bot-page-title`.
- Video container: `.bot-hero-video` (tinggi 50rem → 30rem → 60vw).
- Seksi highlight video lanjutan: `.bot-page-video-*` dengan border tebal `.7rem`.
- CTA: `.vision-pro-button`, `.bot-app-cta`, `.bot-cta-panel`, `.bot-cta-image`.
- Menonjolkan brand color & gradient (cta-panel gradient reuse).
- Responsif: satu kolom, padding lebih kecil, hilangkan hover alt.

### 7.8 CTA Panels
- `.cta-panel` grid 2 kolom (→ 1 kolom di tablet/mobile).
- Isi: `.cta-cell-inner` (radius 1.65rem → mengecil), `.cta-title` (3.75rem → turun ke vw-based scaling).
- Kombinasi device visual (desktop + phone) dengan frame border adaptif.

### 7.9 Social Feed
- `.social-feed-inner` grid 6 kolom → pada mobile diubah menjadi satu kolom “stack” (grid disubstitusi flex kolom).
- Kartu `.social-card` warna dasar putih (kontras terhadap tema gelap global).
- Elemen profil: `.social_person`, `.social-platform`.
- Tujuan: menampilkan posting multi-sumber (ikon platform + teks + gambar optional).

### 7.10 FAQ Accordion
- `.faq-item` panel interaktif; jawaban ada di `.answer-wrap` dengan transisi `max-height` + margin top.
- Dot indikator `.faq-dot` membesar saat expand (transisi width/height).
- daftar `.faq-list`, wrapper `.faq-list-wrapper`.

### 7.11 Forms
- General form: `.form_component`, `.form_input`, `.form-input-block`.
- Contact form: `.contact-form-panel` panel luar; `.contact-form` grid 2 kolom → 1 kolom di tablet/mobile.
- Input styling:
  - background semi transparan (#ffffff80) di `.text-input`.
  - Label `field-label` ukuran 1.14rem.
- Submit button varian: `.submit-button.footer-submit`, `.submit-button.in-form`.

### 7.12 Slider (Splide)
- Container `.splide`, track `.splide__track`, list `.splide__list`, slide `.splide__slide`.
- Progress bar: `.my-slider-progress`.
- Arrows kustom: `.splide__arrows`, `.splide__arrow` (radius .8rem, adaptif di mobile reposition).
- Story variant slider: `.story-slide`, `.story-heading-wrapper.conditional` overlay dynamic.

### 7.13 Preloader & Typewriter
- `.preloader-wrap` (hidden by default), `.loading-bar-bar` (progress width incremental), `.typewriter-container` plus `.typewriter-text`.
- Menerapkan overlay blending gradient + mix-blend untuk efek visual dramatik.

### 7.14 Draggable Items & 404
- Draggable: `.draggable-item` + subclass `hour-glass`, `discovery`, `finding-page`. Border tebal dan radius tinggi—memberi nuansa panel retro.
- 404: `._404-text` (ukuran super besar 24rem → 6rem mobile), gradient overlay, drag items menambah interaktivitas.

---

## 8. Sistem Tema Day vs Night

Cara kerja:
- Dua set variabel (`--color--*` vs `--dark--*`).
- Kelas seperti `.background-day-gradient`, `.background-night-gradient`, `.scene-image.day/night`, `.hero-cloud.day-hero-cloud`, `.hero-cloud.night-hero-cloud` menukar opasitas/posisi untuk transisi mode.
- Toggle menyesuaikan `--color--toggle-offset` memindahkan knob `.toggle_inner`.
- Elemen dinamis (logo, cloud, folder, pnf image, hero logo) duplikasi versi siang/malam (stack absolute + transisi opacity).

Implikasi optimasi:
- Dapat diformalisasi menjadi `[data-theme="light"]` / `[data-theme="dark"]` untuk meminimalkan jumlah kelas state manual.
- Potensi menambah preferensi `@media (prefers-color-scheme: dark)` sebagai default.

---

## 9. Responsive Strategy

Breakpoint:
1. `max-width: 991px` (Tablet)
   - Mengurangi ukuran heading (h1 6rem → 5rem).
   - Banyak panel mengubah grid 2 kolom → 1 kolom (project grid, hero grid, rooms hero panel).
   - Hover states dihapus ( `.is-hover-style` ditiadakan).
   - Mengurangi border radius besar (58rem → ~24–30rem).
2. `max-width: 767px` (Mobile Landscape)
   - Skala heading turun lagi (h1: 4–5rem → 4rem).
   - Tinggi hero adaptif, beberapa animasi diformat (train track translate dikurangi).
   - Kartu collec / scavanger grid jadi 2 kolom scrollable vs 3.
   - Project card padding drastis menyusut (.64rem → .214rem).
3. `max-width: 479px` (Mobile Portrait)
   - Skala typografi intens turun (h1 3rem).
   - Komponen besar (rooms hero grid) dijadikan block dan di-“translate” offset (20rem) untuk staging animasi.
   - Animasi room track height dikurangi 500vh → 300vh.
   - CTA & tombol-tombol diringkas ukuran (tinggi 5rem → 4.28rem → 4rem).
   - Interaksi hiasan (scroll prompt, hover overlay) dihilangkan.

Karakter:
- Pendekatan “progressive simplification”: di layar kecil, fungsi > dekorasi.
- Beberapa transform besar (translate/scale) di mobile berpotensi overhead reflow—baik jika dikendalikan via intersection observers (tidak terlihat di CSS, asumsi di JS).

---

## 10. State & Interaksi

Pola state:
- `.is-hover-style`, `.hover-state`: overlay yang aktif di pointer devices (desktop). Di mobile diset `display: none`.
- `.reveal` menyalakan panel (ex: menu, collection block).
- `.hide`, `.hidden-*` menonaktifkan elemen.
- `.is-night-open`, `.is-close` menandai status toggle navigasi/menu.
- `.is-featured`, `.is-default-style` memisahkan baseline vs varian (kartu blog & project).
- `.opacity 0` + absolute stacking → transisi di-handle JS (tidak ada keyframe di sini).
- `.w--current` Webflow menandai link halaman aktif (breadcrumb, nav link).
- `.w--redirected-checked/focus` state injection Webflow (custom checkbox/radio di-augment melalui runtime script).

---

## 11. Aksesibilitas & Potensi Peningkatan

Hal+:
- Font size besar di desktop → legibility tinggi.
- Kontras utama (#cbcfff di atas #0f0e16) memadai.
Risiko / ruang perbaikan:
- Banyak outline fokus dihapus ( `outline: 0;` ) → keyboard navigation suffer. Perlu gaya `:focus-visible`.
- Interaksi hover digunakan untuk mengungkap konten; di mobile hilang → pastikan informasi tetap tersedia.
- Elemen dekor absolute (cloud, stars) sebaiknya `aria-hidden="true"`.
- Gamifikasi scavenger: item clickable harus punya text alternatif (ARIA label).
- Preloader (jika aktif) jangan mengunci fokus / screen reader tanpa skip.

---

## 12. Kinerja & Optimasi Teknis

Beban:
- Ribuan aturan → ukuran CSS besar (perlu minifikasi + purge unused).
- Banyak gambar background repetitif (stars, clouds, hero) → caching & format modern (AVIF/WEBP sudah sebagian).
- Layer absolute + transform bisa berdampak pada compositing GPU (positif) tapi hindari memicu reflow besar saat scroll (pastikan gunakan will-change minimal).
- Animasi scroll 500vh + sticky stage: cek performa di perangkat mid-tier.

Rekomendasi:
- Consolidate spacing utilities via CSS custom properties.
- Pertimbangkan container queries untuk menghindari beberapa breakpoints luas.
- Tambah `prefers-reduced-motion: reduce` untuk mematikan animasi room/train/hover layering.
- Implement critical CSS extraction (render above-the-fold hero + nav dulu; load sisanya async).

---

## 13. Kualitas Arsitektur / Rekomendasi Refaktor

| Area | Observasi | Rekomendasi |
|------|-----------|-------------|
| Redundansi Spacing | Banyak definisi margin/padding repeated per breakpoint | Tokenisasi: `--space-xxs..--space-xxl` + utility generik |
| State Hover vs Mobile | Duplikasi DOM (default + hover) | Gunakan single element + CSS :hover + data attribute fallback |
| Variabel “raw” Webflow (deleted|variable-*) | Tidak ramah dibaca manusia | Mapping ulang nama → tokens semantik (ex: `--color-brand-blue`) |
| Banyak absolute layer | Potensi konflik stacking | Standarisasi z-index scale (ex: 0,10,20,50,100) documented |
| Responsif kaku (px/rem campuran) | Beberapa layout sulit fluid | Adopsi clamp() untuk font & padding adaptif |
| Aksesibilitas fokus | Outline dihapus | Tambah `.focus-ring` & global `:focus-visible` |
| Gamifikasi & Animasi berat | Tidak ada degrade mode | Tambah class `.reduced-motion` bila user OS prefer reduce |
| CSS Panjang monolitik | Sulit dipelihara | Modular: base.css, utilities.css, components/*.css, pages/*.css |
| Penggunaan warna langsung (#f177a4, dsb.) | Kadang tidak pakai var | Normalisasi ke design tokens untuk brand agility |

---

## 14. “Terjemahan” Kelompok Kelas → Bahasa Fungsional

| Prefiks / Pola | Makna Idiomatik |
|----------------|-----------------|
| `.nav_*`, `.navigation-*`, `.menu-*`, `.breadcrumb-*` | Sistem navigasi utama & menu geser + struktur kapsul breadcrumb bertumpuk |
| `.toggle_*`, `.scene-image.*`, `.stars-overlay`, `.hero-cloud` | Mekanisme tema siang/malam & layer atmosfer visual |
| `.section.*`, `.hero_*`, `.inner-hero-grid` | Struktur blok halaman utama (hero multi-halaman) |
| `.project-card*`, `.design-award-*` | Showcase proyek / produk dengan badge penghargaan & animasi hover |
| `.log-*`, `.featured-log_*` | Modul blog/log: feed, kartu featured, halaman per artikel |
| `.collection-*`, `.scavanger-*`, `.hunt-*` | Sistem koleksi & berburu item (progress + state discovered) |
| `.rooms-*`, `.animated-room-*`, `.annotation-*`, `.train-*` | Halaman “Rooms” naratif / interaktif scroll panjang |
| `.bot-*`, `.vision-pro-button` | Halaman produk “Bot” + konten video dan CTA |
| `.cta-panel*` | Panel ajakan tindak (call-to-action) multi-kolom bergaya gradient |
| `.social-*` | Feed sosial & kartu posting platform |
| `.faq-*` | Accordion Q&A berbasis transisi tinggi |
| `.contact-*`, `.form_*`, `.text-input`, `.field-label` | Form input & panel kontak multi-layer |
| `.splide*`, `.my-slider-progress` | Slider (library Splide) + navigasi custom |
| `.preloader-*`, `.loading-*`, `.typewriter-*` | Layar pre-load & animasi ketik |
| `.draggable-*`, `.floating-folder` | Elemen bebas geser (mini sandbox interaktif) |
| `.utility-*`, `.fs-styleguide_*`, `.spacing-*` | Kelas styleguide & utilitas layout internal |
| `.button*`, `.gradient-button*`, `.vision-pro-button` | Ragam tombol (size, ikon, gradient, breadcrumb, app store) |

---

## 15. Jalur Refaktor Strategis (Jika Keluar dari Webflow)

1. Ekstrak token: buat file `tokens.css` atau JSON (untuk konsumsi lintas platform).
2. Kelompokkan modul:
   - base/reset
   - utilities (spacing, typography helpers)
   - components (nav, button, card, form, slider, log, project, collection, rooms)
   - pages (rooms, bot, about, 404).
3. Otomatiskan purge (PurgeCSS / LightningCSS) dengan whitelist class dinamis (`is-hover-style`, `reveal`, dsb.).
4. Tambah lapisan theming:
   - `[data-theme="light"]` / `[data-theme="dark"]` menimpa subset variabel.
5. Introduksi semantic layer untuk spacing via CSS `@property` atau Tailwind config bila migrasi.
6. Masukkan A11y pass: audit keyboard, screen reader, fokus.
7. Inline critical CSS (nav + hero + fold pertama) → sisanya defer.

---

## 16. Nilai Bisnis & UX

| Fitur Visual | Nilai UX / Brand |
|--------------|------------------|
| Tema Day/Night | Meningkatkan keterlibatan (sense of living interface), identitas dapat dibedakan |
| Scavenger Hunt | Retensi & eksplorasi situs lebih lama (gamification ringan) |
| Rooms Scroll Animation | Storytelling imersif: memosisikan brand sebagai kreatif / teknologis |
| Feed Sosial Terintegrasi | Bukti sosial & dinamika konten tanpa meninggalkan situs |
| Collection Progress Bar | Gamifikasi progress memicu repeat visit |
| Preloader + Typewriter | Kesan premium / crafted (meski perlu hati-hati agar tak mengganggu) |

---

## 17. Contoh Narasi Fungsional (Lanjutan & Tambahan)

### 17.1 Toggle Tema (lanjutan)
5. Pada transisi tema, kelas-kelas visual (contoh `.hero-cloud.day-hero-cloud`, `.hero-cloud.night-hero-cloud`, `.stars-overlay`) diberi/diubah kelas helper (misal `hide-cloud`) sehingga opacity transisi 0 → 1 (smooth).
6. Elemen knob `.toggle_inner` menggeser posisi horizontal via perubahan nilai `--color--toggle-offset` atau diganti dengan var `--dark--toggle-offset` ketika mode malam aktif, menciptakan animasi “geser”.
7. Layer dekor (`.scene-image.day` vs `.scene-image.night`) punya offset top berbeda (`--color--scene-offset-day/night`) menambah nuansa animasi bukan sekadar ganti warna.
8. Hasil final: perubahan tema terasa “hidup” tanpa JS kompleks—momen utama di-drive oleh variabel CSS + swap kelas root.

### 17.2 Interaksi Project Card
1. User arahkan kursor ke `.project-card.main`.
2. Layer default (`.project-card-title-wrap.default-state`) disembunyikan / di-blur / atau ditutupi overlay `.project-card-title-wrap.hover-state` (karena absolute menutupi seluruh card).
3. Badge `.design-award-badge.is-hover-style` dapat muncul (z-index ditinggikan) sementara versi default tetap di bawah.
4. State kolaps di mobile: kelas hover-state di-`display:none`, agar kartu tidak mengganggu layout & mengurangi memory painting saat scroll.

### 17.3 Scavenger Item (Collectible)
1. Grid panel `collection-item-panel` menampilkan slot 3 kolom (desktop). Setiap slot punya `.scavanger-item-card`.
2. Item yang belum ditemukan: muncul overlay `.undiscovered-item-bg` (opacity .65) + ikon tanda tanya (day/night versi).
3. Saat user “menemukan” (JS menambah kelas `.is-collected` pada `.scavanger-item-container`):
   - Kontainer membesar (width 70% / height auto) sehingga ikon lebih dominan.
   - Judul label `.scavanger-card-title.collected` diwarnai ulang (background var theme) dan diberi padding sehingga membedakan status.
4. Progress bar `.collection-progress-bar` transisi width (.5s) sesuai persentase total item terkoleksi.
5. Angka perolehan day/night disinkronkan (display/opacity toggle kelas `.collection-count-numbers.light/dark`).

### 17.4 Rooms Scroll Experience
1. Pengguna mulai scroll di section Rooms → memasuki `.animated-room-track` (500vh).
2. `.animated-room-stage` (position: sticky; top:0) menahan “kanvas” tetap di viewport.
3. JS (asumsi) menghitung progress scroll ≈ ratio dari total tinggi track → mengubah transform/opacity layer `.room-image.*` dan memunculkan `.annotation-block` sesuai segmen.
4. Anotasi memposisikan informasi naratif; item collectible (misal kunci, koin) absolute di ruang—klik memicu logika set state item “found”.

### 17.5 Preloader / Typewriter
1. Jika preloader diaktifkan: `.preloader-wrap` di-`display:flex` sebelum konten utama.
2. `.loading-bar-bar` width naik incremental (CSS transition atau JS inline style).
3. `.typewriter-container` memaparkan teks satu per satu (menggunakan script pengetikan) menambah gaya retro terminal.
4. Setelah threshold (misal 100%), preloader di-fade-out (opacity transisi) dan di-`display:none` → mengembalikan akses scroll.

---

## 18. Pemetaan Kelas ke Semantik (Singkat Per Fungsi Tinggi)

| Kategori | Contoh Kelas | Semantik Idiomatik |
|----------|--------------|--------------------|
| Layout kontainer global | `.page-wrapper`, `.container-*`, `.padding-global` | Pembatas lebar & ritme horizontal |
| Atoms tipografi | `.text-weight-*`, `.text-size-*`, `.heading-style-*` | Skala & bobot typografi konsisten |
| Warna tema & variasi | `.background-day-gradient`, `.background-color-night-*`, `.text-color-day-2` | Mengaplikasikan token tema siang/malam |
| Navigasi | `.navigation-bar`, `.menu-trigger-wrap`, `.menu-overlay`, `.breadcrumb-*` | Sistem navigasi adaptif multi-level |
| Hero | `.section_hero`, `.hero_grid`, `.scroll-prompt` | Blok headline dan entry point visi brand |
| Kartu Projekt | `.project-card*`, `.design-award-badge`, `.project-card-title-wrap` | Showreel produk / highlight feature |
| Blog / Log | `.log-book-grid`, `.featured-log-item`, `.log-title-wrap` | Sistem konten editorial & highlight |
| Koleksi/Gamifikasi | `.collection-panel`, `.scavanger-item-card`, `.collection-progress-bar` | Progress & reward mechanic ringan |
| Rooms Animated | `.animated-room-track`, `.annotation-block`, `.hunt-item` | Story “immersive scroll” & collectible integrasi |
| Bot Page | `.bot-hero_panel`, `.bot-page-video-container`, `.vision-pro-button` | Halaman produk single-focus dengan media berat |
| CTA | `.cta-panel`, `.cta-cell-inner` | Konversi funnel / penguatan brand action |
| Social | `.social-feed-inner`, `.social-card` | Testimoni / aktivitas komunitas |
| Form | `.contact-form-panel`, `.form_input`, `.submit-button` | Interaksi input & konversi lead |
| Slider | `.splide__*`, `.my-slider-progress` | Navigasi cerita / highlight sequence |
| FAQ | `.faq-item`, `.answer-wrap` | Accordion informasi sering ditanya |
| Preloader | `.preloader-wrap`, `.loading-bar-bar` | Loading pengalaman imersif |
| Drag Sandbox | `.draggable-item`, `.floating-folder` | Interaksi playful (engagement) |
| Utility | `.margin-*`, `.overflow-*`, `.z-index-*`, `.pointer-events-*` | Atomic rapid layout adjustments |

---

## 19. Risiko & Dampak (Lebih Terperinci)

| Risiko | Dampak | Indikasi | Mitigasi |
|--------|--------|----------|----------|
| CSS Monolit besar | Waktu parse & render tinggi | Lighthouse CSS coverage rendah | Segmentasi + lazy load non-critical |
| Duplikasi styling hover / default | DOM berat, memori | Banyak elemen “double layer” | Single DOM + state via data-attr |
| Fokus aksesibilitas hilang | UX keyboard terhambat | Tab tak terlihat | Tambah `.focus-visible` dengan outline kontras |
| Animasi scroll berat | Jank di mid-tier devices | FPS drop saat scroll room | Gunakan will-change selektif & throttle observer |
| Image multi resolusi statis | Bandwidth mobile besar | Transfer size besar | Responsif srcset + AVIF fallback |
| Hard-coded warna (non-token) | Sulit rebranding | Cari di grep `#f177a4` dsb. | Map ulang ke variabel desain |
| Variabel nama Webflow bawaan (deleted|variable) | Kurva belajar tim | Membingungkan mapping | Bikin layer alias tokens semantik |
| State logic bercampur CSS & markup | Sulit testing | Banyak `.is-*` tersebar | Introduce “state controller” JS + purge states tak dipakai |
| Preloader blocking tanpa skip | UX buruk di koneksi lambat | Time to Interaction naik | Atur maksimum durasi & skip button aria-hidden=false |
| Gamifikasi tanpa fallback | User bingung di mode reduce-motion | “Room” kosong / mismatch | Fallback static image / reduce-motion CSS |

---

## 20. Rencana Refaktor Bertahap (4 Fase)

| Fase | Fokus | Deliverable | KPI |
|------|-------|-------------|-----|
| 1 (Stabilisasi) | Inventaris CSS & purge | Laporan coverage, file minified < X KB | -30% ukuran |
| 2 (Tokenisasi) | Ganti warna & spacing ke tokens | tokens.css / design-tokens.json | 90% warna via var |
| 3 (Modularisasi) | Pisah base/util/komponen/halaman | Folder struktur + bundler config | Build time stabil & tree-shakable |
| 4 (A11y & Perform) | Fokus ring, reduce motion, lazy load | Checklist a11y + CLS <0.1 | Skor Lighthouse Perf + Access naik |

---

## 21. Checklist QA Front-End

| Area | Tes | Alat |
|------|-----|------|
| Responsif | Resize 320 → 2560, periksa breakpoints krusial | Browser DevTools |
| Tema | Toggle day/night cepat (10x) tidak glitch | Console memory snapshot |
| Hover fallback | Mobile: tidak ada overlay terlanjur tampil | Emulasi mobile |
| Fokus | Tab order nav → hero → main CTA → footer | Keyboard only |
| A11y semantik | Pastikan decorative aria-hidden | Axe / Lighthouse |
| Animasi scroll | FPS > 50 pada Rooms stage | Performance panel |
| Gamifikasi | Item collectible state persist? (localStorage?) | Manual test |
| Form | Validation success/error style terlihat kontras | Simulasi invalid submit |
| Preloader | Timeout fallback < 4s on slow3G | Network throttling |
| Slider Splide | Swipe gesture di iOS/Android halus | Perangkat nyata |
| Social feed | Overflow scroll bukan layout shift | Layout shift monitor |
| 404 draggables | Drag lepas tidak memicu scroll freeze | Manual |

---

## 22. Strategi Migrasi ke Sistem Utility Modern (Tailwind / Tokens JSON)

1. Ekspor token root → JSON:
   ```json
   {
     "colors": {
       "background.base": "#0f0e16",
       "text.base": "#cbcfff",
       "brand.blue": "#2d62ff",
       "brand.pink": "#dd23bb",
       "status.success.bg": "#cef5ca"
     }
   }
   ```
2. Map ke Tailwind `theme.extend.colors`.
3. Ganti utility margin/padding kustom → skala Tailwind (mis. `m-14` vs `.margin-xhuge`).
4. Buat plugin untuk radius khas (3.14rem, 2.85rem, 1.57rem).
5. Konversi component berat (project card) ke partial template + apply class atomic baru.
6. Simpan file lama sebagai fallback selama transisi (progressive hydration).

---

## 23. Aksesibilitas (Detail)

| Item | Status Saat Ini | Rekomendasi |
|------|-----------------|-------------|
| Fokus Visual | Banyak `outline:0` | Tambah global: `*:focus-visible { outline:2px solid var(--base-color-brand--blue); outline-offset:2px; }` |
| Kontras | Mayoritas cukup; beberapa gradien dapat menurun di area terang | Uji WCAG AA untuk teks kecil ( <14px ) |
| Animasi | Tidak ada `prefers-reduced-motion` | Buat override: set `transition:none`, hentikan parallax |
| Teks Alternatif Gambar Background | Banyak `background-image` dekoratif | Tandai container `aria-hidden="true"` |
| Interaksi Drag | Draggable item perlu peran | Tambah `role="button"` + instruksi ARIA sr-only |
| Form Label & Field | Label ada, placeholder bukan satu-satunya | OK (pastikan error states punya aria-live) |
| Breadcrumb Capsule | Pastikan linear reading order sesuai | Gunakan `nav aria-label="Breadcrumb"` & `ol/li` semantik |

---

## 24. Kinerja (Budget & Peluang)

| Metrix | Target | Pendekatan |
|--------|--------|-----------|
| Total CSS (gzipped) | < 200KB (ideal <120KB) | Purge + split |
| LCP | < 2.5s | Preload hero font + critical CSS inline |
| CLS | < 0.1 | Tetapkan dimensi gambar & media |
| JS untuk style toggles | Minimal | Delegasi ke CSS var + class root |
| Request gambar hero | Lazy load di bawah lipatan | `loading="lazy"` + `decoding="async"` |
| GPU Overdraw | Turunkan layered transparan | Flatten overlay jarang terlihat |
| Paint Awal | Minim gradient berat di fold | Gunakan fallback solid lalu gradient fade-in |

---

## 25. Security / Privacy Quick Notes

| Aspek | Catatan |
|-------|---------|
| CSS saja | Tidak mengeksekusi logika sensitif | Aman intrinsik |
| Custom font remote | Pastikan served via HTTPS + caching | Cek header CORS |
| Inline base64 font icon | Mengurangi request, aman | OK |
| Gamifikasi (JS implied) | Hati-hati jika simpan data user (localStorage) | Hindari PII |

---

## 26. Visual Regression Strategy

| Langkah | Tools |
|---------|------|
| Snapshot per halaman (desktop/tablet/mobile) | Playwright + Percy / Chromatic |
| Compare mode day/night | Ambil kedua tema per viewport |
| Animasi dinonaktifkan (reduce motion) | Set prefers-reduced-motion di test env |
| Threshold diffs | < 0.1% pixel difference per frame |
| Fokus test | Force `:focus-visible` style via JS injection |

---

## 27. Estimasi Pengurangan Ukuran (Hipotesis)

| Langkah Refaktor | Pengurangan Perkiraan |
|------------------|-----------------------|
| Purge kelas tak dipakai (util & varian hover ganda) | 15–25% |
| Konsolidasi spacing util | 5–10% |
| Hilangkan duplikasi var (deleted|variable alias) | 2–5% |
| Migrasi warna literal ke tokens & hapus redundan | 3–5% |
| Modul per halaman (code-splitting) | 10–20% beban waktu muat awal |
| Minifikasi + brotli | 20–25% dari mentah |

Gabungan total potensial modernisasi: 40–60% lebih kecil untuk bundle muat awal (kasus terbaik).

---
