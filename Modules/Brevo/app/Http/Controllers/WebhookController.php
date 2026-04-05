<?php

namespace Modules\Brevo\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Brevo\Models\InboundEmail;
use Modules\Brevo\Models\Campaign;

class WebhookController extends Controller
{
    /**
     * Handle inbound email webhooks from Brevo.
     */
    public function inboundEmail(Request $request)
    {
        // Brevo sends a JSON payload for inbound emails
        $data = $request->all();

        // Standard Brevo Inbound Email Format
        InboundEmail::create([
            'from_email' => $data['Sender'] ?? $data['from'] ?? 'Unknown',
            'from_name' => $data['SenderName'] ?? $data['from_name'] ?? null,
            'subject' => $data['Subject'] ?? $data['subject'] ?? null,
            'content_html' => $data['RawHtmlBody'] ?? $data['html'] ?? null,
            'content_text' => $data['RawTextBody'] ?? $data['text'] ?? null,
            'received_at' => now(),
            'metadata' => $data
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle WhatsApp/Email status updates (delivered, opened, clicked).
     */
    public function statusUpdate(Request $request)
    {
        $event = $request->input('event');
        $messageId = $request->input('messageId') ?? $request->input('uuid');

        if ($messageId) {
            // Find the campaign that matches this message ID
            $campaign = Campaign::where('brevo_id', $messageId)->first();
            
            if ($campaign instanceof Campaign) {
                $stats = $campaign->stats ?: [];
                $stats[$event] = ($stats[$event] ?? 0) + 1;
                $campaign->update(['stats' => $stats]);
            }
        }

        return response()->json(['status' => 'success']);
    }
}
