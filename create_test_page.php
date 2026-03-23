<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;

$page = Page::create([
    'title' => 'Test Page',
    'slug' => 'test-page',
    'blocks' => [],
    'is_published' => true
]);

echo "Test page created at /test-page\n";
