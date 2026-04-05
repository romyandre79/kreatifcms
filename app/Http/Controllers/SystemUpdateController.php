<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SystemUpdateController extends Controller
{
    /**
     * Display the system update page.
     */
    public function index()
    {
        return Inertia::render('System/Update', [
            'info' => $this->getUpdateInfo()
        ]);
    }

    /**
     * Check for updates via git.
     */
    public function check()
    {
        try {
            $this->checkConnectivity();
            $this->runCommand(['git', 'fetch', 'origin', 'main']);
            return response()->json([
                'success' => true,
                'info' => $this->getUpdateInfo()
            ]);
        } catch (\Exception $e) {
            $error = $e->getMessage();
            $suggestion = null;

            if (str_contains($error, 'getaddrinfo') || str_contains($error, 'Could not resolve host')) {
                $suggestion = 'Network Error: DNS resolution failed. Check your server\'s internet connection or DNS settings.';
            } elseif (str_contains($error, 'Connection refused') || str_contains($error, 'timed out')) {
                $suggestion = 'Network Error: Could not reach GitHub. Check your firewall or proxy settings.';
            }

            return response()->json([
                'success' => false,
                'error' => $error,
                'suggestion' => $suggestion
            ], 500);
        }
    }

    /**
     * Run the update process.
     */
    public function run()
    {
        $log = [];
        $success = true;

        $commands = [
            'Fetching' => ['git', 'fetch', 'origin', 'main'],
            'Pulling' => ['git', 'pull', 'origin', 'main'],
            'Composer' => ['composer', 'install', '--no-interaction', '--prefer-dist', '--optimize-autoloader'],
            'Migrating' => ['php', 'artisan', 'migrate', '--force'],
            'Optimizing' => ['php', 'artisan', 'optimize:clear'],
        ];

        foreach ($commands as $step => $cmd) {
            try {
                $output = $this->runCommand($cmd);
                $log[] = [
                    'step' => $step,
                    'command' => implode(' ', $cmd),
                    'output' => $output,
                    'status' => 'success'
                ];
            } catch (\Exception $e) {
                $success = false;
                $log[] = [
                    'step' => $step,
                    'command' => implode(' ', $cmd),
                    'output' => $e->getMessage(),
                    'status' => 'error'
                ];
                break; // Stop on first error
            }
        }

        return response()->json([
            'success' => $success,
            'log' => $log,
            'info' => $this->getUpdateInfo()
        ]);
    }

    /**
     * Get current git status info.
     */
    private function getUpdateInfo()
    {
        try {
            $currentCommit = $this->runCommand(['git', 'rev-parse', 'HEAD']);
            $currentDate = $this->runCommand(['git', 'log', '-1', '--format=%cd', '--date=relative']);
            $currentBranch = $this->runCommand(['git', 'branch', '--show-current']);
            
            // Count commits behind origin/main
            $diffCount = $this->runCommand(['git', 'rev-list', '--count', 'HEAD..origin/main']);

            return [
                'current_commit' => trim($currentCommit),
                'current_date' => trim($currentDate),
                'current_branch' => trim($currentBranch),
                'behind_count' => (int)trim($diffCount),
                'is_up_to_date' => (int)trim($diffCount) === 0,
                'last_checked' => now()->toDateTimeString()
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'Git not available or repo not initialized: ' . $e->getMessage(),
                'is_up_to_date' => true // Fallback
            ];
        }
    }

    /**
     * Verify internet connectivity by pinging GitHub.
     */
    private function checkConnectivity()
    {
        // Simple PHP check for network connectivity
        $connected = @fsockopen("www.github.com", 443, $errno, $errstr, 5);
        if (!$connected) {
            throw new \RuntimeException("Unable to reach GitHub (www.github.com:443). Please check your internet connection.");
        }
        fclose($connected);
    }

    /**
     * Run a shell command and return output.
     */
    private function runCommand(array $command)
    {
        $process = new Process($command, base_path());
        $process->setTimeout(300); // 5 minutes
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput() ?: $process->getOutput());
        }

        return $process->getOutput();
    }
}
