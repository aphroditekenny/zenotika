## 1. Ringkasan Tingkat Tinggi

Stylesheet ini adalah gabungan:
1. Reset / Normalisasi (mirip gabungan reset HTML5 + beberapa aturan tambahan).
2. Sistem tipografi & hirarki heading (h1–h6) + adaptasi responsive.
3. Sistem variabel CSS (custom properties) untuk tema: warna brand, warna status (success/error/warning), dark/light mode, gradient, offset animasi, dsb.
4. Koleksi besar “utility classes” (margin-*, padding-*, max-width-*, text-weight-, overflow-, align-, dsb.) untuk konsistensi spacing & layout cepat.
5. Komponen besar: navigasi (nav_, menu-*, breadcrumb), hero sections, project cards, log (blog/log book) cards, forms (contact, newsletter, faq), slider (Splide), toggle day/night, koleksi “rooms” (tampaknya halaman khusus), “bot” (halaman produk / fitur), panel CTA, panel sosial, feed sosial, panel koleksi (scavenger hunt / collectible), animated rooms & train animation.
6. Form styling (checkbox/radio custom, upload, states success/fail).
7. Responsiveness: tiga breakpoint utama (≤991px “tablet”, ≤767px “mobile landscape”, ≤479px “mobile portrait”) dengan override sangat ekstensif (menciutkan padding, mengganti layout grid → kolom tunggal, menyembunyikan elemen dekoratif).
8. Efek tema (day/night) berbasis kelas + variabel, termasuk transisi state (misalnya mengganti background gradient dan layer bintang).
9. Banyak kelas “is-*” sebagai modifier state (mis-hover-style, is-featured, is-current, is-hover-state, is-dark-purple, dll.).
10. Interaksi / animasi dasar diandalkan pada transform, opacity, position absolute, dan layering z-index untuk transisi (hover, toggle, panel reveal).

---

## 2. Reset & Normalisasi

Bagian awal mengatur:
- Elemen HTML5 (article, aside, figure, main, dll.) → display: block agar konsisten di browser lama.
- Menghapus margin default body, mengset font dasar sans-serif (nantinya diganti ke Roobert).
- Menghapus border img, outline pada anchor saat hover/active, dan menormalkan sub/sup vertical alignment.
- Menonaktifkan tampilan default tombol, input, dll. agar styling konsisten (inherit font, color).
- Tabel → border-collapse agar rapat.
- Tag `audio[controls]` saja yang tampil; yang tidak ada controls disembunyikan.
- Juga memuat font ikon “webflow-icons” melalui data URI.

Inti manfaat: baseline seragam untuk seluruh komponen tanpa gangguan default browser.

---

## 3. Sistem Tipografi

### Font & Bobot
- Font utama: Roobert (500 & 400), RoobertMono (monospaced gaya regular). Fallback netral: Arial, Helvetica, dsb.
- Variasi kelas: .heading-style-h1/h2/h3/h4/h5/h6 serta heading HTML h1–h6.
- Berat font utility:  
  - `.text-weight-light` (300)  
  - `.text-weight-normal` (400)  
  - `.text-weight-medium` (500)  
  - `.text-weight-semibold` (600)  
  - `.text-weight-bold` / `.text-weight-xbold` (700/800).  

### Skala Ukuran
- Desktop h1 sampai 6 besar (h1 = 6rem khusus style custom, h1 HTML = 38px default awal reset).
- Ukuran turun drastis pada breakpoint 991px / 767px / 479px untuk keterbacaan di mobile (misal h1 dari 6rem → 5rem → 4rem → 3rem).
- Ada varian heading khusus per halaman (contoh: `.about-title`, `.rooms-heading`, `.bot-page-title`) dengan ukuran besar sekali.

### Rich Text
- `.text-rich-text` dan `.text-rich-text-job-posting` mengatur spacing internal, ukuran paragraf, margin heading dalam konten dinamis (CMS).
- Blockquote diberi padding & border-left mencerahkan visual.

