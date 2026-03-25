<?php

namespace Modules\JobManager\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\JobManager\Models\ScheduledJob;

class ScheduledJobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ScheduledJob::updateOrCreate(
            ['name' => 'System Heartbeat'],
            [
                'command_code' => "\\Illuminate\\Support\\Facades\\Log::info('UI Scheduler Heartbeat: Service is active.');",
                'type' => 'php',
                'cron' => '* * * * *',
                'is_active' => true,
            ]
        );
        
        ScheduledJob::updateOrCreate(
            ['name' => 'Daily Content Report'],
            [
                'command_code' => "Modules\\JobManager\\Jobs\\ContentTypeReportJob",
                'type' => 'artisan',
                'cron' => '0 0 * * *',
                'is_active' => true,
            ]
        );
    }
}
