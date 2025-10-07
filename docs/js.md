## 1. Gambaran Umum

Berkas ini adalah payload konfigurasi kontainer Google Tag Manager (GTM) / Google Tag (gtag.js) yang sudah:

- Dimampatkan (minified) dan dipaketkan (bundled).
- Memuat definisi “macros”, “tags”, “predicates”, dan “rules”.
- Menyediakan runtime untuk:
  - Google Analytics 4 (GA4) (pengumpulan event otomatis & manual).
  - Google Ads Conversion Tracking.
  - Consent Mode (manajemen status persetujuan: ad_storage, analytics_storage, ad_user_data, ad_personalization).
  - Enhanced Measurement: scroll, outbound click, file download, site search, video engagement, page view (history changes).
  - Auto redaction (mengaburkan email & parameter sensitif).
  - User provided data detection (otomatis dan manual) untuk peningkatan konversi (enhanced conversions).
  - Region scoped settings & redaction berdasar lokasi/regulasi.
  - Pengaturan cross‑domain & linking (gclid, wbraid, gbraid, dclid).
  - Mekanisme batching & pengiriman event (beacon/fetch/img fallback).
  - Client‑side experiment / feature flags (numerik, misalnya ID studi A/B).
  - Integrasi form / phone call / dynamic remarketing (melalui modul iklan).
  - Mekanisme anti duplikasi (dedupe) & penandaan first visit / session start.
  - Pemetaan internal medan (field) GA4 & Ads ke kode singkatan (misal BK → gclsrc, JD → user_id, dll.) untuk menghemat ukuran payload.

---

## 2. Struktur Resource Awal

Bagian awal `data = { "resource": { ... } }` memuat:

- `macros`: daftar macro internal seperti `__e` (event), `__c` (constant), dsb.
- `tags`: sekumpulan tag yang terprioritaskan (priority field):
  - Contoh tag `__ogt_1p_data_v2` → mengelola 1P user data (email, telepon, alamat) secara manual/otomatis sesuai konfigurasi selektor & consent.
  - Tag conversion / GA4 event middlewares: `__ccd_*`.
  - Tag `__gct` menyiapkan trackingId GA4 (misal `G-6D394TGM0K`).
  - Tag auto‑redact, conversion marking, enhanced measurement event emitters.
- `predicates`: kondisi (if) – misal membedakan fase `gtm.js` vs `gtm.init`.
- `rules`: aturan kapan tag tertentu di-“add” saat predicate terpenuhi.

Intinya blok ini menentukan kapan setiap tag runtime dijalankan ketika kontainer bootstrap.

---

## 3. Namespace Runtime Fungsi (Prefiks `__ccd_`, `__module_`, dll.)

Banyak fungsi didefinisikan dalam array `runtime`:  
Setiap [50,"namaFungsi", ...] adalah wrapper definisi (format internal GTM). Di dalamnya:

### 3.1. Lapisan Fungsi Tag Operasional

- `__ccd_auto_redact`:  
  Menghapus/mengaburkan (replace) pola email & parameter query tertentu agar PII tidak bocor (dalam event GA/Ads).
  
- `__ccd_conversion_marking`:  
  Menandai event sebagai “conversion” jika rule (matchingRules) sesuai (misalnya eventName == "purchase").  
  Mengatur flag first_visit, session_start, dll., untuk pelaporan konversi yang benar.

- `__ccd_em_*` (enhanced measurement):  
  - `page_view`: mendengarkan history changes (`pushState`, `replaceState`) untuk SPA sehingga tiap navigasi “virtual” tercatat.
  - `scroll`: memicu event saat ambang scroll (90%) tercapai.
  - `outbound_click`: mendeteksi klik tautan domain luar; mengirim parameter link_id, link_url, domain, dll.
  - `download`: mendeteksi klik file (pdf, docx, zip, dsb.).
  - `site_search`: ekstraksi query parameter pencarian (q, s, search, query, keyword) dan mengirim event view_search_results.
  - `video`: memantau interaksi YouTube API (start, progress %, complete).
  
- `__ccd_ga_*`:  
  Lapisan hooking untuk Google Analytics (first → last) mengatur pipeline: region scoping, ads linking, dsb.

### 3.2. Modul Metadata & Skema

- `__module_gtagSchema`, `__module_metadataSchema`:  
  Berisi peta kunci internal → kode singkat (misal "page_location" → JM atau sejenis). Tujuan: kompresi payload network.
  
