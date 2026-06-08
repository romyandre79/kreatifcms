<?php

namespace Modules\LanguageSwitcher\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\LanguageSwitcher\Models\Language;
use Modules\LanguageSwitcher\Models\Translation;
use Modules\LanguageSwitcher\Models\Documentation;

class LocalizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Languages
        $en = Language::updateOrCreate(['code' => 'en'], [
            'name' => 'English',
            'flag' => '🇺🇸',
            'is_default' => true,
            'is_active' => true,
        ]);

        $id = Language::updateOrCreate(['code' => 'id'], [
            'name' => 'Indonesia',
            'flag' => '🇮🇩',
            'is_default' => false,
            'is_active' => true,
        ]);

        // 2. Seed UI Translations
        $translations = [
            'en' => [
                'menu' => [
                    'dashboard' => 'Dashboard',
                    'pages' => 'Pages',
                    'blocks' => 'Blocks',
                    'layouts' => 'Layouts',
                    'content_types' => 'Content Types',
                    'media' => 'Media',
                    'users' => 'Users',
                    'roles' => 'Roles',
                    'languages' => 'Languages',
                    'settings' => 'Settings',
                    'ai_assistant' => 'AI Assistant',
                    'documentation' => 'Documentation',
                    'plugins' => 'Plugins',
                ],
                'general' => [
                    'save' => 'Save',
                    'cancel' => 'Cancel',
                    'delete' => 'Delete',
                    'edit' => 'Edit',
                    'update' => 'Update',
                    'create' => 'Create',
                    'submit' => 'Submit',
                    'search' => 'Search',
                    'results' => 'Results',
                    'actions' => 'Actions',
                    'success' => 'Success',
                    'error' => 'Error',
                    'warning' => 'Warning',
                    'info' => 'Information',
                    'loading' => 'Loading...',
                    'please_wait' => 'Please wait',
                    'confirm' => 'Confirm',
                    'add_new' => 'Add New',
                    'close' => 'Close',
                    'back' => 'Back',
                    'view' => 'View',
                    'apply' => 'Apply',
                    'install' => 'Install',
                    'scan' => 'Scan',
                    'preview' => 'Preview',
                    'status' => 'Status',
                    'active' => 'Active',
                    'inactive' => 'Inactive',
                    'default' => 'Default',
                    'no_data' => 'No data found',
                    'are_you_sure' => 'Are you sure?',
                    'yes' => 'Yes',
                    'no' => 'No',
                ],
                'form' => [
                    'name' => 'Name',
                    'title' => 'Title',
                    'slug' => 'Slug',
                    'description' => 'Description',
                    'value' => 'Value',
                    'key' => 'Key',
                    'group' => 'Group',
                    'type' => 'Type',
                    'label' => 'Label',
                    'placeholder' => 'Placeholder',
                    'required' => 'Required',
                    'optional' => 'Optional',
                ],
                'auth' => [
                    'login' => 'Login',
                    'register' => 'Register',
                    'email' => 'Email',
                    'password' => 'Password',
                    'remember_me' => 'Remember Me',
                    'forgot_password' => 'Forgot Password',
                    'reset_password' => 'Reset Password',
                    'profile' => 'Profile',
                    'logout' => 'Logout',
                    'sign_in' => 'Sign In',
                    'sign_up' => 'Sign Up',
                ],
                'content' => [
                    'fields' => 'Fields',
                    'entries' => 'Entries',
                    'build' => 'Build',
                    'add_entry' => 'Add Entry',
                    'manage_content' => 'Manage Content',
                    'meta_title' => 'Meta Title',
                    'meta_description' => 'Meta Description',
                ],
                'layout' => [
                    'header' => 'Header',
                    'footer' => 'Footer',
                    'theme' => 'Theme',
                    'custom_css' => 'Custom CSS',
                    'primary_color' => 'Primary Color',
                    'secondary_color' => 'Secondary Color',
                    'font_family' => 'Font Family',
                    'font_size' => 'Font Size',
                ],
                'ui' => [
                    'read_documentation' => 'Read Documentation',
                    'change_language' => 'Switch Language',
                    'got_it' => 'Got it, thanks!',
                ],
                'dashboard' => [
                    'dashboard_title' => 'Dynamic Dashboard',
                    'add_widget' => 'Add Widget',
                    'initializing' => 'Initializing your premium workspace...',
                    'empty_dashboard_title' => 'Your dashboard is empty',
                    'empty_dashboard_desc' => 'Start by adding dynamic widgets to track your content types, aggregate data, and visualize trends!',
                    'add_first_widget' => 'Add Your First Widget',
                    'remove_widget' => 'Remove Widget',
                    'remove_widget_confirm' => 'Are you sure you want to remove this widget from your dashboard?',
                ],
                'auth' => [
                    'login' => 'Log in',
                    'register' => 'Register',
                    'remember_me' => 'Remember me',
                    'forgot_password' => 'Forgot your password?',
                    'already_registered' => 'Already registered?',
                ],
                'welcome' => [
                    'welcome_head' => 'Welcome to Kreatif CMS',
                    'return_to_dashboard' => 'Return to Dashboard',
                    'get_started' => 'Get Started',
                    'version_badge' => 'Version 2.0 Now Available',
                    'hero_title_1' => 'Build',
                    'hero_title_2' => 'Something Beautiful',
                    'hero_title_3' => 'in Minutes.',
                    'hero_desc' => 'The ultimate headless CMS experience for Laravel. Fast, flexible, and completely visual.',
                    'start_building' => 'Start Building for Free',
                    'explore_features' => 'Explore Features',
                    'feature_builder_title' => 'Visual Page Builder',
                    'feature_builder_desc' => 'Drag and drop components to build stunning landing pages.',
                    'feature_content_title' => 'Dynamic Content Types',
                    'feature_content_desc' => 'Define your own data structures. From products to portfolios.',
                    'feature_plugin_title' => 'Plugin Ecosystem',
                    'feature_plugin_desc' => 'Extend your CMS with 1-click plugins. Forms, SEO, Media, and more.',
                    'dashboard_preview' => 'Dashboard Preview',
                    'powered_by' => 'Powered by Laravel v:laravel (PHP v:php)',
                    'support' => 'Support',
                ],
                'profile' => [
                    'profile_info' => 'Profile Information',
                    'profile_info_desc' => "Update your account's profile information and email address.",
                    'email_unverified' => 'Your email address is unverified.',
                    'resend_verification' => 'Click here to re-send the verification email.',
                    'verification_sent' => 'A new verification link has been sent to your email address.',
                    'update_password' => 'Update Password',
                    'update_password_desc' => 'Ensure your account is using a long, random password to stay secure.',
                ]
            ],
            'id' => [
                'menu' => [
                    'dashboard' => 'Dasbor',
                    'pages' => 'Halaman',
                    'blocks' => 'Blok',
                    'layouts' => 'Layout',
                    'content_types' => 'Tipe Konten',
                    'media' => 'Media',
                    'users' => 'Pengguna',
                    'roles' => 'Role',
                    'languages' => 'Bahasa',
                    'settings' => 'Pengaturan',
                    'ai_assistant' => 'Asisten AI',
                    'documentation' => 'Dokumentasi',
                    'plugins' => 'Plugin',
                ],
                'general' => [
                    'save' => 'Simpan',
                    'cancel' => 'Batal',
                    'delete' => 'Hapus',
                    'edit' => 'Edit',
                    'update' => 'Perbarui',
                    'create' => 'Buat',
                    'submit' => 'Kirim',
                    'search' => 'Cari',
                    'results' => 'Hasil',
                    'actions' => 'Aksi',
                    'success' => 'Sukses',
                    'error' => 'Error',
                    'warning' => 'Peringatan',
                    'info' => 'Informasi',
                    'loading' => 'Memuat...',
                    'please_wait' => 'Mohon tunggu',
                    'confirm' => 'Konfirmasi',
                    'add_new' => 'Tambah Baru',
                    'close' => 'Tutup',
                    'back' => 'Kembali',
                    'view' => 'Lihat',
                    'apply' => 'Terapkan',
                    'install' => 'Instal',
                    'scan' => 'Scan',
                    'preview' => 'Pratinjau',
                    'status' => 'Status',
                    'active' => 'Aktif',
                    'inactive' => 'Tidak Aktif',
                    'default' => 'Default',
                    'no_data' => 'Data tidak ditemukan',
                    'are_you_sure' => 'Apakah Anda yakin?',
                    'yes' => 'Ya',
                    'no' => 'Tidak',
                ],
                'form' => [
                    'name' => 'Nama',
                    'title' => 'Judul',
                    'slug' => 'Slug',
                    'description' => 'Deskripsi',
                    'value' => 'Nilai',
                    'key' => 'Kunci',
                    'group' => 'Grup',
                    'type' => 'Tipe',
                    'label' => 'Label',
                    'placeholder' => 'Placeholder',
                    'required' => 'Wajib diisi',
                    'optional' => 'Opsional',
                ],
                'auth' => [
                    'login' => 'Masuk',
                    'register' => 'Daftar',
                    'email' => 'Email',
                    'password' => 'Kata Sandi',
                    'remember_me' => 'Ingat Saya',
                    'forgot_password' => 'Lupa Kata Sandi',
                    'reset_password' => 'Atur Ulang Kata Sandi',
                    'profile' => 'Profil',
                    'logout' => 'Keluar',
                    'sign_in' => 'Masuk',
                    'sign_up' => 'Daftar',
                ],
                'content' => [
                    'fields' => 'Field',
                    'entries' => 'Entri',
                    'build' => 'Bangun',
                    'add_entry' => 'Tambah Entri',
                    'manage_content' => 'Kelola Konten',
                    'meta_title' => 'Meta Title',
                    'meta_description' => 'Meta Description',
                ],
                'layout' => [
                    'header' => 'Header',
                    'footer' => 'Footer',
                    'theme' => 'Tema',
                    'custom_css' => 'CSS Kustom',
                    'primary_color' => 'Warna Primer',
                    'secondary_color' => 'Warna Sekunder',
                    'font_family' => 'Font Family',
                    'font_size' => 'Ukuran Font',
                ],
                'ui' => [
                    'read_documentation' => 'Baca Dokumentasi',
                    'change_language' => 'Ganti Bahasa',
                    'got_it' => 'Siap, terima kasih!',
                ],
                'dashboard' => [
                    'dashboard_title' => 'Panel Dinamis',
                    'add_widget' => 'Tambah Widget',
                    'initializing' => 'Menyiapkan ruang kerja premium Anda...',
                    'empty_dashboard_title' => 'Panel Anda masih kosong',
                    'empty_dashboard_desc' => 'Mulai dengan menambahkan widget dinamis untuk melacak tipe konten, agregasi data, dan visualisasi tren!',
                    'add_first_widget' => 'Tambah Widget Pertama',
                    'remove_widget' => 'Hapus Widget',
                    'remove_widget_confirm' => 'Apakah Anda yakin ingin menghapus widget ini dari panel Anda?',
                ],
                'auth' => [
                    'login' => 'Masuk',
                    'register' => 'Daftar',
                    'remember_me' => 'Ingat saya',
                    'forgot_password' => 'Lupa kata sandi?',
                    'already_registered' => 'Sudah punya akun?',
                ],
                'welcome' => [
                    'welcome_head' => 'Selamat Datang di Kreatif CMS',
                    'return_to_dashboard' => 'Kembali ke Panel',
                    'get_started' => 'Mulai Sekarang',
                    'version_badge' => 'Versi 2.0 Kini Tersedia',
                    'hero_title_1' => 'Bangun',
                    'hero_title_2' => 'Sesuatu yang Indah',
                    'hero_title_3' => 'dalam Hitungan Menit.',
                    'hero_desc' => 'Pengalaman headless CMS terbaik untuk Laravel. Cepat, fleksibel, dan sepenuhnya visual.',
                    'start_building' => 'Mulai Bangun Gratis',
                    'explore_features' => 'Jelajahi Fitur',
                    'feature_builder_title' => 'Pembangun Halaman Visual',
                    'feature_builder_desc' => 'Tarik dan lepas komponen untuk membangun halaman arahan yang menakjubkan.',
                    'feature_content_title' => 'Tipe Konten Dinamis',
                    'feature_content_desc' => 'Tentukan struktur data Anda sendiri. Dari produk hingga portofolio.',
                    'feature_plugin_title' => 'Ekosistem Plugin',
                    'feature_plugin_desc' => 'Perluas CMS Anda dengan plugin sekali klik. Formulir, SEO, Media, dan lainnya.',
                    'dashboard_preview' => 'Pratinjau Panel',
                    'powered_by' => 'Didukung oleh Laravel v:laravel (PHP v:php)',
                    'support' => 'Dukungan',
                ],
                'profile' => [
                    'profile_info' => 'Informasi Profil',
                    'profile_info_desc' => "Perbarui informasi profil akun dan alamat email Anda.",
                    'email_unverified' => 'Alamat email Anda belum terverifikasi.',
                    'resend_verification' => 'Klik di sini untuk mengirim ulang email verifikasi.',
                    'verification_sent' => 'Tautan verifikasi baru telah dikirim ke alamat email Anda.',
                    'update_password' => 'Perbarui Kata Sandi',
                    'update_password_desc' => 'Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.',
                ]
            ]
        ];

        foreach ($translations as $lang => $groups) {
            foreach ($groups as $group => $keys) {
                foreach ($keys as $key => $value) {
                    Translation::updateOrCreate(
                        ['language_code' => $lang, 'group' => $group, 'key' => $key],
                        ['value' => $value]
                    );
                }
            }
        }

        // 3. Seed Documentation
        Documentation::updateOrCreate(['key' => 'dashboard'], [
            'title' => [
                'en' => 'Welcome to Kreatif CMS',
                'id' => 'Selamat Datang di Kreatif CMS',
            ],
            'sections' => [
                [
                    'title' => ['en' => 'Getting Started', 'id' => 'Memulai'],
                    'content' => [
                        'en' => 'This dashboard gives you a bird\'s-eye view of your entire system. You can add widgets to track content, visualize data, and manage your daily operations.',
                        'id' => 'Dasbor ini memberikan tampilan menyeluruh dari seluruh sistem Anda. Anda dapat menambahkan widget untuk melacak konten, memvisualisasikan data, dan mengelola operasional harian Anda.',
                    ]
                ],
                [
                    'title' => ['en' => 'Dynamic Widgets', 'id' => 'Widget Dinamis'],
                    'content' => [
                        'en' => 'Click "Add Widget" to customize your view. You can choose from various data sources including your Custom Content Types.',
                        'id' => 'Klik "Tambah Widget" untuk menyesuaikan tampilan Anda. Anda dapat memilih dari berbagai sumber data termasuk Konten Kustom Anda.',
                    ]
                ]
            ]
        ]);

        Documentation::updateOrCreate(['key' => 'ai.settings'], [
            'title' => [
                'en' => 'AI Assistant Configuration',
                'id' => 'Konfigurasi Asisten AI',
            ],
            'sections' => [
                [
                    'title' => ['en' => 'System Default Model', 'id' => 'Model Default Sistem'],
                    'content' => [
                        'en' => 'The **System Default** is the central brain of your CMS. Whenever a plugin needs AI assistance, it routes here.',
                        'id' => '**Default Sistem** adalah otak pusat dari CMS Anda. Setiap kali plugin membutuhkan bantuan AI, permintaan akan diarahkan ke sini.',
                    ]
                ],
                [
                    'title' => ['en' => 'Provider Setup', 'id' => 'Pengaturan Provider'],
                    'content' => [
                        'en' => 'Configure Google Gemini, OpenAI, or Ollama to power your AI features.',
                        'id' => 'Konfigurasikan Google Gemini, OpenAI, atau Ollama untuk memperkuat fitur AI Anda.',
                    ]
                ]
            ]
        ]);
    }
}
