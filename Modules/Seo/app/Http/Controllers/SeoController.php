<?php

namespace Modules\Seo\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    /**
     * Display the SEO settings page.
     */
    public function index()
    {
        $settings = [
            'google_analytics_id' => \App\Models\Setting::get('seo', 'google_analytics_id', ''),
            'meta_description' => \App\Models\Setting::get('seo', 'meta_description', ''),
            'site_name' => \App\Models\Setting::get('seo', 'site_name', 'Kreatif CMS'),
            'title_separator' => \App\Models\Setting::get('seo', 'title_separator', ' | '),
        ];

        return \Inertia\Inertia::render('Seo/Settings', [
            'settings' => $settings
        ]);
    }

    /**
     * Update the SEO settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'google_analytics_id' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'site_name' => 'required|string',
            'title_separator' => 'required|string',
        ]);

        foreach ($validated as $key => $value) {
            \App\Models\Setting::set('seo', $key, $value);
        }

        return back()->with('success', 'SEO settings updated successfully.');
    }
}
