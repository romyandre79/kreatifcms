<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('project:duplicate', function (\Modules\ProjectManager\Services\ProjectDuplicator $duplicator, \Modules\ProjectManager\Services\DeploymentService $deploymentService) {
    $filePath = storage_path('app/duplication_request.json');
    if (file_exists($filePath)) {
        $data = json_decode(file_get_contents($filePath), true);
        if (is_array($data)) {
            $type = $data['type'] ?? 'duplicate';

            if ($type === 'deploy' && !empty($data['website_id'])) {
                $website = \Modules\ProjectManager\Models\DeployedWebsite::find($data['website_id']);
                if ($website) {
                    try {
                        $mode = $data['mode'] ?? 'update';
                        $deploymentService->deploy($website, $mode);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("Async deploy command failed: " . $e->getMessage());
                        $deploymentService->updateStatus('failed', 'Error occurred', 100, $e->getMessage());
                        $website->update(['status' => 'failed']);
                    }
                }
            } else {
                $duplicator->duplicate(
                    $data['target_path'],
                    $data['selected_plugins'] ?? [],
                    ['raw_env' => $data['raw_env'] ?? null]
                );
            }
        }
    }
})->purpose('Duplicate the project locally or deploy it to a remote target in the background');
