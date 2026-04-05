<?php

namespace Modules\Brevo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Brevo\Database\Factories\CampaignFactory;

class Campaign extends Model
{
    use HasFactory;

    protected $table = 'brevo_campaigns';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'type',
        'subject',
        'content',
        'status',
        'brevo_id',
        'stats',
        'scheduled_at'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'stats' => 'array',
        'scheduled_at' => 'datetime',
    ];

    // protected static function newFactory(): CampaignFactory
    // {
    //     // return CampaignFactory::new();
    // }
}
