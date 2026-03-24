<?php

namespace Modules\JobManager\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\JobManager\Jobs\SampleBackgroundJob;

use Modules\JobManager\Models\ScheduledJob;

class JobController extends Controller
{
    public function index()
    {
        if (class_exists('\Nwidart\Modules\Facades\Module') && !\Nwidart\Modules\Facades\Module::isEnabled('JobManager')) {
            abort(404);
        }

        $jobs = DB::table('jobs')->get();
        $failedJobs = DB::table('failed_jobs')->get();
        $scheduledJobs = ScheduledJob::all();

        return Inertia::render('JobManager/Index', [
            'jobs' => $jobs,
            'failedJobs' => $failedJobs,
            'scheduledJobs' => $scheduledJobs,
        ]);
    }

    public function storeScheduled(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'command_code' => 'required|string',
            'type' => 'required|in:php,artisan',
            'cron' => 'required|string',
            'is_active' => 'boolean',
        ]);

        ScheduledJob::create($validated);

        return redirect()->back()->with('success', 'Scheduled job created successfully!');
    }

    public function updateScheduled(Request $request, ScheduledJob $scheduledJob)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'command_code' => 'required|string',
            'type' => 'required|in:php,artisan',
            'cron' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $scheduledJob->update($validated);

        return redirect()->back()->with('success', 'Scheduled job updated successfully!');
    }

    public function destroyScheduled(ScheduledJob $scheduledJob)
    {
        $scheduledJob->delete();
        return redirect()->back()->with('success', 'Scheduled job deleted successfully!');
    }

    public function dispatch()
    {
        SampleBackgroundJob::dispatch("Manually triggered job at " . now());

        return redirect()->back()->with('success', 'Background job dispatched successfully!');
    }
}
