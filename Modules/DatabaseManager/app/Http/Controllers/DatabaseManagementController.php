<?php

namespace Modules\DatabaseManager\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\ContentType;
use App\Models\ContentField;
use App\Models\AuditLog;
use App\Models\DashboardWidget;
use App\Services\SchemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ZipArchive;

class DatabaseManagementController extends Controller
{
    protected $schemaService;
    protected $connection = 'secondary';

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    public function index()
    {
        return \Inertia\Inertia::render('Settings/Database');
    }

    /**
     * Generate a backup (DB only or Full Code+DB).
     */
    public function backup(Request $request)
    {
        $type = $request->input('type', 'db'); // 'db' or 'full'
        $filename = 'backup_' . ($type === 'full' ? 'project' : 'db') . '_' . date('Y-m-d_H-i-s') . '.zip';
        $tempPath = storage_path('app/temp_backup_' . Str::random(10));
        
        if (!File::exists($tempPath)) {
            File::makeDirectory($tempPath, 0755, true);
        }

        $zip = new ZipArchive();
        $zipFile = storage_path('app/' . $filename);

        if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            return back()->with('error', 'Could not create ZIP file');
        }

        if ($type === 'db') {
            $this->createDbBackup($tempPath, $zip);
        } else {
            $this->createFullBackup($zip);
        }

        $zip->close();
        File::deleteDirectory($tempPath);

