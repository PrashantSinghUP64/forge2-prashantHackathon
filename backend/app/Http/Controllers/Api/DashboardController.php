<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function metrics(Request $request)
    {
        $user = $request->user();
        $tickets = Ticket::where('organization_id', $user->organization_id)->get();
        $activeTickets = $tickets->whereIn('status', ['open', 'pending']);
        $breachedCount = $activeTickets->filter(fn ($ticket) => $ticket->sla_breach_at && $ticket->sla_breach_at->isPast())->count();

        return response()->json([
            'total_tickets' => $tickets->count(),
            'open_tickets' => $tickets->where('status', 'open')->count(),
            'urgent_tickets' => $tickets->where('priority', 'urgent')->count(),
            'sla_breached' => $breachedCount,
            'resolved_tickets' => $tickets->whereIn('status', ['resolved', 'closed'])->count(),
            'breach_rate' => $activeTickets->count() > 0 ? round(($breachedCount / $activeTickets->count()) * 100) : 0,
            'by_status' => $tickets->groupBy('status')->map->count(),
            'by_priority' => $tickets->groupBy('priority')->map->count(),
        ]);
    }
}