- `__module_featureFlags`:  
  ID‐ID integer yang menyalakan fitur eksperimen (misal 30, 32, 44, 142, dsb.).

- `__module_goldEventUsageId`:  
  Memetakan jenis event ke ID pemakaian—dipakai internal untuk pelacakan penggunaan fitur.

### 3.3. Enhanced Conversions & User Data

- `__ogt_1p_data_v2`:  
  Mengelola:
  - Mode otomatis (mengambil email/phone/address dr DOM sesuai selektor).
  - Exclusion selectors (untuk tidak memungut elemen tertentu).
  - Manual override (nilai manual di config).
  - Builder string gabungan (key-index-flag) ~ dipakai saat hashing & enkripsi server‑side.
  - Flag “autoCollectPiiEnabledFlag” → perlu explicit consent.
  - Normalisasi (lowercase, trimming) sebelum hashing (SHA‑256 di modul lain).
  
- Deteksi & hashing dilakukan via:
  - Normalisasi email/phone/nama/alamat.
  - Menandai apakah input sudah pre-hashed (`isPreHashed`).
  - Membangun metadata statistik (mode “a” / “auto” / manual).
  
### 3.4. Consent & Region

- Struktur consent: mendeteksi `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`.
- `__module_ccdGaRegionScopedSettings`:  
  Menyimpan definisi redaction per grup field tergantung wilayah (geo_granularity, redact_device_info).
- Menentukan perilaku: jika region tertentu diblok, field sensitif tidak dikirim.

### 3.5. Pengelolaan Cookie / Linker / ID

- Menangani gclid, dclid, wbraid, gbraid, gad_source.
- Membaca / menulis cookie partitioned / first-party / link decoration `/ set_parameter`.
- Auto dedupe (anti duplikasi event & multiple assignment).

### 3.6. Queue & Batching

