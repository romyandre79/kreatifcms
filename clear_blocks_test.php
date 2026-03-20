<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;

$page = Page::where('slug', 'welcome')->first();
if ($page) {
    $page->blocks = [];
    $page->save();
    echo "Blocks cleared for welcome page.\n";
} else {
    echo "Welcome page not found.\n";
}
