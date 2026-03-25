<?php

namespace Modules\OtpService\Console;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class CleanupOtpLogs extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'otpservice:cleanup-otp-logs';

    /**
     * The console command description.
     */
    protected $description = 'Clean up old OTP logs from the database.';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning up old OTP logs...');
        \Illuminate\Support\Facades\Log::info('OtpService: Cleanup command executed.');
        return 0;
    }

    /**
     * Get the console command arguments.
     */
    protected function getArguments(): array
    {
        return [
            ['example', InputArgument::REQUIRED, 'An example argument.'],
        ];
    }

    /**
     * Get the console command options.
     */
    protected function getOptions(): array
    {
        return [
            ['example', null, InputOption::VALUE_OPTIONAL, 'An example option.', null],
        ];
    }
}
