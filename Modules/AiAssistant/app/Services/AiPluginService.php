<?php

namespace Modules\AiAssistant\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class AiPluginService
{
    /**
     * Scaffold a new module from a description.
     */
    public function scaffold(string $name, array $files)
    {
        // 1. Validate module name
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $name)) {
            throw new \Exception("Invalid module name: Only alphanumeric characters and underscores are allowed.");
        }

        $modulePath = base_path('Modules/' . $name);

        if (File::exists($modulePath)) {
            throw new \Exception("Module '{$name}' already exists.");
        }

        // 2. Scan all file contents for malicious code before writing anything
        foreach ($files as $file) {
            $this->scanForMaliciousCode($file['path'], $file['content']);
        }

        try {
            // 3. Create the module directory structure
            File::makeDirectory($modulePath, 0755, true);

            foreach ($files as $file) {
                $filePath = $modulePath . '/' . ltrim($file['path'], '/');
                $directory = dirname($filePath);

                if (!File::exists($directory)) {
                    File::makeDirectory($directory, 0755, true);
                }

                File::put($filePath, $file['content']);
            }

            // 4. Update composer.json for PSR-4 autoloading
            $this->updateComposerAutoload($name);

            // 5. Run composer dump-autoload
            $this->runComposerDump();

            // 6. Run migrations if present
            $hasMigrations = false;
            foreach ($files as $file) {
                if (str_contains($file['path'], 'database/migrations')) {
                    $hasMigrations = true;
                    break;
                }
            }

            if ($hasMigrations) {
                $this->runMigrations($name);
            }

            return true;
        } catch (\Exception $e) {
            // Cleanup on failure
            if (File::exists($modulePath)) {
                File::deleteDirectory($modulePath);
            }
            throw $e;
        }
    }

    /**
     * Scan a single file content for malicious code.
     */
    private function scanForMaliciousCode($path, $content)
    {
        $dangerousFunctions = [
            'eval\(',
            'shell_exec\(',
            'passthru\(',
            'system\(',
            'exec\(',
            'popen\(',
            'proc_open\(',
            'pcntl_exec\(',
            'assert\(.*eval',
            'create_function\(',
        ];

        foreach ($dangerousFunctions as $func) {
            if (preg_match('/' . $func . '/i', $content)) {
                throw new \Exception("Security Risk: Dangerous function found in {$path}. Plugins containing execution functions ({$func}) are prohibited.");
            }
        }

        if (preg_match('/base64_decode\s*\(/i', $content) && preg_match('/(eval|system|shell_exec|exec|passthru)\s*\(/i', $content)) {
            throw new \Exception("Security Risk: Suspicious code pattern found in {$path} (obfuscation combined with execution).");
        }
    }

    /**
     * Update the main composer.json to include the new module in PSR-4.
     */
    private function updateComposerAutoload(string $name)
    {
        $composerPath = base_path('composer.json');
        $composerData = json_decode(File::get($composerPath), true);
        
        $namespace = "Modules\\{$name}\\";
        $modulePath = base_path('Modules/' . $name);
        
        // Determine if it uses the 'app' folder pattern (default for KreatifCMS)
        $srcFolder = File::isDirectory($modulePath . '/app') ? "Modules/{$name}/app/" : "Modules/{$name}/";
        
        if (!isset($composerData['autoload']['psr-4'][$namespace])) {
            $composerData['autoload']['psr-4'][$namespace] = $srcFolder;
            File::put($composerPath, json_encode($composerData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }
    }

    /**
     * Run composer dump-autoload.
     */
    private function runComposerDump()
    {
        $path = base_path();
        // Use full path to composer if possible, or assume it's in path
        $command = "cd " . escapeshellarg($path) . " && composer dump-autoload";
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            Log::warning("AI Plugin Scaffolder: Composer dump-autoload failed: " . implode("\n", $output));
        }
    }

    /**
     * Run database migrations for the specific module.
     */
    private function runMigrations(string $name)
    {
        $path = base_path();
        // Use module:migrate for nwidart/laravel-modules
        $command = "cd " . escapeshellarg($path) . " && php artisan module:migrate " . escapeshellarg($name) . " --force";
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            Log::warning("AI Plugin Scaffolder: Migrations failed for '{$name}': " . implode("\n", $output));
        }
    }
}
