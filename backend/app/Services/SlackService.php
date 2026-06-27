<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SlackService
{
    protected string $token;

    public function __construct()
    {
        $this->token = env('SLACK_BOT_TOKEN', '');
    }

    public function notifyNewTicket($ticket, $user)
    {
        $channelId = 'C0BDQ4Y5Q3E'; // pulse deskteam

        $priorityEmoji = match ($ticket->priority) {
            'urgent' => '🔴',
            'high' => '🟠',
            'medium' => '🟡',
            'low' => '🟢',
            default => '⚪',
        };

        $message = "🚨 *New Ticket Alert*\n\n";
        $message .= "*Subject:* {$ticket->subject}\n";
        $message .= "*Priority:* {$priorityEmoji} " . ucfirst($ticket->priority) . "\n";
        $message .= "*Requester:* {$user->name} ({$user->email})\n";
        
        $this->sendMessage($channelId, $message);
    }

    public function notifyComment($ticket, $user, $comment)
    {
        $channelId = 'C0BDQ4Y5Q3E'; // pulse deskteam
        
        $message = "💬 *New Reply on Ticket #{$ticket->id}*\n\n";
        $message .= "*Ticket:* {$ticket->subject}\n";
        $message .= "*From:* {$user->name}\n";
        $message .= "> " . substr($comment->body, 0, 100) . (strlen($comment->body) > 100 ? '...' : '');

        $this->sendMessage($channelId, $message);
    }

    protected function sendMessage($channel, $text)
    {
        try {
            Http::withToken($this->token)->post('https://slack.com/api/chat.postMessage', [
                'channel' => $channel,
                'text' => $text,
            ]);
        } catch (\Exception $e) {
            Log::error('Slack Error: ' . $e->getMessage());
        }
    }
}
