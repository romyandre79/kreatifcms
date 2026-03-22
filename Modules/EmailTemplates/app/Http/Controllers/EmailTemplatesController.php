<?php

namespace Modules\EmailTemplates\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\EmailTemplates\Models\EmailTemplate;

class EmailTemplatesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('EmailTemplates/Index', [
            'templates' => EmailTemplate::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('EmailTemplates/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:email_templates,slug',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        EmailTemplate::create($validated);

        return redirect()->route('email-templates.index')
            ->with('message', 'Email template created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmailTemplate $emailTemplate): Response
    {
        return Inertia::render('EmailTemplates/Edit', [
            'template' => $emailTemplate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmailTemplate $emailTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:email_templates,slug,' . $emailTemplate->id,
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $emailTemplate->update($validated);

        return redirect()->route('email-templates.index')
            ->with('message', 'Email template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmailTemplate $emailTemplate): RedirectResponse
    {
        $emailTemplate->delete();

        return redirect()->route('email-templates.index')
            ->with('message', 'Email template deleted successfully.');
    }
}
