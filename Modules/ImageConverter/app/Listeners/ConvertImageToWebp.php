<?php

namespace Modules\ImageConverter\Listeners;

use App\Events\MediaUploaded;
use Illuminate\Support\Facades\Storage;

class ConvertImageToWebp
{
    /**
     * Handle the event.
     */
    public function handle(MediaUploaded $event): void
    {
        $media = $event->media;
        
        // SECURITY/PERFORMANCE: Limit max file size for conversion to 10MB to avoid memory exhaustion
        if ($media->size > 10 * 1024 * 1024) {
            return;
        }

        $mime = strtolower($media->mime_type);
        
        // Only process JPG and PNG
        if (in_array($mime, ['image/jpeg', 'image/png'])) {
            $disk = Storage::disk('public');
            $oldPath = $media->path;
            $fullPath = $disk->path($oldPath);
            
            if (!file_exists($fullPath)) {
                return;
            }
            
            $image = null;
            if ($mime === 'image/jpeg') {
                $image = @imagecreatefromjpeg($fullPath);
            } elseif ($mime === 'image/png') {
                $image = @imagecreatefrompng($fullPath);
                if ($image) {
                    imagepalettetotruecolor($image);
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
            }
            
            if ($image) {
                // Generate new filename with .webp extension
                $newFilename = pathinfo($oldPath, PATHINFO_FILENAME) . '_' . uniqid() . '.webp';
                $dirname = pathinfo($oldPath, PATHINFO_DIRNAME);
                $newPath = ($dirname === '.' ? '' : $dirname . '/') . $newFilename;
                $newFullPath = $disk->path($newPath);
                
                // Save as WebP with 80% quality
                if (imagewebp($image, $newFullPath, 80)) {
                    imagedestroy($image);
                    
                    // Update media record in DB
                    $media->path = $newPath;
                    $media->mime_type = 'image/webp';
                    
                    // Replace extension in real name
                    $originalNameBase = pathinfo($media->name, PATHINFO_FILENAME);
                    $media->name = $originalNameBase . '.webp';
                    
                    $media->size = filesize($newFullPath);
                    $media->save();
                    
                    // Delete the original JPG/PNG file
                    $disk->delete($oldPath);
                } else {
                    imagedestroy($image);
                }
            }
        }
    }
}
