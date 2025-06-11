<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function getCreatorProfile($id)
    {
        $user = \App\Models\User::where('id', $id)
            ->where('role', 'creator')
            ->firstOrFail();

        $software = $user->software;
        if (is_string($software)) {
            $software = array_map('trim', explode(',', $software));
        } elseif (is_array($software)) {
            // do nothing
        } elseif (is_null($software)) {
            $software = [];
        } else {
            $software = [];
        }

        $profile = [
            'id' => $user->id,
            'name' => $user->name,
            'about' => $user->about ?? '',
            'experience' => $user->experience ?? '',
            'contact' => $user->contact ?? '',
            'skills' => $user->skills ?? '',
            'software' => $software,
            'profile_photo_url' => $user->profile_photo_url ?? '',
            'socialLinks' => json_decode($user->social_links ?? '{}', true),
        ];

        if (is_array($profile['socialLinks'])) {
            $profile['socialLinks'] = array_filter(
                array_map(
                    fn($v) => $v === null ? '' : $v,
                    $profile['socialLinks']
                ),
                fn($v) => $v !== ''
            );
        }

        return response()->json($profile);
    }

    public function getProfile()
    {
        \Log::info('=== PROFILE REQUEST ===');
        \Log::info('Cookies', ['cookies' => request()->cookies->all()]);
        \Log::info('Session ID', ['id' => session()->getId()]);
        \Log::info('Session data', ['data' => session()->all()]);
        \Log::info('Auth user', ['user' => Auth::user()]);
        \Log::info('Request headers', ['headers' => request()->headers->all()]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        switch ($user->role) {
            case 'creator':
                return $this->getCreatorProfile($user->id);
            case 'admin':
                return $this->getAdminProfile($user);
            case 'user':
            default:
                return $this->getUserProfile($user);
        }
    }

    protected function getAdminProfile($user)
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'about' => 'Admin user profile info',
            'experience' => '',
            'contact' => $user->email,
            'skills' => '',
            'software' => [],
            'profile_photo_url' => '',
            'socialLinks' => [],
        ]);
    }

    protected function getUserProfile($user)
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'about' => 'Regular user profile info',
            'experience' => '',
            'contact' => $user->email,
            'skills' => '',
            'software' => [],
            'profile_photo_url' => '',
            'socialLinks' => [],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        switch ($user->role) {
            case 'creator':
                return $this->updateCreatorProfile($request, $user);
            case 'admin':
                return response()->json(['message' => 'Admin profile editing not allowed'], 403);
            case 'user':
            default:
                return response()->json(['message' => 'User profile editing not allowed'], 403);
        }
    }

    protected function updateCreatorProfile(Request $request, $user)
    {
        \Log::info('=== UPDATE PROFILE REQUEST ===');
        \Log::info('Headers:', $request->headers->all());
        \Log::info('Auth user:', ['user' => $user]);
        \Log::info('Raw request data:', $request->all());
        \Log::info('Request files:', $request->allFiles());
        \Log::info('Request content type:', ['content_type' => $request->header('Content-Type')]);
        \Log::info('Request method:', ['method' => $request->method()]);

        // Get all data from request
        $input = $request->all();
        \Log::info('All input data:', $input);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'about' => 'nullable|string',
            'experience' => 'nullable|string',
            'contact' => 'nullable|string',
            'skills' => 'nullable|string',
            'software' => 'nullable|array',
            'software.*' => 'string',
            'socialLinks' => 'nullable|array',
            'socialLinks.*' => 'string|nullable',
            'profile_photo' => 'nullable|file|image|max:2048',
        ]);

        \Log::info('Validated data:', $data);

        // Update user fields
        $user->name = $data['name'];
        $user->about = $data['about'] ?? $user->about;
        $user->experience = $data['experience'] ?? $user->experience;
        $user->contact = $data['contact'] ?? $user->contact;
        $user->skills = $data['skills'] ?? $user->skills;

        // Software array - store as CSV
        if (isset($data['software']) && is_array($data['software'])) {
            $softwareArray = array_values($data['software']);
            $user->software = implode(',', $softwareArray);
        }

        // Social links - store as JSON
        if (isset($data['socialLinks']) && is_array($data['socialLinks'])) {
            $socialLinks = array_filter($data['socialLinks'], function($value) {
                return $value !== null && $value !== '';
            });
            $user->social_links = json_encode($socialLinks);
        }

        // Handle profile photo
        if ($request->hasFile('profile_photo')) {
            \Log::info('Processing uploaded profile photo');
            $file = $request->file('profile_photo');
            
            if (!$file->isValid()) {
                \Log::error('Invalid file upload:', [
                    'error' => $file->getError(),
                    'message' => $file->getErrorMessage()
                ]);
                throw new \Exception('Invalid file upload: ' . $file->getErrorMessage());
            }

            \Log::info('File details:', [
                'name' => $file->getClientOriginalName(),
                'type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension()
            ]);

            // Delete old photo if exists
            if ($user->profile_photo_url) {
                $oldPath = str_replace(asset('storage/'), '', $user->profile_photo_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Generate unique filename
            $filename = 'profile_photos/' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            try {
                // Store the file
                $path = $file->storeAs('profile_photos', basename($filename), 'public');
                
                if (!$path) {
                    throw new \Exception('Failed to store file');
                }

                // Update user profile
                $user->profile_photo_url = asset('storage/' . $path);
                
                \Log::info('Profile photo saved successfully:', [
                    'filename' => $filename,
                    'path' => $path,
                    'url' => $user->profile_photo_url
                ]);
            } catch (\Exception $e) {
                \Log::error('Error saving profile photo:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } else {
            \Log::info('No profile photo uploaded');
        }

        \Log::info('Saving user data:', [
            'name' => $user->name,
            'about' => $user->about,
            'experience' => $user->experience,
            'contact' => $user->contact,
            'skills' => $user->skills,
            'software' => $user->software,
            'social_links' => $user->social_links,
            'profile_photo_url' => $user->profile_photo_url,
        ]);

        try {
            $user->save();
            \Log::info('User data saved successfully');
        } catch (\Exception $e) {
            \Log::error('Error saving user data:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        return $this->getCreatorProfile($user->id);
    }
}