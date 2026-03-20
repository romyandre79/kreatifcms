<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;

$pages = Page::where('slug', 'welcome')->get();
foreach ($pages as $page) {
    echo "ID: {$page->id}, Slug: {$page->slug}, Published: {$page->is_published}, Blocks Count: " . count($page->blocks) . "\n";
}
