<?php

namespace Modules\LanguageSwitcher\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Modules\LanguageSwitcher\Models\Language;
use Modules\LanguageSwitcher\Models\Translation;
use Modules\LanguageSwitcher\Models\Documentation;

class LanguageController extends Controller
{
    /**
     * Display the management dashboard.
     */
    public function index()
    {
        return Inertia::render('LanguageSwitcher::Index', [
            'languages' => Language::orderBy('is_default', 'desc')->get(),
            'translations' => Translation::orderBy('group')->orderBy('key')->get(),
            'documentations' => Documentation::all(),
        ]);
    }

    /**
     * Switch the application locale.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'locale' => 'required|string|exists:languages,code',
        ]);

        Session::put('locale', $request->locale);

        return back();
    }

    /**
     * Store or update a language.
     */
    public function storeLanguage(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:10|unique:languages,code,' . $request->id,
            'name' => 'required|string|max:255',
            'flag' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($request->is_default) {
            Language::where('is_default', true)->update(['is_default' => false]);
        }

        Language::updateOrCreate(
            ['id' => $request->id],
            $request->only(['code', 'name', 'flag', 'is_active', 'is_default'])
        );

        return back()->with('success', 'Language saved successfully.');
    }

    /**
     * Delete a language.
     */
    public function deleteLanguage(Language $language)
    {
        if ($language->is_default) {
            return back()->with('error', 'Cannot delete the default language.');
        }

        $language->delete();
        Translation::where('language_code', $language->code)->delete();

        return back()->with('success', 'Language deleted successfully.');
    }

    /**
     * Store or update a translation.
     */
    public function storeTranslation(Request $request)
    {
        $request->validate([
            'language_code' => 'required|string|exists:languages,code',
            'group' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'required|string',
        ]);

        Translation::updateOrCreate(
            [
                'language_code' => $request->language_code,
                'group' => $request->group,
                'key' => $request->key,
            ],
            ['value' => $request->value]
        );

        return back()->with('success', 'Translation saved successfully.');
    }

    /**
     * Store or update documentation.
     */
    public function storeDocumentation(Request $request)
    {
        $request->validate([
            'key' => 'required|string|max:255',
            'title' => 'required|array',
            'sections' => 'required|array',
        ]);

        Documentation::updateOrCreate(
            ['key' => $request->key],
            [
                'title' => $request->title,
                'sections' => $request->sections,
                'dynamic_data' => $request->dynamic_data ?? [],
            ]
        );

        return back()->with('success', 'Documentation saved successfully.');
    }

    /**
     * Delete documentation.
     */
    public function deleteDocumentation($id)
    {
        Documentation::findOrFail($id)->delete();
        return back()->with('success', 'Documentation deleted successfully.');
    }
}
