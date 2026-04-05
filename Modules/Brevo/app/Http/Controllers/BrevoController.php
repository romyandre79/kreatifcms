<?php

namespace Modules\Brevo\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Brevo\Models\Campaign;
use Modules\Brevo\Models\InboundEmail;
use Modules\Brevo\Services\BrevoService;

class BrevoController extends Controller
{
    protected $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }

    /**
     * Display the marketing dashboard.
     */
    public function index()
    {
        $accountStats = null;
        
        if (!$this->brevoService->isConfigured()) {
            $accountStats = ['error' => 'Brevo API Key not configured. Please go to Plugin Settings.'];
        } else {
            try {
                $response = $this->brevoService->getAccountStats();
                if ($response->successful()) {
                    $accountStats = $response->json();
                } else {
                    $accountStats = ['error' => 'Brevo API Error: ' . ($response->json('message') ?? 'Unknown error')];
                }
            } catch (\Exception $e) {
                \Log::error('Brevo Connection Error: ' . $e->getMessage());
                $accountStats = ['error' => 'Could not connect to Brevo. ' . $e->getMessage()];
            }
        }

        $emailTemplates = [];
        if (\Nwidart\Modules\Facades\Module::has('EmailTemplates') && \Nwidart\Modules\Facades\Module::isEnabled('EmailTemplates')) {
            $emailTemplates = \Modules\EmailTemplates\Models\EmailTemplate::all();
        }

        return Inertia::render('Brevo::Dashboard', [
            'campaigns' => Campaign::latest()->get(),
            'inboundEmails' => InboundEmail::latest()->get(),
            'account' => $accountStats,
            'emailTemplates' => $emailTemplates
        ]);
    }

    /**
     * Store and send a new campaign.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,whatsapp',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'recipients' => 'required|array',
        ]);

        $campaign = Campaign::create($validated);

        try {
            if ($validated['type'] === 'email') {
                $response = $this->brevoService->createEmailCampaign(
                    $validated['name'],
                    $validated['subject'] ?? 'No Subject',
                    $validated['content'],
                    $validated['recipients']
                );
            } else {
                // For WhatsApp, content is the Template ID
                $response = $this->brevoService->createWhatsAppCampaign(
                    $validated['name'],
                    $validated['content'],
                    $validated['recipients']
                );
            }

            if ($response->successful()) {
                $campaign->update([
                    'status' => 'sent',
                    'brevo_id' => $response->json('id')
                ]);
                return redirect()->back()->with('success', 'Marketing campaign initiated successfully.');
            }

            $campaign->update(['status' => 'failed']);
            return redirect()->back()->with('error', 'Brevo API Error: ' . ($response->json('message') ?? $response->body()));

        } catch (\Exception $e) {
            $campaign->update(['status' => 'failed']);
            return redirect()->back()->with('error', 'System Error: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified campaign from history.
     */
    public function destroy($id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();
        
        return redirect()->back()->with('success', 'Campaign record deleted.');
    }
}
