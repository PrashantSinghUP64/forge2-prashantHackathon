<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PulseDeskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_only_sees_tickets_from_their_organization(): void
    {
        [$acmeUser, $acmeTicket] = $this->tenantWithTicket('Acme');
        [, $globexTicket] = $this->tenantWithTicket('Globex');

        Sanctum::actingAs($acmeUser);

        $response = $this->getJson('/api/tickets');

        $response->assertOk()
            ->assertJsonFragment(['id' => $acmeTicket->id])
            ->assertJsonMissing(['id' => $globexTicket->id]);
    }

    public function test_cross_tenant_ticket_lookup_is_blocked(): void
    {
        [$acmeUser] = $this->tenantWithTicket('Acme');
        [, $globexTicket] = $this->tenantWithTicket('Globex');

        Sanctum::actingAs($acmeUser);

        $this->getJson('/api/tickets/'.$globexTicket->id)->assertNotFound();
    }

    public function test_customers_do_not_receive_internal_notes(): void
    {
        [$customer, $ticket] = $this->tenantWithTicket('Acme', 'customer');
        $agent = User::factory()->create([
            'organization_id' => $customer->organization_id,
            'role' => 'agent',
        ]);

        Comment::create([
            'organization_id' => $customer->organization_id,
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'body' => 'Internal context for agents only',
            'type' => 'internal_note',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/tickets/'.$ticket->id)
            ->assertOk()
            ->assertJsonMissing(['body' => 'Internal context for agents only']);
    }

    private function tenantWithTicket(string $name, string $role = 'admin'): array
    {
        $organization = Organization::create(['name' => $name]);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => $role,
        ]);

        $ticket = Ticket::create([
            'organization_id' => $organization->id,
            'requester_id' => $user->id,
            'subject' => $name.' ticket',
            'description' => 'Tenant scoped support case',
            'status' => 'open',
            'priority' => 'high',
            'tags' => ['test'],
            'sla_breach_at' => now()->addHour(),
        ]);

        return [$user, $ticket];
    }
}
