<?php

namespace Modules\JobManager\Jobs;

use App\Models\ContentType;
use App\Services\SchemaService;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ContentTypeReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(SchemaService $schemaService): void
    {
        $contentTypes = ContentType::all();
        $report = "\n--- Content Type Entry Report (" . now()->toDateTimeString() . ") ---\n";

        foreach ($contentTypes as $ct) {
            $tableName = $schemaService->getTableName($ct->slug);
            try {
                $count = DB::connection('secondary')->table($tableName)->count();
                $report .= "- {$ct->name} ({$ct->slug}): {$count} entries\n";
            } catch (\Exception $e) {
                $report .= "- {$ct->name} ({$ct->slug}): Error or table not found.\n";
            }
        }
        
        $report .= "--------------------------------------------------\n";

        Log::info($report);
    }
}
