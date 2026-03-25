<?php

namespace Modules\JobManager\Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\Queue;
use Modules\JobManager\Jobs\SampleBackgroundJob;
use Illuminate\Foundation\Testing\RefreshDatabase;

class JobManagerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_dispatches_sample_job()
    {
        Queue::fake();

        // Perform login since the route has auth middleware
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('jobmanager.dispatch'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        Queue::assertPushed(SampleBackgroundJob::class);
    }
}
