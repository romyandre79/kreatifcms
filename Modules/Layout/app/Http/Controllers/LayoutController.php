<?php

namespace Modules\Layout\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SchemaService;
use Modules\ReusableBlock\Models\Block;
use Modules\Layout\Models\Layout;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LayoutController extends Controller
{
    public function index()
    {
        return Inertia::render('Layout/Index', [
            'layouts' => Layout::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('Layout/Editor', [
            'layout' => new Layout([
                'name' => 'New Layout',
                'header_blocks' => [],
                'footer_blocks' => [],
                'theme_data' => [
                    'primaryColor' => '#4f46e5',
                    'secondaryColor' => '#10b981',
                    'fontFamily' => 'Inter',
                    'fontSize' => '16'
                ],
                'access_type' => 'general',
                'roles' => []
            ]),
            'reusableBlocks' => Block::all(),
            'roles' => \DB::table('roles')->pluck('name'),
            'contentTypes' => (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType'))
                ? \Modules\ContentType\Models\ContentType::with('fields')->get()
                : [],
            'availableFonts' => $this->getAvailableFonts()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'header_blocks' => 'nullable|array',
            'footer_blocks' => 'nullable|array',
            'theme_data' => 'nullable|array',
            'access_type' => 'required|in:general,authenticated,role',
            'roles' => 'nullable|array',
            'is_default' => 'boolean'
        ]);

        if ($validated['is_default'] ?? false) {
            Layout::where('is_default', true)->update(['is_default' => false]);
        }

        $layout = Layout::create([
            'name' => $validated['name'],
            'header_blocks' => $validated['header_blocks'] ?? [],
            'footer_blocks' => $validated['footer_blocks'] ?? [],
            'theme_data' => $validated['theme_data'] ?? [],
            'access_type' => $validated['access_type'],
            'roles' => $validated['roles'] ?? [],
            'is_default' => $validated['is_default'] ?? false,
        ]);

        // Create and update CSS file for this layout
        $this->updateCssFile($layout);

        return redirect()->route('layouts.index')->with('success', 'Layout created successfully.');
    }

    public function edit(Layout $layout)
    {
        $schemaService = app(SchemaService::class);
        
        return Inertia::render('Layout/Editor', [
            'layout' => $layout,
            'headerBlocks' => $schemaService->hydrateDynamicBlocks($layout->header_blocks ?? []),
            'footerBlocks' => $schemaService->hydrateDynamicBlocks($layout->footer_blocks ?? []),
            'themeData' => $layout->theme_data ?? [],
            'reusableBlocks' => Block::all()->map(function($rb) use ($schemaService) {
                if (isset($rb->data) && is_array($rb->data)) {
                    $rb->data = $schemaService->hydrateDynamicBlocks($rb->data);
                }
                return $rb;
            }),
            'roles' => \DB::table('roles')->pluck('name'),
            'contentTypes' => (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType'))
                ? \Modules\ContentType\Models\ContentType::with('fields')->get()
                : [],
            'availableFonts' => $this->getAvailableFonts()
        ]);
    }

    public function update(Request $request, Layout $layout)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'header_blocks' => 'nullable|array',
            'footer_blocks' => 'nullable|array',
            'theme_data' => 'nullable|array',
            'access_type' => 'required|in:general,authenticated,role',
            'roles' => 'nullable|array',
            'is_default' => 'boolean'
        ]);

        if ($validated['is_default'] ?? false) {
            Layout::where('is_default', true)->where('id', '!=', $layout->id)->update(['is_default' => false]);
        }

        $layout->update([
            'name' => $validated['name'],
            'header_blocks' => $validated['header_blocks'] ?? [],
            'footer_blocks' => $validated['footer_blocks'] ?? [],
            'theme_data' => $validated['theme_data'] ?? [],
            'access_type' => $validated['access_type'],
            'roles' => $validated['roles'] ?? [],
            'is_default' => $validated['is_default'] ?? false,
        ]);

        $this->updateCssFile($layout);

        return redirect()->back()->with('success', 'Layout updated successfully.');
    }

    public function destroy(Layout $layout)
    {
        if ($layout->is_default) {
            return redirect()->back()->with('error', 'Cannot delete the default layout.');
        }

        // Delete associated CSS file
        $cssFile = public_path("layouts/layout-{$layout->id}.css");
        if (file_exists($cssFile)) {
            unlink($cssFile);
        }

        $layout->delete();
        return redirect()->route('layouts.index')->with('success', 'Layout deleted successfully.');
    }

    public function uploadFont(Request $request)
    {
        $request->validate([
            'font' => 'required|file|extensions:ttf,woff,woff2|max:5120', // Max 5MB
        ]);

        if ($request->hasFile('font')) {
            $file = $request->file('font');
            $fileName = $file->getClientOriginalName();
            $path = public_path('fonts/custom');

            if (!file_exists($path)) {
                mkdir($path, 0755, true);
            }

            $file->move($path, $fileName);
            return redirect()->back()->with('success', 'Font uploaded successfully.');
        }

        return redirect()->back()->with('error', 'Font upload failed.');
    }

    private function getAvailableFonts()
    {
        $defaultFonts = [
            ['name' => 'Inter', 'file' => null],
            ['name' => 'Roboto', 'file' => null],
            ['name' => 'Outfit', 'file' => null],
            ['name' => 'Playfair Display', 'file' => null],
            ['name' => 'Montserrat', 'file' => null],
            ['name' => 'System', 'file' => null],
        ];

        $customFontsPath = public_path('fonts/custom');
        $customFonts = [];

        if (file_exists($customFontsPath)) {
            $files = scandir($customFontsPath);
            foreach ($files as $file) {
                $ext = pathinfo($file, PATHINFO_EXTENSION);
                if (in_array($ext, ['ttf', 'woff', 'woff2'])) {
                    $fontName = pathinfo($file, PATHINFO_FILENAME);
                    $customFonts[] = [
                        'name' => $fontName,
                        'file' => $file,
                        'url' => asset("fonts/custom/{$file}")
                    ];
                }
            }
        }

        return array_merge($defaultFonts, $customFonts);
    }

    private function updateCssFile(Layout $layout)
    {
        $theme = $layout->theme_data ?? [];
        $css = "/* Layout CSS: {$layout->name} */\n\n";

        // Inject font-faces
        $fonts = $this->getAvailableFonts();
        foreach ($fonts as $font) {
            if ($font['file']) {
                $ext = pathinfo($font['file'], PATHINFO_EXTENSION);
                $format = $ext === 'woff2' ? 'woff2' : ($ext === 'woff' ? 'woff' : 'truetype');
                $url = asset("fonts/custom/{$font['file']}");
                $css .= "@font-face {\n";
                $css .= "    font-family: '{$font['name']}';\n";
                $css .= "    src: url('{$url}') format('{$format}');\n";
                $css .= "    font-weight: normal;\n";
                $css .= "    font-style: normal;\n";
                $css .= "    font-display: swap;\n";
                $css .= "}\n\n";
            }
        }

        // Global styles
        $fontFamily = $theme['fontFamily'] ?? 'Inter';
        $fontSize = $theme['fontSize'] ?? '16';
        $primary = $theme['primaryColor'] ?? '#4f46e5';
        $secondary = $theme['secondaryColor'] ?? '#10b981';

        $css .= ":root {\n";
        $css .= "    --primary-color: {$primary};\n";
        $css .= "    --secondary-color: {$secondary};\n";
        $css .= "    --base-font-size: {$fontSize}px;\n";
        $css .= "    --font-family: '{$fontFamily}', sans-serif;\n";
        $css .= "}\n\n";

        $css .= "body {\n";
        $css .= "    font-family: var(--font-family);\n";
        $css .= "    font-size: var(--base-font-size);\n";
        $css .= "}\n";

        // Custom CSS
        if (!empty($theme['customCss'])) {
            $css .= "\n/* Custom CSS */\n";
            $css .= $theme['customCss'] . "\n";
        }

        $cssDir = public_path('layouts');
        if (!file_exists($cssDir)) {
            mkdir($cssDir, 0755, true);
        }
        $cssFile = $cssDir . "/layout-{$layout->id}.css";
        file_put_contents($cssFile, $css);
    }
}