        return response()->download($zipFile)->deleteFileAfterSend(true);
    }

    /**
     * Reset the database (Wipe CMS data and schemas).
     */
    public function reset()
    {
        try {
            // 1. Drop all dynamic tables
            $contentTypes = ContentType::all();
            foreach ($contentTypes as $ct) {
                $this->schemaService->dropTable($ct->slug);
            }

            // 2. Clear CMS Metadata
            ContentField::truncate();
            ContentType::all()->each(function($ct) { $ct->delete(); });
            AuditLog::truncate();
            DashboardWidget::truncate();

            return back()->with('success', 'Database has been factory reset successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Reset failed: ' . $e->getMessage());
        }
    }

    protected function createDbBackup($path, ZipArchive $zip)
    {
        // 1. Export Content Types and Fields
        $data = [
            'content_types' => ContentType::with('fields')->get()->toArray(),
            'widgets' => DashboardWidget::all()->toArray(),
        ];

        File::put($path . '/cms_structure.json', json_encode($data, JSON_PRETTY_PRINT));
        $zip->addFile($path . '/cms_structure.json', 'cms_structure.json');

        // 2. Export Dynamic Table Data
        $dynamicData = [];
        foreach ($data['content_types'] as $ct) {
            $tableName = $this->schemaService->getTableName($ct['slug']);
            if (Schema::connection($this->connection)->hasTable($tableName)) {
                $dynamicData[$ct['slug']] = DB::connection($this->connection)->table($tableName)->get()->toArray();
            }
        }

        File::put($path . '/cms_data.json', json_encode($dynamicData, JSON_PRETTY_PRINT));
        $zip->addFile($path . '/cms_data.json', 'cms_data.json');

        // 3. Export Audit Logs
        $logs = AuditLog::all()->toArray();
        File::put($path . '/audit_logs.json', json_encode($logs, JSON_PRETTY_PRINT));
        $zip->addFile($path . '/audit_logs.json', 'audit_logs.json');
    }

    protected function createFullBackup(ZipArchive $zip)
    {
        $rootPath = base_path();
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($rootPath),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file) {
            // Skip directories (they would be added automatically)
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($rootPath) + 1);

                // Exclude heavy/sensitive folders
                if (Str::startsWith($relativePath, [
                    'vendor', 
                    'node_modules', 
                    'storage/logs', 
                    'storage/framework/cache', 
                    'storage/framework/sessions', 
                    'storage/framework/views',
                    '.git'
                ])) {
                    continue;
                }

                // Exclude the backup file itself if it's being created in a watched path
                if (Str::contains($relativePath, '.zip')) continue;

                $zip->addFile($filePath, 'project/' . $relativePath);
            }
        }

        // Also include a DB dump within the full backup? 
        // For simplicity, we'll just add the JSON ones we did above but into a 'db' folder
        $tempPath = storage_path('app/temp_db_dump');
        if (!File::exists($tempPath)) File::makeDirectory($tempPath);
        
        $this->createDbBackup($tempPath, $zip);
        // Map them to 'db/' inside the zip instead of root
        $zip->addFile($tempPath . '/cms_structure.json', 'db/cms_structure.json');
        $zip->addFile($tempPath . '/cms_data.json', 'db/cms_data.json');
        $zip->addFile($tempPath . '/audit_logs.json', 'db/audit_logs.json');
        
        // Note: ZipArchive::addFile uses the second param as the path INSIDE the zip
    }

    /**
     * Restore from a ZIP backup.
     */
    public function restore(Request $request)
    {
        $request->validate(['backup_file' => 'required|file|mimes:zip']);
        
        $file = $request->file('backup_file');
        $zip = new ZipArchive();
        
        if ($zip->open($file->getRealPath()) === TRUE) {
            // SECURITY: Pre-scan for ZipSlip (path traversal)
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (str_contains($name, '..') || str_starts_with($name, '/') || str_starts_with($name, '\\')) {
                    $zip->close();
                    return back()->with('error', "Security Risk: Backup contains invalid file paths ({$name})");
                }
            }
            
            $extractPath = storage_path('app/restore_' . Str::random(10));
            $zip->extractTo($extractPath);
            $zip->close();

            try {
                // If it's a DB only backup (cms_structure.json at root)
                if (File::exists($extractPath . '/cms_structure.json')) {
                    $this->processDbRestore($extractPath);
                    File::deleteDirectory($extractPath);
                    return back()->with('success', 'Database restored successfully.');
                } 
                
                // If it's a full backup, we might need manual handling or just restore the DB part
                if (File::exists($extractPath . '/db/cms_structure.json')) {
                    $this->processDbRestore($extractPath . '/db');
                    File::deleteDirectory($extractPath);
                    return back()->with('success', 'Database part of the full backup restored successfully. Code changes must be applied manually if needed.');
                }

                return back()->with('error', 'Invalid backup file format.');

            } catch (\Exception $e) {
                return back()->with('error', 'Restore failed: ' . $e->getMessage());
            }
        }

        return back()->with('error', 'Could not open ZIP file.');
    }

    protected function processDbRestore($path)
    {
        $structure = json_decode(File::get($path . '/cms_structure.json'), true);
        $data = json_decode(File::get($path . '/cms_data.json'), true);
        $logs = json_decode(File::get($path . '/audit_logs.json'), true);

        // 1. Clear current state (Reset)
        $this->reset();

        // 2. Restore Content Types and Fields
        foreach ($structure['content_types'] as $ctData) {
            $ct = ContentType::create([
                'name' => $ctData['name'],
                'slug' => $ctData['slug'],
                'description' => $ctData['description'],
                'type' => $ctData['type'] ?? 'collection',
            ]);

            foreach ($ctData['fields'] as $fData) {
                $ct->fields()->create([
                    'name' => $fData['name'],
                    'type' => $fData['type'],
                    'required' => $fData['required'],
                    'description' => $fData['description'] ?? null,
                    'options' => $fData['options'] ?? null,
                ]);
            }

            // Create the physical table
            $this->schemaService->createTable($ct);

            // 3. Restore Data for this content type
            if (isset($data[$ctData['slug']])) {
                $tableName = $this->schemaService->getTableName($ctData['slug']);
                foreach ($data[$ctData['slug']] as $row) {
                    DB::connection($this->connection)->table($tableName)->insert((array)$row);
                }
            }
        }

        // 4. Restore Widgets
        foreach ($structure['widgets'] as $wData) {
            DashboardWidget::create($wData);
        }

        // 5. Restore Audit Logs
        foreach ($logs as $logData) {
            AuditLog::create($logData);
        }
    }
}
