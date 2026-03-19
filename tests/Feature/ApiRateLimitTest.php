<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiRateLimitTest extends TestCase
{
    /**
     * Test general API rate limiting.
     */
    public function test_api_rate_limiting()
    {
        // Hit the API multipe times
        for ($i = 0; $i < 60; $i++) {
            $response = $this->getJson('/api/content-types');
            if ($response->status() === 429) {
                break;
            }
        }

        // The 61st request should be throttled (or earlier if rate limit is lower)
        $response = $this->getJson('/api/content-types');
        $response->assertStatus(429);
    }

    /**
     * Test login rate limiting.
     */
    public function test_login_rate_limiting()
    {
        // Hit the login endpoint multiple times
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'nonexistent@example.com',
                'password' => 'password',
            ]);
            if ($response->status() === 429) {
                break;
            }
        }

        // The 6th request should be throttled
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password',
        ]);
        $response->assertStatus(429);
    }
}
