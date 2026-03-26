<?php

namespace Modules\MediaLibrary\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\MediaLibrary\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Modules\MediaLibrary\Events\MediaUploaded;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::latest()->get();
        
        if (request()->wantsJson() || request()->ajax() || request()->has('json') || str_contains(request()->header('Accept', ''), 'application/json')) {
            return response()->json($media);
        }

        return Inertia::render('Media/Index', [
            'media' => $media
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,svg,mp4,mov,ogg,webm,qt,m4v|max:102400', // 100MB max per file for videos
        ]);

        $uploadedMedia = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('media', 'public');
                
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $safeName = \Illuminate\Support\Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;

                $media = Media::create([
                    'name' => $safeName,
                    'path' => $path,
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);

                event(new MediaUploaded($media));

                $uploadedMedia[] = $media;
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Uploaded successfully', 'media' => $uploadedMedia]);
        }

        return redirect()->back()->with('success', count($uploadedMedia) . ' files uploaded successfully.');
    }

    public function destroy($id)
    {
        $medium = Media::findOrFail($id);
        
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
