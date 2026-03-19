<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::latest()->get();
        
        if (request()->wantsJson()) {
            return response()->json($media);
        }

        return Inertia::render('Media/Index', [
            'media' => $media
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|image|max:10240', // 10MB max per file
        ]);

        $uploadedMedia = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('media', 'public');
                
                // Sanitize filename to prevent path traversal or odd characters
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $safeName = \Illuminate\Support\Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;

                $media = Media::create([
                    'name' => $safeName,
                    'path' => $path,
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);

                event(new \App\Events\MediaUploaded($media));

                $uploadedMedia[] = $media;
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Uploaded successfully', 'media' => $uploadedMedia]);
        }

        return redirect()->back()->with('success', count($uploadedMedia) . ' files uploaded successfully.');
    }

    public function destroy(Media $medium) // Route model binding uses singular of media -> medium or we can just use $id
    {
        // Delete from storage
        Storage::disk('public')->delete($medium->path);
        
        // Delete from DB
        $medium->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Deleted successfully']);
        }

        return redirect()->back()->with('success', 'File deleted successfully.');
    }
}
