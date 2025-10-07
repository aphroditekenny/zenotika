Berikut versi diagram Mermaid yang sudah diperbaiki (tanpa `<br/>`, tanpa karakter yang sering memicu parse error, label dipersingkat, dan setiap node punya ID jelas). Silakan salin persis tiap blok kode. Jika masih ada error di environment Anda, cek versi Mermaid (disarankan ≥ 9.4) dan pastikan tidak ada trimming otomatis oleh CMS/editor.

1. Alur Tingkat Tinggi (High-Level Lifecycle)

```mermaid
flowchart LR
    A[Load Bootstrap] --> B[Init Macros Tags Rules]
    B --> C[Evaluate Consent default region]
    C --> D{Consent OK}
    D -- No --> P[Park Event Wait]
    D -- Yes --> E[Attach EM Listeners]
    P --> |Consent Updated| F
    E --> F[Event Fires]
    F --> G[Normalize Hash User Data]
    G --> H[PII Redaction]
    H --> I[Conversion Marking]
    I --> J[Region Field Filter]
    J --> K[Batch Queue]
    K --> L{Flush}
    L -- No --> K
    L -- Yes --> M[Transport fetch beacon img]
    M --> N[GA4 Ads Endpoint]
    N --> O[Reporting Analytics]
```

2. Detail Consent Mode & Pengaruhnya

```mermaid
flowchart TD
    A[Load Container] --> B[Default Consent]
    B --> C[Region Override]
    C --> D[Status Consent Aktif]
    D --> E{analytics_storage granted?}
    E -- Ya --> F[Set Client & Session ID]
    E -- Tidak --> G[Mode Terbatas Tanpa ID Persist]
    D --> H{ad_storage granted?}
    H -- Ya --> I[Kelola gclid / wbraid / gbraid]
    H -- Tidak --> J[Tidak Simpan ID Iklan]
    D --> K{ad_user_data granted?}
    K -- Ya --> L[Aktifkan Enhanced Conversions]
    K -- Tidak --> M[Lewati User Data]
    D --> N{ad_personalization granted?}
    N -- Tidak --> O[Non Personalized Flag]
    N -- Ya --> P[Personalization Diizinkan]
```

3. Enhanced Measurement Event Flow

```mermaid
flowchart LR
    A[Listener Terpasang] --> B{Aktivitas}
    B --> C[URL / History] 
    B --> D[Scroll Threshold]
    B --> E[Outbound Link]
    B --> F[File Download]
    B --> G[Site Search]
    B --> H[Video Action]
    C --> Z[Pipeline Event]
    D --> Z
    E --> Z
    F --> Z
    G --> Z
    H --> Z
```

4. Enhanced Conversions (User Data) Pipeline

```mermaid
flowchart TD
    A[Sumber Data] --> B{Mode}
    B -- Otomatis --> C[Deteksi DOM]
    B -- Manual --> D[Config Manual]
    C --> E[Normalisasi]
    D --> E
    E --> F{Sudah Hashed?}
    F -- Ya --> G[Validasi Bentuk Hash]
    F -- Tidak --> H[Hash SHA256]
    H --> I[Kompilasi Payload]
    G --> I
    I --> J{ad_user_data granted?}
    J -- Tidak --> K[Drop User Data]
    J -- Ya --> L[Inject ke Event]
    L --> M[Gabung Dengan Param Lain]
```

5. Middleware / Transform Pipeline (Event-Level)

```mermaid
flowchart LR
    A[Raw Event] --> B[Map Field → Short Codes]
    B --> C[Inject User Data]
    C --> D[Redaksi PII]
    D --> E[Region Filter]
    E --> F[Conversion Marking / Dedup]
    F --> G[Queue & Batch]
    G --> H{Flush?}
    H -- No --> G
    H -- Yes --> I[Transport]
    I --> J[Server]
```

7. Region Scoping & Redaction

```mermaid
flowchart TD
    A[Event Siap] --> B[Identifikasi Region]
    B --> C{Perlu Redaction?}
    C -- Ya --> D[Hapus / Blank Geo & Device Fields]
    C -- Tidak --> E[Biarkan Penuh]
    D --> F[Batch Queue]
    E --> F
    F --> G[Transport]
```

9. Eksperimen / Feature Flags

```mermaid
flowchart TD
    A[Load Flags] --> B[Pilih Feature ID]
    B --> C{Bucket / Override}
    C -- Control --> D[Nonaktif]
    C -- Variant --> E[Aktifkan Fitur]
    D --> F[Pipeline Dasar]
    E --> F
```

10. Diagram Integratif (Semua Layer)

```mermaid
flowchart TB
    subgraph BOOT[Bootstrap]
        A1[Load Container] --> A2[Init Macros Tags Rules]
        A2 --> A3[Consent + Region]
    end

    subgraph LISTEN[Listeners]
        L1[History]
        L2[Scroll]
        L3[Outbound]
        L4[Download]
        L5[Search]
        L6[Video]
    end

    A3 --> LISTEN
    LISTEN --> EV[Event Fired]

    subgraph USERDATA[Enhanced Conversions]
        U1[Collect]
        U2[Normalize]
        U3[Hash/Skip]
    end

    EV --> U1
    U1 --> U2 --> U3 --> M1
    A3 --> |Consent Gate| U1

    subgraph PIPE[Middleware]
        M1[Merge Params] --> M2[Redact PII]
        M2 --> M3[Region Filter]
        M3 --> M4[Conversion Marking]
        M4 --> M5[Compress Codes]
    end

    M5 --> BQ[Batch Queue]

    subgraph BATCH[Batch Logic]
        BQ --> BQ{Threshold?}
        BQ -- No --> BQ
        BQ -- Yes --> TR[Transport]
    end

    subgraph TRANSPORT[Transport]
        TR --> EP[Endpoint GA4/Ads]
    end

    EP --> REP[Reporting / Modeling]
```

11. (Opsional) Sequence End-to-End (Jika butuh tipe sequence, ini tetap valid)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant GTM as Runtime
    participant Consent
    participant UD as UserData
    participant MW as Middleware
    participant Batch
    participant Net as Network

    User->>Browser: Interaksi
    Browser->>GTM: Trigger Event
    GTM->>Consent: Cek Status
    Consent-->>GTM: Hasil Consent
    GTM->>UD: Kumpulkan & Hash (jika perlu)
    UD-->>GTM: Payload User Data
    GTM->>MW: Redact / Region / Conversion
    MW-->>Batch: Tambah ke Queue
    Batch-->>Batch: Gabung Batch
    Batch->>Net: Kirim (fetch/beacon/img)
    Net-->>GTM: OK (opsional)
```
