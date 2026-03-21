<?php
$blocks = [
    'Hero' => ['id' => 'hero', 'name' => 'Hero Section', 'icon' => 'Image', 'desc' => 'Large banner with bold headline, subtitle, and CTA'],
    'Navbar' => ['id' => 'navbar', 'name' => 'Navigation Bar', 'icon' => 'Menu', 'desc' => 'Horizontal logo, menu items, and dropdowns'],
    'TextBlock' => ['id' => 'text', 'name' => 'Rich Text', 'icon' => 'AlignLeft', 'desc' => 'Markdown editor for paragraphs, lists, and headings'],
    'ImageBlock' => ['id' => 'image', 'name' => 'Single Image', 'icon' => 'ImagePlus', 'desc' => 'Full width or container width image with optional caption'],
    'FeatureGrid' => ['id' => 'feature_grid', 'name' => 'Feature Grid', 'icon' => 'LayoutGrid', 'desc' => 'Grid of features with icons, titles, and descriptions'],
    'Slideshow' => ['id' => 'slideshow', 'name' => 'Slideshow', 'icon' => 'PlaySquare', 'desc' => 'Auto-playing carousel of images and text overlays'],
    'ContentList' => ['id' => 'content_list', 'name' => 'Dynamic Content', 'icon' => 'Grid', 'desc' => 'Display a list or grid of items from a Content Type'],
    'ReusableBlock' => ['id' => 'reusable_block', 'name' => 'Reusable Block', 'icon' => 'Copy', 'desc' => 'Insert a globally saved Reusable Block']
];
$others = [
    'Security' => 'security',
    'Seo' => 'system',
    'ImageConverter' => 'system'
];
foreach($blocks as $mod => $meta) {
    $p = __DIR__ . '/Modules/' . $mod . '/module.json';
    if(file_exists($p)) {
        $d = json_decode(file_get_contents($p), true);
        $d['plugin_type'] = 'block';
        $d['block_meta'] = $meta;
        file_put_contents($p, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo "Updated $mod\n";
    }
}
foreach($others as $mod => $type) {
    $p = __DIR__ . '/Modules/' . $mod . '/module.json';
    if(file_exists($p)) {
        $d = json_decode(file_get_contents($p), true);
        $d['plugin_type'] = $type;
        file_put_contents($p, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo "Updated $mod\n";
    }
}
echo "All modules patched.\n";
