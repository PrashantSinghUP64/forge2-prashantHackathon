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
        
        return response()->json([
            'total_tickets' => $tickets->count(),
            'open_tickets' => $tickets->where('status', 'open')->count(),
            'closed_tickets' => $tickets->whereIn('status', ['resolved', 'closed'])->count(),
            'assigned_tickets' => $tickets->whereNotNull('assignee_id')->count(),
            'recent_activity' => \App\Models\ActivityLog::where('organization_id', $user->organization_id)
                ->with('user')->orderBy('created_at', 'desc')->limit(5)->get()
        ]);
    }
}
