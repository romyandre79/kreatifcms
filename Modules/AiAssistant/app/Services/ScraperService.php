<?php

namespace Modules\AiAssistant\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ScraperService
{
    /**
     * Download a font from a URL and save it to the custom fonts directory.
     */
    public function downloadFont(string $url, string $fontName): ?string
    {
        try {
            $response = Http::withOptions(['verify' => false])->timeout(30)->get($url);
            
            if (!$response->successful()) {
                \Log::error("Font download failed. Status: " . $response->status() . " URL: " . $url);
                return null;
            }

            // Determine extension from URL or content-type
            $path = parse_url($url, PHP_URL_PATH);
            $extension = pathinfo($path, PATHINFO_EXTENSION);
            if (!$extension || !in_array($extension, ['woff2', 'woff', 'ttf', 'otf'])) {
                $contentType = $response->header('Content-Type');
                $extension = Str::contains($contentType, 'woff2') ? 'woff2' : 
                            (Str::contains($contentType, 'woff') ? 'woff' : 
                            (Str::contains($contentType, 'truetype') ? 'ttf' : 'ttf'));
            }

            $fileName = Str::slug($fontName) . '.' . $extension;
            $directory = public_path('fonts/custom');

            if (!File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            $fullPath = $directory . DIRECTORY_SEPARATOR . $fileName;
            File::put($fullPath, $response->body());

            return $fileName;
        } catch (\Exception $e) {
            \Log::error("Font download exception: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Deep scrape a website for font files and CSS variables.
     */
    public function scrapeDesign(string $url): array
    {
        try {
            $response = Http::withOptions(['verify' => false])->timeout(45)->get($url);
            if (!$response->successful()) return ['error' => 'Could not reach URL: ' . $response->status()];
            
            $html = $response->body();
            $baseUrl = parse_url($url, PHP_URL_SCHEME) . '://' . parse_url($url, PHP_URL_HOST);
            
            $fonts = [];
            $allStyles = "";
            
            // 1. Extract inline styles
            preg_match_all('/<style[^>]*>(.*?)<\/style>/is', $html, $inlineStyles);
            foreach ($inlineStyles[1] as $style) {
                $allStyles .= $style . "\n";
            }

            // 2. Look for external CSS files
            preg_match_all('/<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']/i', $html, $cssMatches);
            foreach ($cssMatches[1] as $cssUrl) {
                if (!Str::startsWith($cssUrl, 'http')) {
                    $cssUrl = ltrim($cssUrl, '/');
                    $cssUrl = $baseUrl . '/' . $cssUrl;
                }
                
                try {
                    $cssContent = Http::withOptions(['verify' => false])->timeout(10)->get($cssUrl)->body();
                    $allStyles .= $cssContent . "\n";
                } catch (\Exception $e) {
                    continue;
                }
            }

            // 3. Extract Fonts from collected styles
            $this->extractFontsFromContent($allStyles, $baseUrl, $fonts);

            // 4. Extract CSS Variables
            preg_match_all('/--([^:]+):\s*([^;]+);/', $allStyles, $varMatches);
            $vars = [];
            if (!empty($varMatches[1])) {
                foreach ($varMatches[1] as $idx => $name) {
                    $val = trim($varMatches[2][$idx]);
                    if (strlen($val) < 100) { // Avoid huge blob variables
                        $vars[$name] = $val;
                    }
                }
            }

            // 5. Extract Advanced Component Styles
            $customStylesHint = $this->extractAdvancedStyles($allStyles);

            return [
                'url' => $url,
                'detected_font_family' => $fonts[array_key_first($fonts)]['family'] ?? 'Plus Jakarta Sans',
                'fonts' => array_values($fonts),
                'css_variables' => $vars,
                'custom_styles_hint' => $customStylesHint
            ];
        } catch (\Exception $e) {
            \Log::error("ScrapeDesign Error: " . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Extracts complex design patterns from CSS content.
     */
    private function extractAdvancedStyles(string $css): string
    {
        $hint = "/* AI Scraper High-Fidelity Hints */\n\n";

        // A. Background Patterns (Gradients & Colors)
        if (preg_match_all('/(background|background-image|background-color):\s*([^;!]+)/i', $css, $bgMatches)) {
            $gradients = array_filter($bgMatches[2], fn($m) => str_contains($m, 'gradient'));
            if (!empty($gradients)) {
                $hint .= "/* Detected Gradients */\n";
                foreach (array_unique(array_slice($gradients, 0, 5)) as $g) {
                    $hint .= "/* Possible Brand Gradient: */ " . trim($g) . ";\n";
                }
                $hint .= "\n";
            }
        }

        // B. Branding Transforms & Special Effects
        $patterns = [
            'Transforms' => '/transform:\s*([^;]+)/i',
            'Box Shadows' => '/box-shadow:\s*([^;]+)/i',
            'Transitions' => '/transition:\s*([^;]+)/i',
        ];

        foreach ($patterns as $label => $regex) {
            if (preg_match_all($regex, $css, $matches)) {
                $unique = array_unique($matches[1]);
                if (!empty($unique)) {
                    $hint .= "/* Detected {$label} */\n";
                    foreach (array_slice($unique, 0, 3) as $m) {
                        $hint .= "/* Example: */ " . trim($m) . ";\n";
                    }
                    $hint .= "\n";
                }
            }
        }

        // C. Component Specific Logic (Header/Nav/Buttons)
        $components = [
            'Header/Navbar' => '/(\.navbar|\.header|\.main-nav|\.menu)[^{]*{[^}]*(?:background|height|padding)[^}]*}/i',
            'Buttons' => '/(\.btn|\.button|\[class\*="btn-"])[^{]*{[^}]*(?:background|border-radius|font-weight)[^}]*}/i',
            'Product Cards' => '/(\.product|\.card|\.item)[^{]*{[^}]*(?:box-shadow|border|margin)[^}]*}/i',
        ];

        foreach ($components as $label => $regex) {
            if (preg_match_all($regex, $css, $matches)) {
                $hint .= "/* Component Style: {$label} */\n";
                // Get the longest matches as they usually contain more definitions
                $results = array_unique($matches[0]);
                usort($results, fn($a, $b) => strlen($b) - strlen($a));
                foreach (array_slice($results, 0, 3) as $m) {
                    $hint .= $m . "\n";
                }
                $hint .= "\n";
            }
        }

        return $hint;
    }

    private function extractFontsFromContent(string $content, string $baseUrl, &$fonts)
    {
        // Improved regex for @font-face src: url(...)
        preg_match_all('/@font-face\s*{([^}]+)}/i', $content, $fontFaceBlocks);
        
        foreach ($fontFaceBlocks[1] as $block) {
            preg_match('/font-family:\s*[\'"]?([^\'";]+)/i', $block, $familyMatch);
            // Search for all URLs, focusing on woff2/woff
            preg_match_all('/url\(["\']?([^"\')]+)["\']?\)/i', $block, $urlMatches);
            
            if (!empty($familyMatch[1]) && !empty($urlMatches[1])) {
                $family = trim($familyMatch[1]);
                
                foreach ($urlMatches[1] as $fontUrl) {
                    $fontUrl = trim($fontUrl);
                    
                    if (Str::startsWith($fontUrl, '//')) {
                        $fontUrl = 'https:' . $fontUrl;
                    } 
                    else if (Str::startsWith($fontUrl, '/fonts.gstatic.com')) {
                        $fontUrl = 'https:/' . $fontUrl;
                    }
                    else if (!Str::startsWith($fontUrl, 'http')) {
                        $fontUrl = ltrim($fontUrl, '/');
                        // Resolve relative paths if needed? Simple baseUrl prepending for now
                        if (!Str::startsWith($fontUrl, ['data:', 'blob:'])) {
                            $fontUrl = $baseUrl . '/' . $fontUrl;
                        }
                    }

                    if (Str::contains($fontUrl, ['.woff2', '.woff', '.ttf', '.otf']) && !Str::contains($fontUrl, 'data:')) {
                        $fonts[$family] = [
                            'family' => $family,
                            'url' => $fontUrl,
                            'is_installed' => File::exists(public_path('fonts/custom/' . Str::slug($family) . '.woff2')) 
                                            || File::exists(public_path('fonts/custom/' . Str::slug($family) . '.ttf'))
                        ];
                        break; 
                    }
                }
            }
        }
    }
}
