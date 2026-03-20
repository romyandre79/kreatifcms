<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LayoutController extends Controller
{
    public function index()
    {
        $header = Setting::where('module', 'layout')->where('key', 'header')->first();
        $footer = Setting::where('module', 'layout')->where('key', 'footer')->first();

        return Inertia::render('Layout/Editor', [
            'headerBlocks' => $header ? json_decode($header->value, true) : [],
            'footerBlocks' => $footer ? json_decode($footer->value, true) : [],
            'reusableBlocks' => \App\Models\Block::all()
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'header' => 'nullable|array',
            'footer' => 'nullable|array',
        ]);

        if ($request->has('header')) {
            Setting::updateOrCreate(
                ['module' => 'layout', 'key' => 'header'],
                ['value' => json_encode($request->input('header'))]
            );
        }

        if ($request->has('footer')) {
            Setting::updateOrCreate(
                ['module' => 'layout', 'key' => 'footer'],
                ['value' => json_encode($request->input('footer'))]
            );
        }

        return redirect()->back()->with('success', 'Global layout updated successfully.');
    }
}