- Mempertahankan queue event hingga syarat (misal consent) terpenuhi.
- Batching beberapa event dalam satu permintaan (menggabungkan parameter umum).
- Memilih endpoint (https://googleadservices.com / googletagmanager.com / google-analytics.com) tergantung jenis event / mode consent.

### 3.7. Transport Layer

- Percobaan menggunakan `fetch()`, fallback ke `sendBeacon()` atau `Image`.
- Mendukung atribut Attribution Reporting (jika browser mendukung).
- Timeout & retry logika (fallback ke pixel bila fetch gagal).

### 3.8. Anti-PII / Redaction Lanjutan

- Regex email & click id disaring untuk input parameter seperti `page_location`, `referrer`, `link_url`, dsb.
- Query param sensitif dihapus/diganti `(redacted)`.

---

## 4. Consent Mode (Logika Internal)

Bagian fungsi consent:

- Menandai status:
  - granted / denied / unset / pending.
  - Jika `analytics_storage=denied`, event masih terkirim tapi tanpa ID yang dapat dipakai untuk personalisasi (mis. tanpa clientId/cookies).
  - Mode "wait_for_update" → penundaan sampai user membuat pilihan.
- Region override (misal jika EU, default denied kecuali updated).
- Mencatat first consent event id & priority id agar sinkron dengan pipeline server.

---

## 5. Enhanced Measurement Detail

| Fitur | Cara Kerja | Data Tambahan |
|-------|------------|---------------|
| Page View SPA | Hook history API | oldUrl, newUrl, source |
| Scroll | Listener scrollDepth | percent_scrolled |
| Outbound Click | Filter domain beda | link_id, link_url, outbound=true |
| File Download | Ekstensi file match regex | file_name, file_extension |
| Site Search | Parse query parameter | search_term, additional query params |
| Video (YouTube) | API status (start/progress/complete) | video_percent, title, provider |
| Link Attribution / Cross-domain | Manipulasi parameter URL | gclid, etc. |

Semua disalurkan ke endpoint GA4 (“event_developer_id_string”, dsb.).

---

## 6. User Data (Enhanced Conversions) – Alur

1. **Kumpul Data**:  
   - Otomatis (selector atau pencarian form), atau manual (value disuntikkan).
2. **Normalisasi**:  
   - huruf kecil, trim spasi, hapus karakter noise (untuk nama/alamat).
3. **Hashing**:  
   - SHA‑256 (email, phone, nama).
4. **Paketkan**:  
   - Kode ringkas → disisipkan ke event (mode a/c = auto/code).
5. **Consent Gate**:  
   - Hanya dikirim jika consent relevan granted.
6. **Redaksi**:  
   - Jika email deteksi di URL, dihapus sebelum event dikirim.

---

## 7. Experiment & Feature Flags

- Daftar angka (misal studyId, experimentId, controlId) menandakan A/B flag.
- Fungsi memeriksa `Math.random()` untuk memutuskan user masuk varian A / B / Control.
- Fitur yang digated contoh: parallel ping, 1P data collection gating, server worker optimization.

---

## 8. Mekanisme Tag Pipeline (Event Flow Sederhana)

1. Kontainer load → inisialisasi macros & tags.
2. Mendeteksi fase `gtm.js` / `gtm.init`.
3. Consent state dievaluasi:
   - Jika perlu menunggu, event parkir.
4. Auto measurement listeners dipasang.
5. Saat event terjadi:
   - Data layering (macro resolution).
   - Middleware: redaction → conversion marking → region filtering → user data injection.
   - Batching aggregator memutuskan apakah digabung / langsung kirim.
6. Pengiriman:
   - Pilih endpoint & transport.
   - Tambah param kompresi (skema field singkat).
   - Fallback bila gagal.

---

## 9. Keamanan & Privasi

- **PII Scrubbing**: email & pattern sensitif diganti.
- **Consent Mode**: memisahkan event jalur “ad personalization off”.
- **Region-Specific Redaction**: device & geo fields bisa disembunyikan.
- **User Data Hashing**: semua identifier pribadi (email/phone/nama) di-hash.
- **Query Param Filtering**: parameter tertentu dihapus sebelum log.

---

## 10. Pengelolaan ID & Cookie

- Menangani:
  - Client ID GA4
  - Session ID
  - User ID (jika di-provide)
  - GCLID / WBRAID / GBRAID / DCLID / GAD_SOURCE
- Multi cookie prefix (contoh `_gcl_au`, `_gcl_aw`, `_gcl_gb`) untuk berbagai channel.
- TTL (kadaluarsa) diatur (session vs persistent).
- Mode tanpa cookie (consent denied) → fallback ke instans tanpa penjejakan pengguna (non-personalized).

---

## 11. Penanganan Outbound / File / Video

- Seleksi tautan outbound: perbandingan hostname.
- File extension whitelist → deteksi download konversi.
- Video event: mendengarkan API internal YouTube (duration, playback %).
- Tracking dinamis tanpa perlu manual tag (Enhanced Measurement).

---

## 12. Penanganan SPA / Virtual Pageview

- Hook `history.pushState`, `history.replaceState`.
- Pastikan tidak double-fire jika URL sama sebelum/ sesudah.
- Mengirim parameter page_location & page_referrer per transisi.

---

## 13. Struktur Kode Kompleks (Kenapa Minified)

- Menghemat ukuran (bandwidth, latency).
- Obfuscasi simbol internal Google.
- Mengurangi duplikasi modul (modular registry).
- Field name compression (mapping ke kode 1–3 huruf / dua huruf).

---

## 14. Cara Mengembangkan / Debug (Secara Konseptual)

Walau kode minified, debugging dapat dilakukan dengan:

| Tujuan | Strategi |
|--------|----------|
| Lihat event realtime | Gunakan GA4 DebugView atau Tag Assistant |
| Cek consent flow | Pantau state `gtag('consent', ...)` |
| Verifikasi enhanced measurement | Uji klik/scroll/video & cek network requests |
| Pastikan user data hashing | Periksa payload (email tidak tampil mentah) |
| Cek gclid / wbraid | Uji URL dengan parameter & lihat cookie `_gcl_*` |
| Redaction valid | Coba load URL berisi email → pastikan tidak bocor di hit |

---

## 15. Ringkasan Nilai Tracking ID Anda

Di berkas: `G-6D394TGM0K` muncul sebagai GA4 Measurement ID utama.  
Itu dipakai oleh modul `__gct` & pipeline GA4 lainnya.

---

## 17. Kesimpulan

Berkas ini adalah *mesin terpadu* untuk:

- Mengumpulkan event perilaku (page view, scroll, klik outbound, unduhan, video, pencarian internal).
- Mengelola identitas dan sinyal iklan (gclid, wbraid, dll.).
- Menjalankan Consent Mode & redaksi PII adaptif.
- Mengolah data peningkatan konversi (enhanced conversions) secara otomatis (normalisasi + hashing).
- Mengoptimalkan pengiriman (batching, fallback, feature flag).
- Mematuhi perbedaan regulasi region (geo redaction).
- Mendukung A/B fitur internal (experiment flags).

Semua dilakukan tanpa perlu developer menulis ulang logika manual.
