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
            $response = Http::withOptions(['verify' => false])->get($url);
            if (!$response->successful()) return ['error' => 'Could not reach URL'];
            
            $html = $response->body();
            $baseUrl = parse_url($url, PHP_URL_SCHEME) . '://' . parse_url($url, PHP_URL_HOST);
            
            $fonts = [];
            
            // 1. Look for @font-face in inline styles
            $this->extractFontsFromContent($html, $baseUrl, $fonts);

            // 2. Look for external CSS files
            preg_match_all('/<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']/i', $html, $cssMatches);
            foreach ($cssMatches[1] as $cssUrl) {
                if (!Str::startsWith($cssUrl, 'http')) {
                    $cssUrl = ltrim($cssUrl, '/');
                    $cssUrl = $baseUrl . '/' . $cssUrl;
                }
                
                try {
                    $cssContent = Http::withOptions(['verify' => false])->timeout(5)->get($cssUrl)->body();
                    $this->extractFontsFromContent($cssContent, $baseUrl, $fonts);
                } catch (\Exception $e) {
                    continue;
                }
            }

            // 3. Extract CSS Variables and Pattern-based Styles
            preg_match_all('/--([^:]+):\s*([^;]+);/', $html, $varMatches);
            $vars = [];
            if (!empty($varMatches[1])) {
                foreach ($varMatches[1] as $idx => $name) {
                    $vars[$name] = trim($varMatches[2][$idx]);
                }
            }

            // Extract specific component styles (buttons, header, product cards, etc)
            $customStyles = "";
            // Look for button-like classes
            if (preg_match('/(\.btn[^{]*|\.button[^{]*|\[class\*="btn-"][^{]*)\s*{([^}]+)}/i', $html, $btnMatch)) 
                $customStyles .= "/* Button Style */\n.btn-primary, .btn-cart { {$btnMatch[2]} }\n";
            
            // Look for product/card-like classes
            if (preg_match('/(\.product[^{]*|\.card[^{]*|\.item[^{]*)\s*{([^}]+)}/i', $html, $cardMatch)) 
                $customStyles .= "/* Card Style */\n.product-card, .product { {$cardMatch[2]} }\n";
            
            // Look for navbar/header patterns
            if (preg_match('/(\.navbar[^{]*|\.main-navigation[^{]*|\.header[^{]*)\s*{([^}]+)}/i', $html, $navMatch)) 
                $customStyles .= "/* Navbar Style */\n.navbar { {$navMatch[2]} }\n";
            
            // Look for global border radii and shadows often found in :root or body
            if (preg_match('/:root\s*{([^}]+)}/i', $html, $rootMatch)) {
                if (preg_match_all('/--([a-z0-9-]+-radius|--shadow)[^:]*:\s*([^;]+);/i', $rootMatch[1], $designTokens)) {
                    $customStyles .= "/* Design Tokens */\n:root { " . implode(' ', $designTokens[0]) . " }\n";
                }
            }

            return [
                'url' => $url,
                'detected_font_family' => $fonts[0]['family'] ?? 'Inter',
                'fonts' => array_values($fonts),
                'css_variables' => $vars,
                'custom_styles_hint' => $customStyles
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function extractFontsFromContent(string $content, string $baseUrl, &$fonts)
    {
        // Simple regex for @font-face src: url(...)
        preg_match_all('/@font-face\s*{([^}]+)}/i', $content, $fontFaceBlocks);
        
        foreach ($fontFaceBlocks[1] as $block) {
            preg_match('/font-family:\s*[\'"]?([^\'";]+)/i', $block, $familyMatch);
            preg_match_all('/url\(["\']?([^"\')]+)["\']?\)/i', $block, $urlMatches);
            
            if (!empty($familyMatch[1]) && !empty($urlMatches[1])) {
                $family = trim($familyMatch[1]);
                
                foreach ($urlMatches[1] as $fontUrl) {
                    $fontUrl = trim($fontUrl);
                    
                    // FIX: Handle protocol-relative //
                    if (Str::startsWith($fontUrl, '//')) {
                        $fontUrl = 'https:' . $fontUrl;
                    } 
                    // FIX: Handle fake root-relative for known CDNs (like Doran Gadget issue)
                    else if (Str::startsWith($fontUrl, '/fonts.gstatic.com')) {
                        $fontUrl = 'https:/' . $fontUrl;
                    }
                    // Handle standard relative/absolute
                    else if (!Str::startsWith($fontUrl, 'http')) {
                        $fontUrl = ltrim($fontUrl, '/');
                        $fontUrl = $baseUrl . '/' . $fontUrl;
                    }

                    // Only take the first working URL for this family (usually woff2)
                    if (Str::contains($fontUrl, ['.woff2', '.woff', '.ttf', '.otf'])) {
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
