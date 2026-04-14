<?php

namespace Modules\AiAssistant\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\AiAssistant\Services\ScraperService;

class DesignClonerController extends Controller
{
    protected $scraper;

    public function __construct(ScraperService $scraper)
    {
        $this->scraper = $scraper;
    }

    /**
     * Endpoint to scan a website for design details (CSS/Fonts).
     */
    public function scanDesign(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $result = $this->scraper->scrapeDesign($request->url);

        return response()->json($result);
    }

    /**
     * Endpoint for the AI Assistant to request a font download.
     */
    public function downloadFont(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
            'font_name' => 'required|string',
        ]);

        $fileName = $this->scraper->downloadFont($request->url, $request->font_name);

        if ($fileName) {
            return response()->json([
                'success' => true,
                'message' => "Font '{$request->font_name}' has been downloaded and installed in the CMS successfully.",
                'file' => $fileName
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Failed to download font. The source might be protected or unavailable."
        ], 422);
    }
}
