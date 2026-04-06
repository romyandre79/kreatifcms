<?php

namespace Modules\Brevo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Brevo\Database\Factories\InboundEmailFactory;

class InboundEmail extends Model
{
    use HasFactory;

    protected $table = 'brevo_inbound_emails';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'from_email',
        'from_name',
        'subject',
        'content_html',
        'content_text',
        'received_at',
        'metadata'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'metadata' => 'array',
        'received_at' => 'datetime',
    ];

    // protected static function newFactory(): InboundEmailFactory
    // {
    //     // return InboundEmailFactory::new();
    // }
}
