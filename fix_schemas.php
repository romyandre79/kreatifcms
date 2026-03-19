<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ContentType;
use App\Services\SchemaService;

$schemaService = app(SchemaService::class);
$contentTypes = ContentType::all();

foreach ($contentTypes as $contentType) {
    echo "Updating schema for: {$contentType->name}\n";
    $schemaService->updateSchema($contentType);
}

echo "Done!\n";
