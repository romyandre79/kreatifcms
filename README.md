# Doran Portal CMS

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
