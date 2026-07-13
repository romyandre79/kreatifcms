# Kreatif CMS - Core Architecture & ERP Integration Design

Dokumen ini mendokumentasikan arsitektur inti dari **Kreatif CMS**, pembagian modul/plugin bawaan, daftar menu admin utama, serta cara modul **ERP Master Data** diintegrasikan secara selaras di atas platform ini.

---

## 1. Arsitektur Inti Kreatif CMS (Core CMS Architecture)

Kreatif CMS dirancang menggunakan pola **Modular Monolith** dengan decoupling logic pada layer Database, Router, dan UI rendering. 

```mermaid
graph TD
    subgraph Client Layer
        A[Inertia.js React Frontend] -->|Axios REST / State| B[Laravel Router Web/API]
    end

    subgraph Service Layer (Core Modules)
        B -->|Dynamic Routing| C[PageRendererController]
        B -->|Dynamic CRUD| D[ContentEntryController]
        C -->|Load Layout & Blocks| E[SchemaService]
        D -->|Save Content Types| E
        E -->|SchemaSync| F[DatabaseFactory]
    end

    subgraph Database Layer
        E -->|Read Config| G[(Main DB: default)]
        E -->|Read/Write Tables| H[(Content DB: secondary)]
    end
```

---

## 2. Struktur Menu & Komponen Inti (Core Menu & Component Registry)

Menu di dalam sidebar panel admin Kreatif CMS dikelompokkan secara dinamis ke dalam parent group dan di-render berdasarkan hak akses user:

### A. Dashboard Group
Menu utama ringkasan statistik dan monitoring widget.
- **Dashboard**: Widget analitik dinamis (CPU, storage, user activity).

### B. Designer Group
Kelompok alat no-code untuk merancang visual web front-end.
- **Pages**: Pengelolaan dan pembuatan halaman web dinamis beserta meta tag (SEO).
- **Blocks**: Komponen pembangun visual reusable (Reusable Blocks) yang di-hydrate dinamis.
- **Layouts**: Pengaturan kerangka layout global web (Header, Footer, Main container).

### C. Master Data Group (ERP Add-on)
Infrastruktur data dasar transaksi ERP yang terintegrasi dengan Content Types & Workflow.
- **Currency**: Master mata uang transaksi (`cms_currencies`).
- **Company**: Master profil perusahaan/entitas induk (`cms_companies`).
- **Branch**: Kantor cabang per company (`cms_branches`).
- **Country**: Master negara (`cms_countries`).
- **Province**: Master wilayah provinsi (`cms_provinces`).
- **City**: Master kota / kabupaten (`cms_cities`).
- **Doc Numbering**: Format penomoran otomatis transaksi (`cms_doc_numberings`).

### D. System Group (Core Plugins)
Infrastruktur backend, manajemen server, utilitas database, dan integrasi API.
- **Media**: Media Library untuk pengelolaan gambar dan berkas (`medialibrary`).
- **Content Types**: Pembuat skema database dinamis (`contenttype`).
- **Workflows**: Editor logika visual flowchart bisnis (`workflow`).
- **File Manager**: Web-based server file explorer (`filemanager`).
- **Email Templates**: Template mail builder (`emailtemplates`).
- **Marketing**: Integrasi marketing/newsletter via Brevo (`brevo`).
- **AI Assistant**: Integrasi kecerdasan buatan (`aiassistant`).
- **Jobs**: Monitoring antrean antarmuka & schedule task cron (`jobmanager`).
- **General API**: API Webhook builder dinamis (`generalapi`).
- **Database**: Database backup, restore, dan monitor (`databasemanager`).
- **Languages**: Translasi multibahasa web (`languageswitcher`).
- **Plugins**: Pengelola instalasi plugin/modul pihak ketiga.
- **Users & Roles**: Pengaturan data pengguna, peran, dan policy permission.
- **System Update**: Utilitas untuk memperbarui source code inti CMS.

---

## 3. Pemisahan Multi-Database Dinamis (Multi-Database Separation)

Kreatif CMS memisahkan data konfigurasi sistem dan data konten dinamis pengguna ke dalam **dua database fisik yang terpisah**:

### A. Database Utama (`default`)
Menyimpan konfigurasi sistem inti, manajemen hak akses, desain visual, dan status workflow:
- `users`, `roles`, `permissions`: Keamanan dan hak akses pengguna.
- `sidebar_menus`: Registrasi menu samping admin secara dinamis.
- `content_types` & `content_fields`: Metadata definisi skema content type.
- `pages` & `layouts`: Struktur no-code halaman web dan template layout block.
- `workflows`: Aliran flowchart logika bisnis visual.

### B. Database Konten Sekunder (`secondary`)
Menyimpan tabel database fisik yang di-generate secara dinamis oleh pengguna melalui modul Content Type. Semua tabel di database sekunder diawali dengan prefix **`cms_`** (seperti `cms_currencies`, `cms_companies`, `cms_branches`, dll).
- **Keuntungan**: Memungkinkan backup/restore data transaksi (ERP/konten) secara instan tanpa mengganggu konfigurasi backend/user login utama.

---

## 4. Sistem Halaman & Hidrasi Block (Page Builder & Block Hydration)

Kreatif CMS memiliki Page Builder berbasis blok React:
1. **Pages & Layouts**: Setiap halaman (`pages`) menyimpan array JSON representasi blok visual di kolom `blocks`.
2. **Hydration System**: Sebelum halaman di-render, `App\Services\SchemaService` memicu `hydrateDynamicBlocks($blocks)`.
   - Mengambil data terbaru dari database sekunder (`secondary`).
   - Memproses multi-bahasa (localizations).
   - Menyisipkannya ke properti data blok sebelum dikirimkan ke Inertia React Frontend.

---

## 5. Mesin Workflow (Workflow Engine Flowchart)

Workflow Engine di Kreatif CMS memungkinkan pembuatan logika visual flowchart:
- **Nodes**: Trigger atau Action (`send_email`, `webhook_request`, `database_log`, `conditional_branch`).
- **Traversing**: `Modules\Workflow\Services\WorkflowEngine` mengeksekusi simpul graf secara rekursif mulai dari start trigger node, mengevaluasi port branching (`output_true` / `output_false`), dan mengembalikan payload hasil pemrosesan ke controller.
