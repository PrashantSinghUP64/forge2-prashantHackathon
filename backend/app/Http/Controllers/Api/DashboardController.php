<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function metrics(Request $request)
    {
        $user = $request->user();
        
        $tickets = Ticket::where('organization_id', $user->organization_id)->get();
        
        $openCount = $tickets->where('status', 'open')->count();
        $urgentCount = $tickets->where('priority', 'urgent')->count();
        $breachedCount = $tickets->where('sla_breach_at', '<', now())->whereIn('status', ['open', 'pending'])->count();
        
        return response()->json([
            'open_tickets' => $openCount,
            'urgent_tickets' => $urgentCount,
            'sla_breached' => $breachedCount,
            'total_tickets' => $tickets->count()
        ]);
    }
}
