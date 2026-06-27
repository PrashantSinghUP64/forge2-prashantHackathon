<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Comment;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Ticket::where('organization_id', $user->organization_id)
            ->with(['requester', 'assignee']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $ticket = Ticket::where('organization_id', $user->organization_id)
            ->with(['requester', 'assignee', 'comments.user'])
            ->findOrFail($id);

        return response()->json($ticket);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $ticket = Ticket::create([
            'organization_id' => $user->organization_id,
            'requester_id' => $user->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'status' => 'open',
            'priority' => $validated['priority'],
        ]);

        return response()->json($ticket, 201);
    }
    
    public function addComment(Request $request, $id)
    {
        $user = $request->user();
        
        $ticket = Ticket::where('organization_id', $user->organization_id)
            ->findOrFail($id);
            
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
        
        return response()->json($comment->load('user'), 201);
    }
}
