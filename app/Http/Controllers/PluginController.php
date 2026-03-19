<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Nwidart\Modules\Facades\Module;
use Inertia\Inertia;
use App\Models\Setting;

class PluginController extends Controller
{
    /**
     * Display a listing of the plugins.
     */
    public function index()
    {
        $modules = Module::all();
        $pluginData = [];

        foreach ($modules as $module) {
            $settingsDefinition = $module->get('settings') ?: [];
            $settingsValues = [];

            foreach ($settingsDefinition as $def) {
                $settingsValues[$def['name']] = Setting::get($module->getLowerName(), $def['name'], $def['default'] ?? null);
            }

            $pluginData[] = [
                'name' => $module->getName(),
                'alias' => $module->getLowerName(),
                'description' => $module->get('description') ?? 'No description provided.',
                'version' => $module->get('version') ?? '1.0.0',
                'enabled' => $module->isEnabled(),
                'path' => $module->getPath(),
                'settings' => $settingsDefinition,
                'values' => $settingsValues,
            ];
        }

        return Inertia::render('Plugins/Index', [
            'plugins' => $pluginData
        ]);
    }

    /**
     * Enable a plugin.
     */
    public function enable(string $name)
    {
        $module = Module::find($name);
        if ($module) {
            $module->enable();
        }

        return redirect()->back()->with('message', "Plugin {$name} enabled successfully.");
    }

    /**
     * Disable a plugin.
     */
    public function disable(string $name)
    {
        $module = Module::find($name);
        if ($module) {
            $module->disable();
        }

        return redirect()->back()->with('message', "Plugin {$name} disabled successfully.");
    }

