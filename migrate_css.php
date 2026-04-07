<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$css = <<<'EOD'
/* Tunas Alfin Style Navbar (Diagonal White/Red) */
nav.sticky, nav.relative {
    background: linear-gradient(115deg, #ffffff 35%, #b11616 35%) !important;
    border-bottom: 3px solid #8e1818 !important;
    overflow: hidden;
    height: 80px !important;
    transition: all 0.3s ease;
}

/* Diagonal Shadow Transition */
nav.sticky::after, nav.relative::after {
    content: '';
    position: absolute;
    top: 0;
    left: 35.1%;
    height: 100%;
    width: 2px;
    background: rgba(0,0,0,0.5);
    box-shadow: -8px 0 15px rgba(0,0,0,0.4);
    transform: skewX(-25deg);
    z-index: 1;
}

/* Ensure Logo/Branding on White Side stays Dark Red */
#nav-section-current-logo a,
#nav-section-current-logo span {
    color: #b11616 !important;
    position: relative;
    z-index: 5;
}

/* Desktop Menu Links Styling (White on Red Side) */
#nav-section-current-links a,
#nav-section-current-buttons a {
    color: #ffffff !important;
    text-transform: uppercase !important;
    font-weight: 800 !important;
    font-size: 11px !important;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 5;
    padding: 0 15px !important;
}

/* Dropdown Sub-Menu Styling (White Card) */
nav .group\/nav > div > div {
    background: #ffffff !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
    overflow: hidden !important;
}
nav .group\/nav ul a {
    color: #374151 !important;
    text-transform: none !important;
    font-weight: 600 !important;
    border-bottom: 1px solid #f3f4f6;
}
nav .group\/nav ul a:hover {
    background: #fff5f5 !important;
    color: #b11616 !important;
}

/* Mobile Menu Reset (White background on mobile) */
@media (max-width: 768px) {
    nav.sticky, nav.relative {
        background: #ffffff !important;
        height: auto !important;
        background-image: none !important;
    }
    nav.sticky::after { display: none; }
    nav a, nav span {
        color: #374151 !important;
        text-transform: none !important;
    }
}
EOD;

$layout = \Modules\Layout\Models\Layout::find(1);
if ($layout) {
    $themeData = $layout->theme_data ?: [];
    $themeData['customCss'] = $css;
    $layout->theme_data = $themeData;
    $layout->save();
    echo "Layout updated successfully.\n";
} else {
    echo "Layout not found.\n";
}
