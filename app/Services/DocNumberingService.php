<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DocNumberingService
{
    /**
     * Generate the next document number based on doc_type, company, branch, and date
     */
    public static function generateNext(string $docType, ?int $companyId = null, ?int $branchId = null, ?string $date = null): string
    {
        $conn = DB::connection('secondary');
        $dateObj = $date ? Carbon::parse($date) : Carbon::now();

        // 1. Fetch matching formats
        $formats = $conn->table('cms_doc_numberings')
            ->where('doc_type', $docType)
            ->get();

        $bestFormat = null;
        $bestScore = -1;

        foreach ($formats as $f) {
            $score = 0;

            // Company Check
            if (!empty($f->company_id)) {
                if ($companyId !== null && (int)$f->company_id === (int)$companyId) {
                    $score += 100;
                } else {
                    continue; // Mismatch
                }
            }

            // Branch Check
            if (!empty($f->branch_id)) {
                if ($branchId !== null && (int)$f->branch_id === (int)$branchId) {
                    $score += 10;
                } else {
                    continue; // Mismatch
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestFormat = $f;
            }
        }

        // 2. Fallback to default if no format matches
        if (!$bestFormat) {
            // Check if there is a default format or create one
            $defaultFormatStr = strtoupper($docType) . '/{YYYY}/{MM}/{SEQ4}';
            
            $id = $conn->table('cms_doc_numberings')->insertGetId([
                'doc_type' => $docType,
                'format' => $defaultFormatStr,
                'current_seq' => 1,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $bestFormat = (object)[
                'id' => $id,
                'doc_type' => $docType,
                'format' => $defaultFormatStr,
                'current_seq' => 1,
                'company_id' => $companyId,
                'branch_id' => $branchId
            ];
        }

        // 3. Determine period key depending on date tokens in template format
        $periodKey = 'global';
        $formatUpper = strtoupper($bestFormat->format);
        if (strpos($formatUpper, '{DD}') !== false) {
            $periodKey = $dateObj->format('Y-m-d');
        } elseif (strpos($formatUpper, '{MM}') !== false) {
            $periodKey = $dateObj->format('Y-m');
        } elseif (strpos($formatUpper, '{YYYY}') !== false || strpos($formatUpper, '{YY}') !== false) {
            $periodKey = $dateObj->format('Y');
        }

        // Fetch or create the counter for the specific period
        $counter = $conn->table('cms_doc_numbering_counters')
            ->where('doc_numbering_id', $bestFormat->id)
            ->where('period_key', $periodKey)
            ->first();

        if ($counter) {
            $currentSeq = (int)$counter->current_value;
            $conn->table('cms_doc_numbering_counters')
                ->where('id', $counter->id)
                ->update([
                    'current_value' => $currentSeq + 1,
                    'updated_at' => now()
                ]);
        } else {
            // First time this period has been accessed, initialize counter
            $currentSeq = (int)($bestFormat->current_seq ?? 1);
            $conn->table('cms_doc_numbering_counters')->insert([
                'doc_numbering_id' => $bestFormat->id,
                'period_key' => $periodKey,
                'current_value' => $currentSeq + 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 4. Resolve company and branch codes if tokens are present
        $companyCode = '';
        if ($companyId) {
            $company = $conn->table('cms_companies')->where('id', $companyId)->first();
            if ($company) {
                $companyCode = $company->code ?? '';
            }
        }

        $branchCode = '';
        if ($branchId) {
            $branch = $conn->table('cms_branches')->where('id', $branchId)->first();
            if ($branch) {
                $branchCode = $branch->code ?? '';
            }
        }

        // 5. Parse template format
        $formatted = $bestFormat->format;
        $formatted = str_replace('{YYYY}', $dateObj->format('Y'), $formatted);
        $formatted = str_replace('{YY}', $dateObj->format('y'), $formatted);
        $formatted = str_replace('{MM}', $dateObj->format('m'), $formatted);
        $formatted = str_replace('{DD}', $dateObj->format('d'), $formatted);
        $formatted = str_replace('{COM}', $companyCode, $formatted);
        $formatted = str_replace('{BRC}', $branchCode, $formatted);

        // Replace SEQ sequences e.g., {SEQ4} with padded numbers
        for ($i = 1; $i <= 10; $i++) {
            $placeholder = "{SEQ{$i}}";
            if (strpos($formatted, $placeholder) !== false) {
                $padded = str_pad((string)$currentSeq, $i, '0', STR_PAD_LEFT);
                $formatted = str_replace($placeholder, $padded, $formatted);
            }
        }

        if (strpos($formatted, '{SEQ}') !== false) {
            $formatted = str_replace('{SEQ}', (string)$currentSeq, $formatted);
        }

        return $formatted;
    }
}
