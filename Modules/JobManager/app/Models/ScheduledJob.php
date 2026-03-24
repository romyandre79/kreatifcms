<?php

namespace Modules\JobManager\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledJob extends Model
{
    protected $fillable = [
        'name',
        'command_code',
        'type',
        'cron',
        'is_active',
        'last_run_at',
    ];
}
