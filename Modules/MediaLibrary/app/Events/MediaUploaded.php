<?php

namespace Modules\MediaLibrary\Events;

use Modules\MediaLibrary\Models\Media;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MediaUploaded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $media;

    public function __construct(Media $media)
    {
        $this->media = $media;
    }
}
