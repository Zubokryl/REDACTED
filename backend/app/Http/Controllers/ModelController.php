<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ModelController extends Controller
{
    // Get list of current user's models
    public function index(Request $request)
    {
        \Log::info('=== MODELS INDEX REQUEST ===');
        \Log::info('Headers:', $request->headers->all());
        \Log::info('Auth user:', ['user' => $request->user()]);
        \Log::info('Request params:', $request->all());

        $query = Model3D::query();

        // If creator_id is passed in request parameters - filter by it
        if ($request->has('creator_id')) {
            $query->where('creator_id', $request->input('creator_id'));
        } else {
            // Otherwise - if user is authenticated, return only their models
            $user = $request->user();
            if ($user) {
                $query->where('creator_id', $user->id);
            }
        }

        $models = $query->get();
        \Log::info('Returning models:', ['count' => $models->count()]);

        return response()->json($models);
    }

    // Get one model by id
    public function show($id)
    {
        $model = Model3D::findOrFail($id);
        
        // Ensure the model file URL is absolute and not duplicated
        // Ensure the model_file URL is absolute and not duplicated
        if ($model->model_file) {
            if (str_starts_with($model->model_file, 'http')) {
                $model->model_file = $model->model_file;
            } else {
                // Use the new route for serving model files
                $model->model_file = url('api/models/file/' . basename($model->model_file));
            }
        }
        
        return response()->json($model)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Create new model
    public function store(Request $request)
    {
        try {
            \Log::info('Model upload request received', [
                'headers' => $request->headers->all(),
                'user' => $request->user(),
                'files' => $request->allFiles(),
                'data' => $request->except('model_file'),
                'content_type' => $request->header('Content-Type'),
                'content_length' => $request->header('Content-Length')
            ]);

            // Check if file exists in request
            if (!$request->hasFile('model_file')) {
                \Log::error('No file uploaded', [
                    'request_files' => $request->allFiles(),
                    'request_data' => $request->all(),
                    'content_type' => $request->header('Content-Type'),
                    'content_length' => $request->header('Content-Length')
                ]);
                return response()->json([
                    'message' => 'No file uploaded',
                    'errors' => ['model_file' => ['The model file is required.']]
                ], 422);
            }

            $file = $request->file('model_file');
            
            // Log detailed file information
            \Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension(),
                'error' => $file->getError(),
                'is_valid' => $file->isValid(),
                'path' => $file->getPathname(),
                'real_path' => $file->getRealPath()
            ]);

            if (!$file->isValid()) {
                \Log::error('File upload failed', [
                    'error' => $file->getError(),
                    'error_message' => $this->getUploadErrorMessage($file->getError())
                ]);
                return response()->json([
                    'message' => 'File upload failed',
                    'error' => $this->getUploadErrorMessage($file->getError()),
                    'errors' => ['model_file' => [$this->getUploadErrorMessage($file->getError())]]
                ], 422);
            }

            // Validate request
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'category' => 'required|string',
                'model_file' => 'required|file|mimes:fbx,obj,glb|max:5242880', // 5GB max (5120MB)
                'features' => 'required|array',
                'features.*' => 'required|in:0,1',
                'formats' => 'array',
                'formats.*' => 'string',
                'tools' => 'array',
                'tools.*' => 'string',
                'printable' => 'boolean',
                'customizable' => 'boolean',
                'release_date' => 'required|date',
                'vertices' => 'required|integer|min:0',
                'price' => 'required|numeric|min:0',
                'license' => 'required|string'
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()->toArray()
                ], 422);
            }

            // Create storage directory if it doesn't exist
            $storagePath = storage_path('app/public/models');
            if (!file_exists($storagePath)) {
                if (!mkdir($storagePath, 0755, true)) {
                    \Log::error('Failed to create storage directory', [
                        'path' => $storagePath
                    ]);
                    return response()->json([
                        'message' => 'Failed to create storage directory',
                        'errors' => ['storage' => ['Failed to create storage directory']]
                    ], 500);
                }
            }

            // Generate unique filename with original extension
            $originalExtension = $file->getClientOriginalExtension();
            $filename = uniqid() . '_' . time() . '.' . $originalExtension;
            
            // Store the file with chunked upload support
            try {
                $filePath = $file->storeAs('public/models', $filename);
                if (!$filePath) {
                    throw new \Exception('Failed to store file');
                }
            } catch (\Exception $e) {
                \Log::error('Failed to store file', [
                    'error' => $e->getMessage(),
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize()
                ]);
                return response()->json([
                    'message' => 'Failed to store file',
                    'errors' => ['storage' => ['Failed to store file: ' . $e->getMessage()]]
                ], 500);
            }

            \Log::info('File stored successfully', [
                'path' => $filePath,
                'filename' => $filename
            ]);

            // Convert features array to object
            $features = [];
            $featureKeys = ['lowPoly', 'pbr', 'textures', 'materials', 'uvMapping', 'uvUnwrapped', 'rigged', 'animated', 'uvMapped'];
            foreach ($featureKeys as $index => $key) {
                $features[$key] = $request->input("features.{$index}") === '1';
            }

            // Create model
            $model = Model3D::create([
                'creator_id' => $request->user()->id,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'model_file' => $filename,
                'features' => $features,
                'formats' => $request->formats,
                'tools' => $request->tools,
                'printable' => $request->printable,
                'customizable' => $request->customizable,
                'release_date' => $request->release_date,
                'vertices' => $request->vertices,
                'price' => $request->price,
                'license' => $request->license
            ]);

            \Log::info('Model created successfully', [
                'model_id' => $model->id,
                'model_data' => $model->toArray()
            ]);

            return response()->json([
                'message' => 'Model created successfully',
                'model' => $model
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating model', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'message' => 'Error creating model',
                'error' => $e->getMessage(),
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    private function getUploadErrorMessage($errorCode)
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
            case UPLOAD_ERR_FORM_SIZE:
                return 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form';
            case UPLOAD_ERR_PARTIAL:
                return 'The uploaded file was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing a temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'A PHP extension stopped the file upload';
            default:
                return 'Unknown upload error';
        }
    }

    // Update model
    public function update(Request $request, $id)
    {
        $user = $request->user();

        $model = Model3D::findOrFail($id);

        if ($model->creator_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'formats' => 'nullable|array',
            'formats.*' => 'string',
            'features' => 'nullable|array',
            'features.*' => 'boolean',
            'release_date' => 'nullable|date',
            'vertices' => 'nullable|integer|min:0',
            'tools' => 'nullable|array',
            'tools.*' => 'string',
            'printable' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'license' => 'nullable|string|max:255',
         
        ]);

        $model->update($data);

        return response()->json($model);
    }

    // Delete model
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $model = Model3D::findOrFail($id);

        if ($model->creator_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $model->delete();

        return response()->json(null, 204);
    }

    public function serveModelFile($filename)
    {
        try {
            \Log::info('Attempting to serve model file', [
                'filename' => $filename
            ]);

            $path = storage_path('app/public/models/' . $filename);

            if (!file_exists($path)) {
                \Log::error('File not found', [
                    'path' => $path
                ]);
                return response()->json([
                    'message' => 'File not found'
                ], 404);
            }

            return response()->file($path, [
                'Content-Type' => 'application/octet-stream',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error serving model file', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error serving file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPublishedModels()
    {
        $models = Model3D::with(['creator:id,name,profile_photo_url'])
            ->whereHas('creator', function ($query) {
                $query->where('role', 'creator');
            })
            ->select([
                'id',
                'title',
                'description',
                'price',
                'images',
                'creator_id',
                'created_at'
            ])
            ->latest()
            ->paginate(12);

        return response()->json($models);
    }
}