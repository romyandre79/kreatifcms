<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\EmailTemplates\Models\EmailTemplate;
use Nwidart\Modules\Facades\Module;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetLink = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        // Check if EmailTemplates module is active
        if (Module::isEnabled('EmailTemplates')) {
            $template = EmailTemplate::where('slug', 'forgot-password')->first();
            
            if ($template) {
                $subject = $this->replacePlaceholders($template->subject, $notifiable, $resetLink);
                $content = $this->replacePlaceholders($template->content, $notifiable, $resetLink);

                return (new MailMessage)
                    ->subject($subject)
                    ->view('notifications.email', [
                        'content' => $content
                    ]) // Use the blade view we created
                    ->line($content); // Fallback
            }
        }

        // Default Laravel Reset Password Notification content if no template or module disabled
        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $resetLink)
            ->line('This password reset link will expire in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }

    /**
     * Replace placeholders in template.
     */
    protected function replacePlaceholders($text, $user, $resetLink)
    {
        $placeholders = [
            '{{ name }}' => $user->name,
            '{{ email }}' => $user->email,
            '{{ reset_link }}' => $resetLink,
            '{{ app_name }}' => config('app.name'),
        ];

        return str_replace(array_keys($placeholders), array_values($placeholders), $text);
    }
}
