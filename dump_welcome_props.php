<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;
use App\Services\SchemaService;

$slug = 'welcome';
$page = Page::where('slug', $slug)->first();
$pageData = $page ? $page->toArray() : null;
$schemaService = app(SchemaService::class);

if ($pageData) {
    $pageData['blocks'] = $schemaService->hydrateDynamicBlocks($pageData['blocks']);
}

$reusableBlocks = \Modules\ReusableBlock\Models\Block::all()->map(function($rb) use ($schemaService) {
    $data = is_string($rb->data) ? json_decode($rb->data, true) : $rb->data;
    if (is_array($data)) {
        $rb->data = $schemaService->hydrateDynamicBlocks($data);
    }
    return $rb;
});

// Mock getGlobalLayout and getGlobalSeo
$header = \App\Models\Setting::where('module', 'layout')->where('key', 'header')->first();
$footer = \App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first();
$headerBlocks = $header ? json_decode($header->value, true) : [];
$footerBlocks = $footer ? json_decode($footer->value, true) : [];

$layout = [
    'header' => $schemaService->hydrateDynamicBlocks($headerBlocks),
    'footer' => $schemaService->hydrateDynamicBlocks($footerBlocks),
    'seo' => [
        'site_name' => \App\Models\Setting::get('seo', 'site_name', 'Kreatif CMS'),
        'title_separator' => \App\Models\Setting::get('seo', 'title_separator', ' | '),
        'google_analytics_id' => \App\Models\Setting::get('seo', 'google_analytics_id', ''),
        'default_meta_description' => \App\Models\Setting::get('seo', 'meta_description', ''),
    ]
];

file_put_contents('C:/lara/www/kreatifcms/storage/welcome_props_dump.json', json_encode([
    'page' => $pageData,
    'reusableBlocks' => $reusableBlocks,
    'layout' => $layout
], JSON_PRETTY_PRINT));

echo "Props dumped to storage/welcome_props_dump.json\n";
