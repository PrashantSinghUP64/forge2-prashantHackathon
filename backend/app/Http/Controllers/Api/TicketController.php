<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Ticket;
use App\Models\User;
use App\Services\SlackService;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = $this->scopedTickets($request)
            ->with(['requester', 'assignee'])
            ->withCount('comments');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assignee') && $user->role !== 'customer') {
            match ($request->assignee) {
                'mine' => $query->where('assignee_id', $user->id),
                'unassigned' => $query->whereNull('assignee_id'),
                default => is_numeric($request->assignee) ? $query->where('assignee_id', $request->assignee) : null,
            };
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->latest()->get()->map(fn (Ticket $ticket) => $this->presentTicket($ticket))
        );
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $ticket = $this->scopedTickets($request)
            ->with([
                'requester',
                'assignee',
                'comments' => fn ($query) => $user->role === 'customer'
                    ? $query->where('type', 'public_reply')->oldest()
                    : $query->oldest(),
                'comments.user',
                'activities.user',
            ])
            ->findOrFail($id);

        return response()->json($this->presentTicket($ticket));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:40',
        ]);

        $ticket = Ticket::create([
            'organization_id' => $user->organization_id,
            'requester_id' => $user->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'status' => 'open',
            'priority' => $validated['priority'],
            'tags' => $validated['tags'] ?? [],
            'sla_breach_at' => $this->slaDeadline($validated['priority']),
        ]);

        $this->activity($ticket, $user->id, 'created', 'Ticket created with priority '.$validated['priority']);

        // Send Slack Notification
        (new SlackService())->notifyNewTicket($ticket, $user);

        return response()->json(
            $this->presentTicket($ticket->load(['requester', 'assignee'])->loadCount('comments')),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role === 'customer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket = Ticket::where('organization_id', $user->organization_id)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'assignee' => 'sometimes|in:all,mine,unassigned',
            'tags' => 'sometimes|array',
            'tags.*' => 'string|max:40',
        ]);

        if (array_key_exists('assignee_id', $validated) && $validated['assignee_id'] !== null) {
            User::where('organization_id', $user->organization_id)
                ->whereIn('role', ['admin', 'agent'])
                ->findOrFail($validated['assignee_id']);
        }

        $before = $ticket->only(['status', 'priority', 'assignee_id']);
        if (array_key_exists('priority', $validated) && $validated['priority'] !== $ticket->priority) {
            $validated['sla_breach_at'] = $this->slaDeadline($validated['priority']);
        }

        $ticket->update($validated);

        foreach (['status', 'priority', 'assignee_id'] as $field) {
            if (array_key_exists($field, $validated) && $before[$field] !== $ticket->{$field}) {
                $this->activity($ticket, $user->id, $field.'_changed', str_replace('_', ' ', ucfirst($field)).' updated');
            }
        }

        return response()->json($this->presentTicket($ticket->fresh(['requester', 'assignee'])->loadCount('comments')));
    }

    public function addComment(Request $request, $id)
    {
        $user = $request->user();
        $ticket = $this->scopedTickets($request)->findOrFail($id);

        $validated = $request->validate([
            'body' => 'required|string',
            'type' => 'required|in:public_reply,internal_note',
        ]);

        if ($validated['type'] === 'internal_note' && $user->role === 'customer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = Comment::create([
            'organization_id' => $user->organization_id,
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'body' => $validated['body'],
            'type' => $validated['type'],
        ]);

        $this->activity($ticket, $user->id, 'commented', 'Added a '.str_replace('_', ' ', $validated['type']));

        // Send Slack Notification for comments
        (new SlackService())->notifyComment($ticket, $user, $comment);

        return response()->json($comment->load('user'), 201);
    }

    public function assign(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role === 'customer') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket = Ticket::where('organization_id', $user->organization_id)->findOrFail($id);
        $assigneeId = $request->integer('assignee_id') ?: $user->id;

        User::where('organization_id', $user->organization_id)
            ->whereIn('role', ['admin', 'agent'])
            ->findOrFail($assigneeId);

        $ticket->update(['assignee_id' => $assigneeId]);
        $this->activity($ticket, $user->id, 'assigned', $assigneeId === $user->id ? 'Claimed the ticket' : 'Reassigned the ticket');

        return response()->json($this->presentTicket($ticket->fresh(['requester', 'assignee'])->loadCount('comments')));
    }

    private function scopedTickets(Request $request)
    {
        $user = $request->user();

        return Ticket::where('organization_id', $user->organization_id)
            ->when($user->role === 'customer', fn ($query) => $query->where('requester_id', $user->id));
    }

    private function presentTicket(Ticket $ticket): array
    {
        $data = $ticket->toArray();
        $deadline = $ticket->sla_breach_at;

        $data['sla'] = [
            'breach_at' => optional($deadline)->toIso8601String(),
            'breached' => $deadline ? $deadline->isPast() && in_array($ticket->status, ['open', 'pending'], true) : false,
            'minutes_remaining' => $deadline ? now()->diffInMinutes($deadline, false) : null,
        ];

        return $data;
    }

    private function slaDeadline(string $priority)
    {
        return match($priority) {
            'critical' => now()->addHour(),
            'high' => now()->addHours(4),
            'medium' => now()->addHours(12),
            'low' => now()->addHours(24),
        };
    }

    private function activity(Ticket $ticket, ?int $userId, string $action, string $description): void
    {
        ActivityLog::create([
            'organization_id' => $ticket->organization_id,
            'ticket_id' => $ticket->id,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
        ]);
    }
}
