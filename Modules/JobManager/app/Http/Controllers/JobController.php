<?php

namespace Modules\JobManager\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\JobManager\Jobs\SampleBackgroundJob;

class JobController extends Controller
{
    public function index()
    {
        $jobs = DB::table('jobs')->get();
        $failedJobs = DB::table('failed_jobs')->get();

        return Inertia::render('JobManager/Index', [
            'jobs' => $jobs,
            'failedJobs' => $failedJobs,
        ]);
    }

    public function dispatch()
    {
        SampleBackgroundJob::dispatch("Manually triggered job at " . now());

        return redirect()->back()->with('success', 'Background job dispatched successfully!');
    }
}
