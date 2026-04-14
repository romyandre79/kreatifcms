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

        // 2. Seed Basic UI Translations
        $translations = [
            'en' => [
                'menu' => [
                    'dashboard' => 'Dashboard',
                    'pages' => 'Pages',
                    'blocks' => 'Blocks',
                    'plugins' => 'Plugins',
                    'users' => 'Users',
                    'ai_assistant' => 'AI Assistant',
                ],
                'ui' => [
                    'read_documentation' => 'Read Documentation',
                    'change_language' => 'Switch Language',
                    'profile' => 'Profile',
                    'logout' => 'Log Out',
                    'got_it' => 'Got it, thanks!',
                ]
            ],
            'id' => [
                'menu' => [
                    'dashboard' => 'Dasbor',
                    'pages' => 'Halaman',
                    'blocks' => 'Blok',
                    'plugins' => 'Plugin',
                    'users' => 'Pengguna',
                    'ai_assistant' => 'Asisten AI',
                ],
                'ui' => [
                    'read_documentation' => 'Baca Dokumentasi',
                    'change_language' => 'Ganti Bahasa',
                    'profile' => 'Profil',
                    'logout' => 'Keluar',
                    'got_it' => 'Siap, terima kasih!',
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
