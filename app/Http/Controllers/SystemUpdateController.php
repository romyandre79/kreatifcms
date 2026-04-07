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
            $updateUrl = env('SYSTEM_UPDATE_URL', 'https://github.com/romyandre79/kreatifcms.git');
            if (!str_ends_with($updateUrl, '.git')) $updateUrl .= '.git';
            $this->runCommand(['git', 'fetch', $updateUrl, 'main']);
            return response()->json([
                'success' => true,
                'info' => $this->getUpdateInfo()
            ]);
        } catch (\Exception $e) {
            $error = $e->getMessage();
            $suggestion = null;

            if (str_contains($error, 'getaddrinfo') || str_contains($error, 'Could not resolve host') || str_contains($error, 'thread failed to start')) {
                $suggestion = 'Network/System Error: DNS resolution or threading failed. This sometimes happens on Windows when the web server user lacks socket permissions. Check your server\'s internet connection, permissions, or antivirus settings.';
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
    public function run(Request $request)
    {
        $log = [];
        $success = true;
        $method = $request->input('method', 'git');

        if ($method === 'zip') {
            return $this->runZipUpdate();
        }

        if ($method === 'local') {
            return $this->runLocalZipUpdate();
        }

        $updateUrl = env('SYSTEM_UPDATE_URL', 'https://github.com/romyandre79/kreatifcms.git');
        if (!str_ends_with($updateUrl, '.git')) $updateUrl .= '.git';

        $php = PHP_BINARY;
        $ini = php_ini_loaded_file();
        $tempDir = storage_path('app/temp');
        if (!is_dir($tempDir)) @mkdir($tempDir, 0755, true);
        $phpBase = array_merge([$php], ($ini ? ['-c', $ini] : []), ["-d", "sys_temp_dir=$tempDir"]);

        $composer = $this->getComposerBinary($phpBase);

        $commands = [
            'Fetching' => ['git', 'fetch', $updateUrl, 'main'],
            'Switching to Main' => ['git', 'checkout', 'main'],
            'Pulling' => ['git', 'pull', $updateUrl, 'main', '--no-rebase'],
            'Composer' => array_merge($composer, ['install', '--no-interaction', '--prefer-dist', '--optimize-autoloader']),
            'Migrating' => array_merge($phpBase, ['artisan', 'migrate', '--force']),
            'Optimizing' => array_merge($phpBase, ['artisan', 'optimize:clear']),
        ];

        foreach ($commands as $step => $cmd) {
            try {
                if ($step === 'Migrating' || $step === 'Optimizing') {
                    $artisanCmd = ($step === 'Migrating') ? 'migrate' : 'optimize:clear';
                    $artisanParams = ($step === 'Migrating') ? ['--force' => true] : [];
                    
                    Artisan::call($artisanCmd, $artisanParams);
                    $output = Artisan::output();
                    
                    $log[] = [
                        'step' => $step,
                        'command' => "Artisan::call({$artisanCmd})",
                        'output' => $output,
                        'status' => 'success'
                    ];
                    continue;
                }

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
                    'command' => is_array($cmd) ? implode(' ', $cmd) : "Internal Command",
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
     * Fallback update via ZIP download from GitHub.
     */
    public function runZipUpdate()
    {
        $log = [];
        try {
            $updateUrl = env('SYSTEM_UPDATE_URL', 'https://github.com/romyandre79/kreatifcms.git');
            $zipUrl = str_replace('.git', '', $updateUrl) . '/archive/refs/heads/main.zip';
            $tempPath = storage_path('app/temp/update_' . time());
            if (!is_dir($tempPath)) mkdir($tempPath, 0755, true);
            $zipFile = $tempPath . '/main.zip';

            // 1. Download
            $log[] = ['step' => 'Download', 'command' => "GET {$zipUrl}", 'output' => "Downloading update package...", 'status' => 'success'];
            $content = @file_get_contents($zipUrl);
            if (!$content) throw new \Exception("Failed to download ZIP update from GitHub.");
            file_put_contents($zipFile, $content);

            // 1.1 Store version info
            $latestSha = $this->getRemoteLatestCommit();
            if ($latestSha) {
                file_put_contents(base_path('.version'), json_encode([
                    'commit' => $latestSha,
                    'date' => now()->toDateTimeString(),
                    'method' => 'zip'
                ]));
            }

            return $this->applyZipUpdate($zipFile, $tempPath);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'log' => $log,
                'error' => $e->getMessage()
            ], 500);
        } finally {
            if (isset($tempPath)) $this->deleteTempDirectory($tempPath);
        }
    }

    /**
     * Offline update via manually placed ZIP file.
     */
    public function runLocalZipUpdate()
    {
        $log = [];
        try {
            $zipFile = storage_path('app/updates/update.zip');
            if (!file_exists($zipFile)) throw new \Exception("Manual update file not found at storage/app/updates/update.zip");

            $tempPath = storage_path('app/temp/update_local_' . time());
            if (!is_dir($tempPath)) mkdir($tempPath, 0755, true);

            $log[] = ['step' => 'Local File', 'command' => 'fs::check', 'output' => "Found local update package at " . basename($zipFile), 'status' => 'success'];

            return $this->applyZipUpdate($zipFile, $tempPath);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'log' => $log,
                'error' => $e->getMessage()
            ], 500);
        } finally {
            if (isset($tempPath)) $this->deleteTempDirectory($tempPath);
            // Optionally delete the local zip after success? User might want to keep it.
        }
    }

    /**
     * Extract and apply files from a ZIP archive.
     */
    private function applyZipUpdate($zipFile, $tempPath)
    {
        $log = [];

        // 2. Extract
        $log[] = ['step' => 'Extract', 'command' => "ZipArchive::extract", 'output' => "Extracting files...", 'status' => 'success'];
        $zip = new \ZipArchive();
        if ($zip->open($zipFile) === TRUE) {
            $zip->extractTo($tempPath);
            $zip->close();
        } else {
            throw new \Exception("Failed to open the ZIP file.");
        }

        // 3. Move Files (The github zip has a top-level dir, local might not)
        $extractedDir = $tempPath;
        $dirs = glob($tempPath . '/*', GLOB_ONLYDIR);
        if (!empty($dirs)) $extractedDir = $dirs[0];

        $log[] = ['step' => 'Install', 'command' => "filesystem::copy", 'output' => "Overwriting system files (Excluding Modules)...", 'status' => 'success'];
        $this->copyDirectory($extractedDir, base_path(), ['.env', 'storage', 'node_modules', 'vendor', '.git', 'Modules', 'composer.json', 'composer.lock', 'package-lock.json']);

        // 3.1 Specialized Composer Sync
        $log[] = ['step' => 'Composer Sync', 'command' => "composer::merge", 'output' => "Merging core dependencies...", 'status' => 'success'];
        $this->syncComposerJson($extractedDir . '/composer.json', base_path('composer.json'));

        $php = PHP_BINARY;
        $ini = php_ini_loaded_file();
        $tempDir = storage_path('app/temp');
        if (!is_dir($tempDir)) @mkdir($tempDir, 0755, true);
        $phpBase = array_merge([$php], ($ini ? ['-c', $ini] : []), ["-d", "sys_temp_dir=$tempDir"]);

        $composer = $this->getComposerBinary($phpBase);

        // 4. Post-Update Commands
        $commands = [
            'Composer' => array_merge($composer, ['install', '--no-interaction', '--prefer-dist', '--optimize-autoloader']),
            'Migrating' => array_merge($phpBase, ['artisan', 'migrate', '--force']),
            'Optimizing' => array_merge($phpBase, ['artisan', 'optimize:clear']),
        ];

        foreach ($commands as $step => $cmd) {
            try {
                if ($step === 'Migrating' || $step === 'Optimizing') {
                    $artisanCmd = ($step === 'Migrating') ? 'migrate' : 'optimize:clear';
                    $artisanParams = ($step === 'Migrating') ? ['--force' => true] : [];
                    
                    Artisan::call($artisanCmd, $artisanParams);
                    $output = Artisan::output();
                    
                    $log[] = [
                        'step' => $step,
                        'command' => "Artisan::call({$artisanCmd})",
                        'output' => $output,
                        'status' => 'success'
                    ];
                    continue;
                }

                $output = $this->runCommand($cmd);
                $log[] = ['step' => $step, 'command' => implode(' ', $cmd), 'output' => $output, 'status' => 'success'];
            } catch (\Exception $e) {
                $log[] = ['step' => $step, 'command' => is_array($cmd) ? implode(' ', $cmd) : "Internal Command", 'output' => "Optional step failed: " . $e->getMessage(), 'status' => 'warning'];
            }
        }

        return response()->json([
            'success' => true,
            'log' => $log,
            'info' => $this->getUpdateInfo()
        ]);
    }

    /**
     * Merge core dependencies from update while preserving local module PSR-4.
     */
    private function syncComposerJson($srcPath, $dstPath)
    {
        if (!file_exists($srcPath) || !file_exists($dstPath)) return;

        $src = json_decode(file_get_contents($srcPath), true);
        $dst = json_decode(file_get_contents($dstPath), true);

        if (!$src || !$dst) return;

        // Fields to update from core (everything except selective autoload)
        $fieldsToSync = ['require', 'require-dev', 'scripts', 'config', 'extra', 'minimum-stability', 'prefer-stable'];
        foreach ($fieldsToSync as $field) {
            if (isset($src[$field])) {
                $dst[$field] = $src[$field];
            }
        }

        // Handle PSR-4: Keep existing Modules namespaces, but update others (App, Database, etc.)
        if (isset($src['autoload']['psr-4'])) {
            foreach ($src['autoload']['psr-4'] as $namespace => $path) {
                // If it's NOT a module namespace, update it from core
                if (!str_starts_with($namespace, 'Modules\\') || $namespace === 'Modules\\CorporateTheme\\') {
                    $dst['autoload']['psr-4'][$namespace] = $path;
                }
            }
        }

        // Save back with pretty print
        file_put_contents($dstPath, json_encode($dst, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    /**
     * Move files from one directory to another.
     */
    private function copyDirectory($src, $dst, $exclude = [])
    {
        $dir = opendir($src);
        @mkdir($dst);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..') && !in_array($file, $exclude)) {
                if (is_dir($src . '/' . $file)) {
                    $this->copyDirectory($src . '/' . $file, $dst . '/' . $file, $exclude);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }

    /**
     * Recursive directory deletion.
     */
    private function deleteTempDirectory($dir) {
        if (!is_dir($dir)) return;
        $files = array_diff(scandir($dir), array('.','..'));
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? $this->deleteTempDirectory("$dir/$file") : unlink("$dir/$file");
        }
        return rmdir($dir);
    }

    /**
     * Get technical diagnostics about the environment.
     */
    public function diagnostics()
    {
        try {
            $whoami = $this->runCommand(['whoami']);
            $phpUser = get_current_user();
            $os = PHP_OS;
            
            // Check basic DNS
            $dnsOk = checkdnsrr('github.com', 'A');
            
            // Check proxy from env
            $proxy = [
                'http_proxy' => getenv('http_proxy') ?: getenv('HTTP_PROXY'),
                'https_proxy' => getenv('https_proxy') ?: getenv('HTTPS_PROXY'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'system_user' => trim($whoami),
                    'php_user' => $phpUser,
                    'os' => $os,
                    'dns_github_ok' => $dnsOk,
                    'proxy' => $proxy,
                    'php_version' => PHP_VERSION,
                    'git_version' => trim($this->runCommand(['git', '--version'])),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current git status info.
     */
    private function getUpdateInfo()
    {
        $currentCommit = null;
        $currentDate = null;
        $currentBranch = 'main';
        $behindCount = 0;
        $isUpToDate = true;
        $error = null;

        // 1. Try Git first
        try {
            $currentCommit = trim($this->runCommand(['git', 'rev-parse', 'HEAD']));
            $currentDate = trim($this->runCommand(['git', 'log', '-1', '--format=%cd', '--date=relative']));
            $currentBranch = trim($this->runCommand(['git', 'branch', '--show-current'])) ?: 'main';
        } catch (\Exception $e) {
            // Git failed (common after ZIP update or on servers without git)
            // 2. Fallback to .version file
            if (file_exists(base_path('.version'))) {
                $vData = json_decode(file_get_contents(base_path('.version')), true);
                $currentCommit = $vData['commit'] ?? null;
                $currentDate = ($vData['date'] ?? null) . ' (via update)';
            } else {
                $error = 'Version info not available (Git/Version file missing).';
            }
        }

        // 3. Compare with Remote (API for ZIP, Fetch for Git)
        try {
            $remoteSha = $this->getRemoteLatestCommit();
            if ($remoteSha && $currentCommit) {
                $isUpToDate = (substr($remoteSha, 0, 7) === substr($currentCommit, 0, 7));
                $behindCount = $isUpToDate ? 0 : 1; // Simplified count for API-based check
            }
        } catch (\Exception $e) {
            // Update check failed, assume up to date for now
        }

        // Check for manual update file
        $localZip = storage_path('app/updates/update.zip');

        return [
            'current_commit' => $currentCommit ? substr($currentCommit, 0, 7) : 'Unknown',
            'current_date' => $currentDate ?: 'Unknown',
            'current_branch' => $currentBranch,
            'behind_count' => $behindCount,
            'is_up_to_date' => $isUpToDate,
            'last_checked' => now()->toDateTimeString(),
            'error' => $error,
            'local_zip' => [
                'exists' => file_exists($localZip),
                'size' => file_exists($localZip) ? round(filesize($localZip) / 1024 / 1024, 2) . ' MB' : 0,
                'date' => file_exists($localZip) ? date("Y-m-d H:i:s", filemtime($localZip)) : null
            ]
        ];
    }

    /**
     * Get the latest commit SHA from the GitHub repository API.
     */
    private function getRemoteLatestCommit()
    {
        try {
            $updateUrl = env('SYSTEM_UPDATE_URL', 'https://github.com/romyandre79/kreatifcms');
            $repo = str_replace(['https://github.com/', '.git'], '', $updateUrl);
            $apiUrl = "https://api.github.com/repos/{$repo}/commits/main";

            $context = stream_context_create([
                'http' => [
                    'header' => "User-Agent: KreatifCMS-Updater\r\n",
                    'timeout' => 5
                ]
            ]);

            $response = @file_get_contents($apiUrl, false, $context);
            if ($response) {
                $data = json_decode($response, true);
                return $data['sha'] ?? null;
            }
        } catch (\Exception $e) {
            Log::warning("GitHub API check failed: " . $e->getMessage());
        }
        return null;
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
        // Pass environment variables required by Composer and sub-processes on Windows
        $env = $_SERVER;
        $composerHome = storage_path('app/composer_home');
        if (!is_dir($composerHome)) @mkdir($composerHome, 0755, true);
        
        $env['COMPOSER_HOME'] = $composerHome;
        $env['APPDATA'] = $composerHome;
        $env['HOME'] = $composerHome;

        $process = new Process($command, base_path(), $env);
        $process->setTimeout(600); // Increased to 10 minutes for Composer
        $process->run();

        if (!$process->isSuccessful()) {
            $error = $process->getOutput() . "\n" . $process->getErrorOutput();
            throw new \RuntimeException($error);
        }

        return $process->getOutput();
    }

    /**
     * Get the absolute path to the composer binary.
     */
    private function getComposerBinary(array $phpBase = [])
    {
        if (empty($phpBase)) {
            $php = PHP_BINARY;
            $ini = php_ini_loaded_file();
            $tempDir = storage_path('app/temp');
            if (!is_dir($tempDir)) @mkdir($tempDir, 0755, true);
            $phpBase = array_merge([$php], ($ini ? ['-c', $ini] : []), ["-d", "sys_temp_dir=$tempDir"]);
        }

        // 1. Check for composer.phar in root
        if (file_exists(base_path('composer.phar'))) {
            return array_merge($phpBase, [base_path('composer.phar')]);
        }

        // 2. Look for composer.phar near the composer.bat we found earlier
        $commonWindowsPath = 'C:\lara\bin\composer\composer.phar';
        if (file_exists($commonWindowsPath)) {
            return array_merge($phpBase, [$commonWindowsPath]);
        }

        // 3. Fallback to just 'composer' if all else fails
        return ['composer'];
    }
}
