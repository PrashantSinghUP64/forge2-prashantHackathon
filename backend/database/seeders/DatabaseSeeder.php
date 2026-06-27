<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $acme = Organization::create(['name' => 'Acme Corp']);
        $globex = Organization::create(['name' => 'Globex Retail']);

        $admin = $this->user($acme, 'Admin User', 'admin@example.com', 'admin');
        $agents = [
            $this->user($acme, 'Meera Agent', 'agent1@example.com', 'agent'),
            $this->user($acme, 'Rohan Agent', 'agent2@example.com', 'agent'),
        ];
        $customers = [
            $this->user($acme, 'Nisha Customer', 'customer1@example.com', 'customer'),
            $this->user($acme, 'Karan Customer', 'customer2@example.com', 'customer'),
        ];

        $tickets = [
            ['Cannot access billing page', 'The billing page keeps loading forever after the last invoice update.', 'open', 'urgent', ['billing', 'login'], 45],
            ['Refund status question', 'Customer is asking for clarity on a refund promised by finance.', 'pending', 'medium', ['refund'], 620],
            ['Webhook retry failures', 'Webhook events are not retrying after a temporary partner outage.', 'open', 'high', ['integrations'], 130],
            ['New teammate invite bounced', 'Invite email bounced for a new support teammate.', 'resolved', 'low', ['account'], 4000],
            ['Mobile app crash on checkout', 'Checkout crashes on Android after applying a coupon.', 'open', 'urgent', ['mobile', 'checkout'], -35],
            ['CSV export missing rows', 'The weekly CSV export is missing older resolved conversations.', 'pending', 'high', ['reports'], 210],
            ['Change primary contact', 'Customer wants the primary account contact switched this week.', 'closed', 'low', ['account'], 8000],
            ['Priority label mismatch', 'A high-priority ticket appeared as medium in the agent queue.', 'open', 'medium', ['queue'], 900],
            ['SLA timer looks wrong', 'Customer reports a breached ticket still showing as healthy.', 'open', 'high', ['sla'], -90],
            ['Invoice PDF not downloading', 'The invoice download button returns a 500 error.', 'pending', 'urgent', ['billing', 'pdf'], 25],
            ['Customer portal typo', 'There is a typo on the customer portal confirmation screen.', 'resolved', 'low', ['portal'], 5000],
            ['Agent notification delay', 'Assigned tickets take several minutes to appear in notifications.', 'open', 'medium', ['notifications'], 780],
        ];

        foreach ($tickets as $index => [$subject, $description, $status, $priority, $tags, $minutes]) {
            $ticket = Ticket::create([
                'organization_id' => $acme->id,
                'requester_id' => $customers[$index % 2]->id,
                'assignee_id' => $index % 3 === 0 ? null : $agents[$index % 2]->id,
                'subject' => $subject,
                'description' => $description,
                'status' => $status,
                'priority' => $priority,
                'tags' => $tags,
                'sla_breach_at' => now()->addMinutes($minutes),
            ]);

            Comment::create([
                'organization_id' => $acme->id,
                'ticket_id' => $ticket->id,
                'user_id' => $ticket->requester_id,
                'body' => 'Adding context from the customer side so support has the full picture.',
                'type' => 'public_reply',
            ]);

            if ($index % 2 === 0) {
                Comment::create([
                    'organization_id' => $acme->id,
                    'ticket_id' => $ticket->id,
                    'user_id' => $agents[$index % 2]->id,
                    'body' => 'Internal note: checking logs and previous account history before replying.',
                    'type' => 'internal_note',
                ]);
            }

            ActivityLog::create([
                'organization_id' => $acme->id,
                'ticket_id' => $ticket->id,
                'user_id' => $admin->id,
                'action' => 'seeded',
                'description' => 'Seeded demo ticket for judge walkthrough',
            ]);
        }

        $globexCustomer = $this->user($globex, 'Globex Customer', 'globex@example.com', 'customer');
        Ticket::create([
            'organization_id' => $globex->id,
            'requester_id' => $globexCustomer->id,
            'subject' => 'Private Globex tenant ticket',
            'description' => 'This record exists only to prove cross-tenant isolation during tests.',
            'status' => 'open',
            'priority' => 'high',
            'tags' => ['tenant-proof'],
            'sla_breach_at' => now()->addHours(2),
        ]);
    }

    private function user(Organization $organization, string $name, string $email, string $role): User
    {
        return User::create([
            'organization_id' => $organization->id,
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }
}