    /**
     * Export a plugin as a ZIP file.
     */
    public function export(string $name)
    {
        $module = Module::find($name);
        
        if (!$module) {
            abort(404, 'Plugin not found');
        }

        $path = $module->getPath();
        $zipFileName = $name . '.zip';
        
        // Ensure the temp directory exists
        $tempDir = storage_path('app/temp');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $path = realpath($module->getPath()); // NORMALIZE: Ensure path matches OS separators
        if (!$path) {
             return redirect()->back()->with('error', "Plugin directory for '{$name}' not found on disk.");
        }

        $zipFileName = $name . '.zip';
        $tempDir = storage_path('app/temp');
        if (!is_dir($tempDir)) mkdir($tempDir, 0755, true);
        
        $zipFilePath = $tempDir . '/' . $zipFileName;

        if (class_exists('ZipArchive')) {
            $zip = new \ZipArchive();
            if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === TRUE) {
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($path),
                    \RecursiveIteratorIterator::LEAVES_ONLY
                );

                foreach ($files as $fileNode) {
                    if (!$fileNode->isDir()) {
                        $filePath = $fileNode->getRealPath();
                        // NORMALIZE: Use native separator for length calculation
                        $relativePath = ltrim(substr($filePath, strlen($path)), DIRECTORY_SEPARATOR);
                        
                        if ($relativePath) {
                            $zip->addFile($filePath, $relativePath);
                        }
                    }
                }
                $zip->close();
            } else {
                return redirect()->back()->with('error', 'Failed to create ZIP file with ZipArchive.');
            }
        } else {
            // Fallback for missing ZipArchive extension (Windows PowerShell)
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $sourcePath = str_replace('/', '\\', $path) . '\\*';
                $destPath = str_replace('/', '\\', $zipFilePath);
                $command = "powershell.exe -NoProfile -NonInteractive -Command \"Compress-Archive -Path '{$sourcePath}' -DestinationPath '{$destPath}' -Force\"";
                exec($command, $output, $returnVar);
                
                if ($returnVar !== 0 || !file_exists($zipFilePath)) {
                    return redirect()->back()->with('error', 'Failed to compress using PowerShell fallback. Please enable the zip extension in php.ini.');
                }
            } else {
                return redirect()->back()->with('error', 'The ZipArchive PHP extension is missing. Please enable it in your php.ini to export plugins.');
            }
        }

        return response()->download($zipFilePath)->deleteFileAfterSend(true);
    }

    /**
     * Import a plugin from a ZIP file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:zip|max:51200', // 50MB max
        ]);

        $file = $request->file('file');
        $tempPath = storage_path('app/temp/import_' . uniqid());
        
        if (!is_dir($tempPath)) {
            mkdir($tempPath, 0755, true);
        }

        // NORMALIZE: PowerShell Expand-Archive requires the file to have a .zip extension.
        // PHP temp files are often .tmp, so we must copy/rename it.
        $zipPath = $tempPath . '/upload.zip';
        move_uploaded_file($file->getRealPath(), $zipPath);
        
        $extracted = false;

        try {
            if (class_exists('ZipArchive')) {
                $zip = new \ZipArchive();
                if (($errCode = $zip->open($zipPath)) === TRUE) {
                    // Pre-scan for ZipSlip (path traversal)
                    for ($i = 0; $i < $zip->numFiles; $i++) {
                        $name = $zip->getNameIndex($i);
                        if (str_contains($name, '..') || str_starts_with($name, '/') || str_starts_with($name, '\\')) {
                            $zip->close();
                            throw new \Exception("Security Risk: ZIP contains invalid file paths ({$name})");
                        }
                    }
                    if (!$zip->extractTo($tempPath)) {
                        $zip->close();
                        throw new \Exception('Failed to extract files from ZIP. The archive might be corrupted or write-protected.');
                    }
                    $zip->close();
                    $extracted = true;
                } else {
                    $errorMsg = match($errCode) {
                        \ZipArchive::ER_NOZIP => 'Not a zip archive.',
                        \ZipArchive::ER_INCONS => 'Zip archive inconsistent.',
                        \ZipArchive::ER_CRC => 'Checksum error.',
                        default => "ErrorCode: {$errCode}"
                    };
                    // We'll let it try PowerShell if open failed but we'll show this later if PS also fails
                }
            }
            
            if (!$extracted) {
                // Fallback for missing ZipArchive extension or failed open (Windows PowerShell)
                if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                    $destPath = realpath($tempPath) ?: $tempPath;
                    $srcZip = realpath($zipPath) ?: $zipPath;
                    $command = "powershell.exe -NoProfile -NonInteractive -Command \"Expand-Archive -Path '{$srcZip}' -DestinationPath '{$destPath}' -Force\"";
                    exec($command, $output, $returnVar);
                    $extracted = ($returnVar === 0);
                }
            }

            if (!$extracted) {
                throw new \Exception('Failed to extract the plugin ZIP file. Please ensure it is a valid ZIP archive.');
            }

            // Identify the module name from module.json
            $moduleJsonPath = null;
            $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($tempPath));
            foreach ($files as $f) {
                if ($f->getFilename() === 'module.json') {
                    $moduleJsonPath = $f->getRealPath();
                    break;
                }
            }

            if (!$moduleJsonPath) {
                throw new \Exception('Invalid plugin structure: module.json not found.');
            }

            $moduleData = json_decode(file_get_contents($moduleJsonPath), true);
            if (!isset($moduleData['name'])) {
                throw new \Exception('Invalid module.json: name is required.');
            }

            $moduleName = $moduleData['name'];
            
            // SECURITY: Validate module name to prevent path traversal
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $moduleName)) {
                throw new \Exception('Invalid module name: Only alphanumeric characters and underscores are allowed.');
            }

            // SECURITY: Scan the extracted code for malicious patterns
            $this->scanForMaliciousCode($tempPath);

            $moduleDir = base_path('Modules/' . $moduleName);
            $sourceDir = dirname($moduleJsonPath);

            // Ensure Modules directory exists
            if (!is_dir(base_path('Modules'))) {
                mkdir(base_path('Modules'), 0755, true);
            }

            // If module already exists, error out
            if (is_dir($moduleDir)) {
                throw new \Exception("Plugin '{$moduleName}' is already installed.");
            }

            // Move the extracted module to the Modules directory
            rename($sourceDir, $moduleDir);

            return redirect()->back()->with('message', "Plugin '{$moduleName}' imported successfully. Security scan passed.");

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } finally {
            // Cleanup temp directory ALWAYS
            $this->deleteDirectory($tempPath);
        }
    }

    /**
     * Scan a directory for potentially malicious PHP code.
     */
    private function scanForMaliciousCode($dir)
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
            'assert\(.*eval', // assert with code execution
            'create_function\(',
        ];

        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir));
        foreach ($files as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $content = file_get_contents($file->getRealPath());
                
                foreach ($dangerousFunctions as $func) {
                    if (preg_match('/' . $func . '/i', $content)) {
                        $filename = $file->getFilename();
                        throw new \Exception("Security Risk: Dangerous function found in {$filename}. Plugins containing execution functions ({$func}) are prohibited.");
                    }
                }

                // Check for suspicious obfuscation patterns
                if (preg_match('/base64_decode\s*\(/i', $content) && preg_match('/(eval|system|shell_exec|exec|passthru)\s*\(/i', $content)) {
                    throw new \Exception("Security Risk: Suspicious code pattern found in {$file->getFilename()} (obfuscation combined with execution).");
                }
            }
        }
    }

    /**
     * Delete a plugin permanently.
     */
    public function destroy(string $name)
    {
        $module = Module::find($name);
        
        if (!$module) {
            return redirect()->back()->with('error', "Plugin '{$name}' not found.");
        }

        $path = $module->getPath();

        try {
            // Disable first if enabled
            if ($module->isEnabled()) {
                $module->disable();
            }

            // Remove the directory
            $this->deleteDirectory($path);

            return redirect()->back()->with('message', "Plugin '{$name}' deleted successfully.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', "Failed to delete plugin: " . $e->getMessage());
        }
    }

    /**
     * Update plugin settings.
     */
    public function updateSettings(Request $request, string $name)
    {
        $module = Module::find($name);
        if (!$module) {
            abort(404, 'Plugin not found');
        }

        $settings = $request->input('settings', []);
        
        foreach ($settings as $key => $value) {
            Setting::set($module->getLowerName(), $key, $value);
        }

        return redirect()->back()->with('message', "Settings for '{$name}' updated successfully.");
    }

    /**
     * Helper to recursively delete a directory.
     */
    private function deleteDirectory($dir) {
        if (!is_dir($dir)) return;
        $files = array_diff(scandir($dir), array('.','..'));
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? $this->deleteDirectory("$dir/$file") : unlink("$dir/$file");
        }
        return rmdir($dir);
    }
}
