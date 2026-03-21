const fs = require('fs');
const path = require('path');

const blocks = {
    'Hero': { id: 'hero', name: 'Hero Section', icon: 'Image', desc: 'Large banner with bold headline, subtitle, and CTA' },
    'Navbar': { id: 'navbar', name: 'Navigation Bar', icon: 'Menu', desc: 'Horizontal logo, menu items, and dropdowns' },
    'TextBlock': { id: 'text', name: 'Rich Text', icon: 'AlignLeft', desc: 'Markdown editor for paragraphs, lists, and headings' },
    'ImageBlock': { id: 'image', name: 'Single Image', icon: 'ImagePlus', desc: 'Full width or container width image with optional caption' },
    'FeatureGrid': { id: 'feature_grid', name: 'Feature Grid', icon: 'LayoutGrid', desc: 'Grid of features with icons, titles, and descriptions' },
    'Slideshow': { id: 'slideshow', name: 'Slideshow', icon: 'PlaySquare', desc: 'Auto-playing carousel of images and text overlays' },
    'ContentList': { id: 'content_list', name: 'Dynamic Content', icon: 'Grid', desc: 'Display a list or grid of items from a Content Type' },
    'ReusableBlock': { id: 'reusable_block', name: 'Reusable Block', icon: 'Copy', desc: 'Insert a globally saved Reusable Block' }
};

const others = {
    'Security': 'security',
    'Seo': 'system',
    'ImageConverter': 'system'
};

for (const [mod, meta] of Object.entries(blocks)) {
    const p = path.join(__dirname, 'Modules', mod, 'module.json');
    if(fs.existsSync(p)){
        let d = JSON.parse(fs.readFileSync(p, 'utf-8'));
        d.plugin_type = 'block';
        d.block_meta = meta;
        fs.writeFileSync(p, JSON.stringify(d, null, 4));
        console.log(`Updated ${mod}`);
    } else {
        console.log(`Missing ${mod}`);
    }
}

for (const [mod, type] of Object.entries(others)) {
    const p = path.join(__dirname, 'Modules', mod, 'module.json');
    if(fs.existsSync(p)){
        let d = JSON.parse(fs.readFileSync(p, 'utf-8'));
        d.plugin_type = type;
        fs.writeFileSync(p, JSON.stringify(d, null, 4));
        console.log(`Updated ${mod}`);
    } else {
        console.log(`Missing ${mod}`);
    }
}
console.log('All modules patched.');
