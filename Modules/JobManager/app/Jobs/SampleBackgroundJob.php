<?php

namespace Modules\JobManager\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class SampleBackgroundJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected string $message)
    {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        \Illuminate\Support\Facades\Log::info("SampleBackgroundJob starting: " . $this->message);
        
        // Simulate background work
        sleep(5);
        
        \Illuminate\Support\Facades\Log::info("SampleBackgroundJob finished: " . $this->message);
    }
}
