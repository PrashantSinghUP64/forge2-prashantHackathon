<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $org = \App\Models\Organization::create(['name' => 'Acme Corp']);

        $admin = \App\Models\User::create([
            'organization_id' => $org->id,
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        $agents = [];
        for ($i = 1; $i <= 2; $i++) {
            $agents[] = \App\Models\User::create([
                'organization_id' => $org->id,
                'name' => "Agent $i",
                'email' => "agent$i@example.com",
                'password' => bcrypt('password'),
                'role' => 'agent'
            ]);
        }

        $customers = [];
        for ($i = 1; $i <= 2; $i++) {
            $customers[] = \App\Models\User::create([
                'organization_id' => $org->id,
                'name' => "Customer $i",
                'email' => "customer$i@example.com",
                'password' => bcrypt('password'),
                'role' => 'customer'
            ]);
        }

        $statuses = ['open', 'pending', 'resolved', 'closed'];
        $priorities = ['low', 'medium', 'high', 'urgent'];

        for ($i = 1; $i <= 12; $i++) {
            $ticket = \App\Models\Ticket::create([
                'organization_id' => $org->id,
                'requester_id' => $customers[array_rand($customers)]->id,
                'assignee_id' => $agents[array_rand($agents)]->id,
                'subject' => "Issue with system part $i",
                'description' => "We are seeing an error when trying to use part $i of the system. Please help.",
                'status' => $statuses[array_rand($statuses)],
                'priority' => $priorities[array_rand($priorities)],
                'tags' => ['support', "part-$i"]
            ]);

            \App\Models\Comment::create([
                'organization_id' => $org->id,
                'ticket_id' => $ticket->id,
                'user_id' => $ticket->requester_id,
                'body' => 'Here is some more context for the issue.',
                'type' => 'public_reply'
            ]);
        }
    }
}
