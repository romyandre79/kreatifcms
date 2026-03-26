# Kreatif Portal CMS

A powerful, modular Content Management System built with Laravel 12, Inertia.js, and React.

## 🚀 Key Features

### 🧩 Plugin System
The CMS features a robust, modular plugin architecture that allows for easy extension without modifying core files.
- **Plugin Manager**: Enable or disable modules with a single click.
- **Secure Export**: Export any plugin as a `.zip` file for deployment or sharing.
- **Easy Import**: Upload plugin ZIPs directly from the UI to install new features instantly.
- **Permanent Deletion**: Safely uninstall and remove plugin directories from the server with a single click.
- **PowerShell Fallback**: Native support for Windows environments without the PHP `zip` extension.

### 🍱 Block Editor
A standardized system for creating UI "Blocks" that can be reused across the page builder.
- **Modular Design**: Create reusable UI fragments with their own logic and styles.
- **Schema-driven**: Define block structures that integrate seamlessly with the page builder.

### 🖼️ Media Library & Optimization
- **Automatic WebP Conversion**: (Via ImageConverter Plugin) All JPG and PNG uploads are automatically converted to optimized `.webp` format to ensure fast page loads.
- **Safe Filenames**: Uploaded files are automatically sanitized into SEO-friendly "slugs", preventing path traversal and character encoding issues.
- **Storage Linking**: Automated public storage symlinking for instant media availability.

## 🛡️ Security & Performance Hardening

### 🔍 Deep Code Security Scanner
Every plugin upload is subjected to a real-time security audit:
- **Function Blacklisting**: Scans for dangerous PHP functions like `eval()`, `exec()`, `system()`, and `shell_exec()`.
- **Obfuscation Detection**: Identifies suspicious patterns like `base64_decode` combined with execution triggers.
- **Threat Mitigation**: Blocks installation and purges temporary files immediately if a risk is detected.

### 📦 ZipSlip Protection
- **Path Traversal Prevention**: Both the Plugin Importer and Database Restore feature pre-scan ZIP archives for malicious paths (e.g., `../../`) to ensure system files can never be overwritten by a malicious archive.

### ⚡ Resource Management
- **Memory Safety**: Image processing is capped at a 10MB file size limit to prevent memory exhaustion on shared hosting or resource-constrained environments.

## 🛠️ Tech Stack
- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React, Inertia.js, Tailwind CSS
- **Icons**: Lucide React
- **Module Management**: nwidart/laravel-modules

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   composer install
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env` and configure your database settings.

3. **Database Migration**:
   ```bash
   php artisan migrate
   ```

4. **Storage Link**:
   ```bash
   php artisan storage:link
   ```

5. **Build Assets**:
   ```bash
   npm run build
   ```

6. **Run Dev Server**:
   ```bash
   npm run dev
   ```

---
*Built with ❤️*

## 📝 Recent Updates & Walkthrough

### **1. Page Builder Stability & Fixes**
The Page Builder has been stabilized after resolving several critical runtime and syntax errors.
- **Fixed Builder Crash**: Resolved a syntax error in `Builder.jsx` related to navbar link mapping.
- **Fixed FormBlock ReferenceError**: Corrected an undeclared `fieldsToRender` variable that caused a blank page.
- **Improved Asset Compilation**: All changes are now correctly reflected in compiled assets via `npm run build`.

### **2. Form Builder & Dynamic Forms**
Significant improvements to the Form block and its submission logic.
- **Audit Log Fix**: Made `user_id` nullable in the `audit_logs` table to allow anonymous submissions (e.g., Contact Us).
- **Validation Feedback**: `FormController` now returns specific validation errors (422) instead of generic 500 errors.
- **Form Hooks**:
  - **JS Hook**: Added `On Success JS` to run custom client-side code after submission.
  - **PHP Hook**: Added `onAfterInsert` hook in `ContentEntryController` for server-side actions like sending emails.
- **Hydration**: Form blocks now automatically fetch content type fields from the backend for both builder and public views.

### **3. Navbar Enhancements**
- **Multi-Level Dropdowns**: Support for nested sub-links with mobile-optimized rendering.
- **Custom Code Injection**: Per-block `Custom CSS` and `Custom JS` support for the Navbar.

### **4. Home Page & Media Improvements**
- **Configurable Home Page**: Any page can now be set as the site root via the Page Manager.
- **Premium Start Page**: Replaced the default Laravel welcome page with a stunning Kreatif CMS dashboard.
- **Media Uploads**: Newly uploaded files now appear in the picker immediately without a refresh.

## ✅ Development Task List (Latest)

- [x] Research existing block implementation
- [x] Design FormBlock architecture
- [x] Create FormBlock module structure
- [x] Implement Static Form functionality
- [x] Implement Dynamic Form functionality (Content-Type integration)
- [x] Register FormBlock in the CMS
- [x] Verify implementation
- [x] Debug MediaPickerModal empty state
- [x] Debug Slideshow dynamic content
- [x] Implement configurable Home Page
    - [x] Add `home_page_slug` setting logic
    - [x] Add `setHome` action in Page Manager
    - [x] Update frontend to show home indicator
- [x] Redesign Welcome page into "Kreatif CMS" start page
- [x] Fix Media Picker empty state for Background Image (robust JSON detection)
- [x] Fix Builder Syntax Error (Links map)
- [x] Fix FormBlock ReferenceError (fieldsToRender)
- [x] Fix Audit Log Integrity Constraint (user_id nullable)
- [x] Implement Form Submission Hooks (JS/PHP)
    - [x] Add OnSuccess JS to FormBlock
    - [x] Add OnAfterInsert PHP hook to ContentEntryController
    - [x] Provide Email sending example
- [x] Final Verification
- [x] Fix Media Upload "not showing" immediately after upload
- [x] Fix Form Builder fields disappearing when Content Type is selected
- [x] Fix Page Builder blank page (syntax error in Builder.jsx)
- [x] Implement Navbar multi-dropdown support
- [x] Add Custom CSS and Custom JS support to Navbar block