Interpretasi: sistem tipografi fleksibel untuk halaman marketing / editorial (log / faq / job posting / product hero), menjaga konsistensi brand.

---

## 4. Variabel CSS (Custom Properties) & Tema

Di `:root` didefinisikan banyak variabel:
- Palet dasar brand:
  - `--base-color-brand--blue`, `--base-color-brand--pink`
  - Warna netral: white, black, neutral-lightest, neutral-darker
  - Warna sistem: success-green, error-red, warning-yellow (beserta “-dark”)
- Warna khusus konteks:
  - `--color--background`, `--color--text`, `--color--button-background`, `--color--navigation-ui-bg`
  - Gradien untuk 404, footer, CTA, switch background, dll.
- Mode Day/Night:
  - Prefiks `--dark--` vs tanpa prefix untuk normal.
  - Variabel offset animasi (scene offset day/night) mempengaruhi transform posisi elemen ilustrasi.
- Elemen komponen:
  - `--rooms-card-border-radius`, `--bot-project-card-border`, dsb.
  - Warna toggle, stars, slider track, copy button, checkbox highlight.

Perbedaan day/night diatur dengan kelas-kelas (mis. `.background-day-gradient`, `.background-night-gradient`, `.dark--` variabel override). Saat mode berganti, cukup toggling kelas root atau elemen container → style turunan berubah (hemat repaint besar karena rely pada CSS cascade).

Manfaat arsitektur:
- Memudahkan theming ulang (branding baru) dengan memodifikasi satu blok variabel.
- Mempercepat dark mode: hanya swap set var.
- Mengurangi duplikasi di kelas (warna tak ditulis manual berulang).

---

## 5. Pola Penamaan Kelas

Karakteristik:
- `kebab-case` konsisten untuk base class.
- Modifier memakai awalan `is-` (mis: `.is-hover-style`, `.is-featured`, `.is-current`).
- State tematik: `.day-*`, `.night-*`, `.dark--*` untuk membedakan varian visual.
- Blok fungsional (BEM-ish long form) contoh:
  - `project-card`, `project-card_inner`, `project-card-title-wrap`
  - `featured-log_home-image-wrap`, `log-title-wrap.is-featured`
  - `rooms-hero_panel-button`
- Utility pattern ringkas: `.margin-small`, `.padding-medium`, `.max-width-large`, `.overflow-hidden`, `.text-align-center`, dsb.

Efek: Developer bisa tebak fungsi kelas tanpa lihat CSS; memudahkan partial reuse di komponen lain.

---

## 6. Utility Spacing & Layout

### Margin / Padding
Kelas seperti:
- `margin-{tiny|xsmall|small|medium|large|xlarge|xxlarge|xhuge|xxhuge|custom1|custom2|custom3|0}`.
- `padding-{tiny|small|medium|large|xlarge|xxlarge|huge|xhuge|xxhuge|customX|0}`.
Memberikan skala modular. “custom” tampaknya jarak ad-hoc untuk desain tertentu.

### Arah Spesifik
- `margin-horizontal`, `margin-vertical`, `padding-top`, `padding-left`, dsb. – sebenarnya mengosongkan 3 sisi lain (konvensi internal).
- `padding-section-...` menandai section wrapper (global vertical rhythm).

### Max Width
- `.max-width-{xsmall|small|medium|large|xlarge|xxlarge|full}` mengontrol container batas teks / grid.

### Z-Index & Overflow
- `.z-index-{1|2}`, `.overflow-hidden`, `.overflow-visible`, `.overflow-auto`, `.overflow-scroll`.

### Alignment
- `.text-align-{center|left|right}`, `.align-center`.

Sistem ini meminimalkan kebutuhan menulis CSS tambahan, tetapi jumlah kelas besar juga menambah DOM class-list (trade-off).

---

## 7. Komponen Inti (Interpretasi & Fungsi)

