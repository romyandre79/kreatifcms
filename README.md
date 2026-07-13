# Kreatif Portal CMS

A powerful, modular Content Management System built with Laravel 12, Inertia.js, and React.

## How to Install

### Windows

```bash
./install.bat
```

### Linux / macOS

```bash
./install.sh
```

## Module Registration

Jika Anda menambahkan modul baru atau ingin meregistrasikan modul yang sudah ada di dalam folder `Modules/`, ikuti langkah-langkah berikut:

1. **Tambahkan Autoload PSR-4 di `composer.json`**
   Buka [composer.json](file:///c:/lara/www/kreatif/kreatif-cms-build/composer.json) dan daftarkan namespace modul Anda di bagian `autoload.psr-4`. Contoh jika nama modulnya adalah `ProjectManager`:
   ```json
   "autoload": {
       "psr-4": {
           "App\\": "app/",
           ...
           "Modules\\ProjectManager\\": "Modules/ProjectManager/app/"
       }
   }
   ```

2. **Perbarui Autoloader Composer**
   Jalankan perintah berikut di terminal untuk mendaftarkan namespace baru tersebut:
   ```bash
   composer dump-autoload
   ```

3. **Aktifkan Modul via Artisan**
   Aktifkan modul agar terdaftar di file `modules_statuses.json`:
   ```bash
   php artisan module:enable NamaModul
   ```
   *(Contoh: `php artisan module:enable ProjectManager`)*

4. **Jalankan Migrasi Modul (Jika Ada)**
   Jika modul memiliki file database migration:
   ```bash
   php artisan module:migrate NamaModul
   ```


# Workflow Automation Module (Laravel Plugin)

This module provides a visual drag-and-drop workflow automation system (similar to n8n) directly integrated into Kreatif CMS.

---

## Key Features

1. **Visual Builder Workspace**:
   * Interactive grid canvas with SVG connection lines.
   * Collapsible left side panel (Components Toolbox) and right side panel (Properties Inspector) to maximize canvas viewport size.
   * Emerald Green (`TRUE`) and Rose Red (`FALSE`) ports for conditional branching paths.

2. **Visual Test Simulator**:
   * **Test Run** button in the header runs a mock execution of the workflow directly in the browser.
   * Highlights running nodes with a yellow pulse ring and completed nodes with a solid green glow.
   * Retractable console panel at the bottom to view execution logs and pretty-printed JSON payloads.

3. **Dynamic Plugin Modules Action Nodes**:
   * Automatically detects and registers custom action nodes from active Laravel plugins/modules:
     * **Brevo** -> `Brevo Email`
     * **AiAssistant** -> `AI Prompt Assistant`
     * **OtpService** -> `Send OTP SMS`
     * **EmailTemplates** -> `Send Template Email`
     * **JobManager** -> `Dispatch Queue Job`
     * **DatabaseManager** -> `Query DB Table`

4. **Hierarchical Workflows**:
   * **Execute Sub-Workflow** node allows you to invoke other workflows, pass parameters, and optionally wait to receive output payloads.

---

## Example Workflow Scriptor

**Scenario**: `Auto Alert & Log New Content`
* **Trigger**: Webhook / Content Created Hook
* **Aksi**:
  1. Trigger -> `Check User Roles`
  2. If Role is `admin` (TRUE Path) -> Route payload to `Database Log` node (Skip email notification).
  3. If Role is not admin (FALSE Path) -> Route payload to `If Conditional` node (`status` equals `published`).
  4. If status is published (TRUE Path) -> Route to `Send Email` node to notify reviewers.

---

## PHP Backend Integration

To trigger and execute any visual workflow programmatically in your controllers, services, or observers:

```php
use Modules\Workflow\Models\Workflow;
use Modules\Workflow\Services\WorkflowEngine;

// 1. Prepare your input payload
$payload = [
    'user_role' => auth()->user()->roles->first()->name ?? 'contributor',
    'status'    => $page->status,
    'title'     => $page->title,
];

// 2. Fetch the active workflow model
$workflow = Workflow::where('name', 'Auto Alert & Log New Content')
                    ->where('is_active', true)
                    ->first();

// 3. Trigger the workflow runner engine
if ($workflow) {
    WorkflowEngine::execute($workflow, $payload);
}
```
