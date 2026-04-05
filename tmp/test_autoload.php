<?php
require __DIR__ . '/../vendor/autoload.php';

use Modules\PhotoGrid\Providers\PhotoGridServiceProvider;

if (class_exists(PhotoGridServiceProvider::class)) {
    echo "Class found!\n";
} else {
    echo "Class NOT found!\n";
}