### 7.1 Navigasi / Menu
Kelas: `nav_*`, `navigation-bar`, `nav_container`, `menu-trigger-wrap`, `menu-panel`, `menu-overlay`, `breadcrumb-*`.
- Mendukung:
  - Navigation bar fixed di atas.
  - Menu panel overlay (mobile) dengan transisi transform (translateX).
  - Breadcrumb kompleks (multi-lapisan, dengan bentuk “caps” – `.menu-cap`, `.breadcrumb-panel-background`).
  - Tombol toggle day/night terintegrasi (lihat `.toggle_wrap`, `.toggle_inner`).
  - Penggunaan layering (z-index sangat tinggi untuk elemen interaktif – mis. 5000).

### 7.2 Hero Sections
Kelas: `.section_hero`, `.hero_heading`, `.hero_grid`, `.hero_image`, `.hero-title`, `.home-logo-wrap`.
- Layout fleksibel grid/flex tergantung breakpoints.
- Elemen awan / bintang (cloud & stars overlay) absolute full-bleed.
- Day/Night swap: `.hero-cloud.day-hero-cloud` / `.night-hero-cloud`.

### 7.3 Project Cards
Kelas: `project-card`, `project-card_inner`, `project-card-title-wrap`, `gradient-border`, `design-award-badge`.
- Komposisi:
  - Border luar (# slider track background), radius besar (branding).
  - Layer image & overlay gradient.
  - Badge award (varian hover & default).
  - Title wrap dua mode: default state & hover state (disembunyikan di mobile untuk menyederhanakan UI).
- Responsif:
  - Desktop: grid dua kolom (kadang 1fr + .7fr).
  - Mobile: single column; tinggi menyesuaikan (vw-based scaling di beberapa tempat).

### 7.4 Log / Blog (Log Book)
Kelas: `log-book-grid`, `log-card`, `featured-log_*`, `log-title-wrap`, `log-article-wrap`.
- Menyediakan layout feed (5 kolom → tablet menjadi 2 → mobile 1).
- Elemen “featured” memiliki overlay & judul lebih dominan.
- Mode hover disembunyikan di mobile (untuk menghindari complexity gesture touch).

### 7.5 Rooms (Halaman Khusus)
Kelas: `rooms-hero_*`, `rooms-heading`, `rooms-hero_panel-button`, `animated-room-container`, `annotation-block`, `train-animation-track`, `hunt-item`, dsb.
- Ada animasi panjang (container 500vh/300vh sticky stage) untuk efek parallax / reveal ruangan.
- Layer interaktif (hunt items: key, gem, coin, chick) – collectible/hunt mechanic.
- Panel hero (grid 42.8rem + konten) → menyusut drastis di mobile (menjadi stack).
- Responsif menambah transform (translate, scale) agar animasi tetap proporsional.

### 7.6 Bot (Produk / Fitur)
Kelas: `bot-hero_panel`, `bot-page-title`, `bot-hero-video`, `bot-page-video-container`, `vision-pro-button`, `bot-cta-panel`.
- Visual: panel besar rounded, video embed container, call-to-action dengan gradient / overlay.
- Video wrapper radius besar + border adaptif untuk mode (menonjolkan device mockup?).
- Menggunakan grid di desktop → kolom tunggal + stack di mobile.

### 7.7 Koleksi / Collectibles
Kelas: `collection-*`, `scavanger-*`, `collectible-`, `collection-panel`, `collection-item-panel`.
- Fitur “progress bar” ( `.collection-progress-container` + `.collection-progress-bar`).
- Grid item 3 kolom → turun menjadi 2 atau scrollable di mobile karena tinggi terbatas.
- Item belum ditemukan diberi overlay gelap (`.undiscovered-item-bg`).
- State “collected” memodifikasi size container (mis: `.scavanger-item-container.is-collected`).

### 7.8 Komponen Sosial & Feed
Kelas: `social-feed-wrap`, `social-feed-inner`, `social-card`, `social_person`.
- Multi-kolom feed (6 kolom) → kolom jadi stack di breakpoints rendah.
- Card putih, radius besar, avatar, platform badge.

### 7.9 Form & Input
Kelas: `.form_input`, `.text-input`, `.contact-form`, `.contact-form-panel`, `.w-form`, `.submit-button`, `.checkbox`, `.w-file-upload-*`.
- Styling kontras: background transparan atau panel color `--color--button-background`.
- State focus menambahkan border-color brand biru.
- Radio & checkbox custom via pseudo wrappers (`.w-form-formradioinput--inputType-custom`).
- Panel contact form: grid dua kolom di desktop → satu kolom di tablet/mobile.

### 7.10 Slider (Splide)
Kelas: `.splide`, `.splide__track`, `.splide__arrows`, `.splide__slide`.
- Arrows custom: square besar (5rem) di desktop → disesuaikan / diposisikan ulang di mobile (centering / bottom).
- Progress bar `.my-slider-progress` (opacity awal 0; mungkin diaktifkan via JS).

### 7.11 FAQ (Accordion)
Kelas: `.faq-item`, `.answer-wrap`, `.faq-icon-wrap`, `.faq-answer`.
- Mekanisme sembunyi / tampil: `max-height` + margin-top transisi (disiapkan, logikanya di JS).
- Icon bulatan `.faq-dot` mengubah dimensi saat expand (transisi height/width 0.2–0.3s).

### 7.12 CTA Panels
Kelas: `.cta-panel`, `.cta-cell-inner`, `.cta-title`, `.button.gradient-button-inner`.
- Menggunakan gradient brand multi-stop (spektrum pelangi).
- Dua kolom (teks + visual) → collapse ke satu kolom di mobile.

### 7.13 Preloader
Kelas: `.preloader-wrap`, `.preloader-load-container`, `.loading-bar-bar`.
- Diset `display: none` default (atau bisa diaktifkan runtime).
- Wadah teks tipografi monospace, bar progress (inline width anim lewat JS).
- `typewriter-container` mengindikasikan animasi ketikan (JS menulis teks sequent).

### 7.14 Dark/Light / Toggle
Kelas: `.toggle_wrap`, `.toggle_inner`, `.toggle-inner-img.day|night`, `.scene-image.day|night`.
- Mengontrol penampilan ikon internal via absolute layering.
- Offset variabel (`--color--scene-offset-day/night`) untuk animasi posisi vertical.

---

## 8. Responsiveness (Breakpoints)

| Media Query | Maksimum Lebar | Fokus Perubahan |
|-------------|----------------|-----------------|
| ≤ 991px (Tablet) | 991px | Reduksi ukuran heading, spacing (margin/padding turun), banyak komponen grid → 1 kolom, menyembunyikan state hover duplikat, mengecilkan panel / tombol. |
| ≤ 767px (Mobile Landscape) | 767px | Skala tipografi turun lagi, hero / about tinggi menyesuaikan, feed & grid jadi 1 kolom, beberapa elemen dekor disembunyikan, border radius diperkecil. |
| ≤ 479px (Mobile Portrait) | 479px | Skala paling minimal, banyak padding dipangkas, struktur kompleks (project hero, rooms hero) di-stack, animasi container disesuaikan (scale/translate), ukuran ikon & badge direduksi, grid collectibles menjadi 2 kolom (scrollable). |

Prinsip: Mempertahankan bentuk brand (radius besar, gradien, warna) tapi mengurangi noise & layer hover pada layar kecil.

---

## 9. Pola State & Interaksi

- `.is-hover-style`, `.hover-state`: Elemen overlay yang muncul hanya pada pointer device. Di mobile di-`display: none` supaya tidak mengganggu layout.
- `.is-default-style` kadang dipasangkan berdampingan dengan `.is-hover-style` (dua lapisan absolute; transisi di JS dengan menambah kelas).
- `.reveal`: Memaksa tampil (misalnya panel yang default-nya `display: none`).
- `.hide`, `.hidden-*`: Menyembunyikan (sering digunakan untuk fallback di mode devices tertentu).
- `.opacity: 0` + transform (untuk transisi masuk via animasi kelas di JS).

---

## 10. Warna & Aksesibilitas (Interpretasi)

- Kontras: Warna teks utama `#cbcfff` di atas background gelap `#0f0e16` memiliki kontras memadai. Namun warna sekunder (pink terang di gradient) perlu dicek terhadap latar cerah (WCAG).
- Gradient multi-stop intens (pelangi) digunakan pada border / background transisional (`.gradient-border`, `.button-gradient`).
- Elemen interaktif (buttons) sering pakai warna solid untuk meminimalkan kebingungan.
- Potensi peningkatan:
  - Gunakan fokus ring custom lebih konsisten (beberapa elemen outline dihapus).
  - Tambahkan state `:focus-visible` untuk aksesibilitas keyboard.

---

## 11. Sistem Koleksi (Collectibles / Gamifikasi Singkat)

- Elemen `.scavanger-item-card` + `.undiscovered-item-bg` → item terkunci (opacity overlay).
- `.collection-progress-bar` animasi width via JS (progress).
- Kelas `.collected` memodifikasi tampilan (warna background, label).
- Ini menunjukkan integrasi mini-game atau user progression di dalam situs marketing.

---

## 12. Integrasi Media & Video

- `.w-background-video > video` di-`object-fit: cover` agar mengisi container responsif.
- `.bot-page-video-container` & `.looping-video` menggunakan border tebal & radius besar (frame device).
- `.embed-video`, `.youtube-embed` radius 1rem (konsistensi lembut).

---

## 13. Grid & Layout Khas

- Pola `[component]_grid` → dikelola dengan CSS Grid (mis: `team-member_row`, `media-list`, `rooms-hero_grid`).
- Terkadang diresponsif diubah ke Flex (untuk stack sederhana).
- Penggunaan `place-items` & `grid-auto-columns` memudahkan adaptif konten.

---

## 14. Opini Arsitektural & Rekomendasi Peningkatan

| Area | Observasi | Rekomendasi |
|------|-----------|-------------|
| Ukuran File | Sangat besar (ribuan baris) memuat segalanya (foundation + halaman khusus). | Pertimbangkan modularisasi (chunk per halaman) + minifikasi produksi. |
| Pengulangan | Banyak definisi margin/padding manual di breakpoints. | Buat skala spacing sistematis (CSS custom properties: --space-1,2,3). |
| Kelas Hover Ganda | `is-default` & `is-hover` sering menambah markup. | Bisa diganti pseudo `:hover` + prefer-reduced-motion fallback. |
| Aksesibilitas | Outline sering dihapus, fokus ring tidak konsisten. | Tambahkan `.focus-ring` atau gunakan `:focus-visible`. |
| Naming | Panjang & berbeda (campuran semantic + styling). | Boleh dikelompokkan dengan prefix modul (misal `.rooms__panel`). |
| Dark/Light Toggle | Berbasis kelas + var (baik). | Pastikan prefer-color-scheme bisa inisialisasi default. |
| Performance | Banyak absolute layering (stars, clouds) + besar image. | Gunakan media query `prefers-reduced-motion` + lazy loading / content-visibility. |
| Maintainability | Modifikasi tematik butuh telusuri ratusan kelas. | Dokumenkan peta komponen (mirip ringkasan ini) untuk dev baru. |
| Reusability | Variabel sudah kuat, tapi belum semua nilai (radius besar, durasi transisi) jadi var. | Tambahkan var: --radius-large, --transition-fast, dsb. |

---

## 15. “Terjemahan” Konseptual Beberapa Kelompok Kelas ke Bahasa Indonesia

| Kelompok (Asli) | Makna / Fungsi (Bahasa Indonesia) |
|------------------|----------------------------------|
| `.section_*` | Pembungkus bagian besar halaman (hero, investors, quotes, rooms). |
| `.navigation-bar`, `.nav_*` | Struktur navigasi utama situs. |
| `.menu-panel`, `.menu-overlay` | Panel menu geser / overlay mobile. |
| `.toggle_*`, `.scene-image.*` | Komponen saklar tema siang/malam dengan elemen dekorasi. |
| `.project-card*` | Kartu proyek / produk menonjol (dengan gambar & info). |
| `.featured-log_*`, `.log-book-*` | Modul daftar log/artikel + feature highlight. |
| `.rooms-*` | Tata letak dan animasi halaman “Rooms” (ruangan interaktif). |
| `.bot-*` | Halaman/section produk “Bot” (hero + video + CTA). |
| `.collection-*`, `.scavanger-*` | Sistem koleksi/gamifikasi item (progress, item ditemukan). |
| `.faq-*` | Daftar tanya jawab (accordion). |
| `.cta-*` | Panel ajakan bertindak (Call to Action) dengan layout 2 kolom / single. |
| `.social-*` | Feed sosial & kartu posting. |
| `.preloader-*`, `.loading-*` | Layar pramuat animasi (progress & teks ketik). |
| `.button.*` | Variasi tombol (brand, icon, gradient, big, secondary). |
| `.form_*`, `.contact-form*` | Struktur form contact / input kustom. |
| `.hero-*`, `.home-*` | Elemen hero halaman depan (logo besar, awan, prompt scroll). |
| `.annotation-*` | Kotak anotasi / highlight teks pada bagian animasi (Rooms). |
| `.animated-room-*` | Wrapper animasi ruangan (parallax sticky full viewport). |
| `.train-*` | Bagian animasi kereta (track panjang). |
| `.splide*` | Komponen slider/carousel (library Splide). |

---

## 16. Cara Cepat Menyesuaikan (Panduan Praktis)

1. Ubah Warna Brand:
   - Edit blok `:root` pada variabel brand & neutral.
2. Tambah Breakpoint Khusus:
   - Tambahkan media query baru (misal 1200px) sebelum yang ada agar override tepat.
3. Kurangi Ukuran (Produksi):
   - Jalankan build step (misal PostCSS + cssnano) + purge class tak terpakai via alat seperti PurgeCSS (pastikan dynamic classes tidak terhapus).
4. Tambah Komponen Baru:
   - Ikuti gaya penamaan: `component-name`, modifier `is-*`.
   - Gunakan variabel warna & spacing utilitas agar konsisten.
5. Bundling Per Halaman:
   - Pisahkan ke file: base.css (reset + var + utilities), components.css, pages/rooms.css, pages/bot.css.

---

## 17. Potensi Refaktor Teknis Lebih Lanjut

| Target | Strategi |
|--------|----------|
| Eliminasi Duplikasi Spacing | Ganti angka kaku dengan var: `--space-1: .25rem; --space-2: .5rem; ...` lalu mapping. |
| Konsistensi Border Radius | Definisikan `--radius-small`, `--radius-medium`, `--radius-pill`. |
| Theming Otomatis | Gunakan `[data-theme="dark"]` vs `[data-theme="light"]` agar toggling lebih semantik. |
| Aset Berat | Preload/defer gambar besar (hero) atau pakai format modern (AVIF/WebP – sebagian sudah dipakai). |
| Aksesibilitas | Tambah kelas global `.focus-visible { outline: 2px solid var(--base-color-brand--blue); outline-offset: 2px; }` dan aktifkan via JS polyfill. |
| Motion Preferensi | Bungkus animasi besar dengan `@media (prefers-reduced-motion: reduce) { .animated-room-track { animation: none; transform: none; } }`. |

---

## 18. Kesimpulan

Stylesheet ini adalah “mega-style” yang menyatukan:
- Sistem desain brand multi-tema (siang/malam).
- Komponen interaktif (slider, animasi ruangan, game koleksi).
- Layout dinamis responsif sangat granular.
- Utility-first hybrid (mirip gabungan Tailwind-style spacing + BEM naming).
- Fokus pengalaman visual high-fidelity (gradien kaya, radius besar, layer awan/bintang, item collectible).

“Terjemahan” idiomatiknya: secara fungsional file ini memetakan identitas brand yang playful, tematis (kosmik / malam-siang), dengan platform konten (log), showcase produk (projects, bot), gamifikasi (collectibles), dan narasi interaktif (rooms + train animation), disatukan oleh sistem variabel warna & layout responsif yang agresif.
