<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:user,creator,admin', 
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Auth::login($user); // <-- закомментировано, не нужен вход через сессию

        $user->sendEmailVerificationNotification();

        // $cookie = cookie('XSRF-TOKEN', csrf_token(), 60 * 24); // <-- закомментировано, не нужна кука XSRF-TOKEN

        return response()->json([
            'message' => 'Successfully registered',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
{
    $fields = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = \App\Models\User::where('email', $fields['email'])->first();

    if (!$user || !\Illuminate\Support\Facades\Hash::check($fields['password'], $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    // Создаём токен Sanctum
    $token = $user->createToken('API Token')->plainTextToken;

    return response()->json([
        'message' => 'Successfully logged in',
        'token' => $token,
        'user' => $user->only(['id', 'name', 'email', 'role', 'profile_photo_url']),
    ]);
}

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
        return response()->json([], 204);
    }

    public function emailVerify($user_id, Request $request) 
    {
        if (!$request->hasValidSignature()) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
            ], 400);
        }

        $user = User::findOrFail($user_id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 400);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            return response()->json([
                'message' => 'Email address successfully verified',
                'user' => $user,
            ]);
        }

        return response()->json([
            'message' => 'Email address already verified',
        ], 400);
    }

    public function resendEmailVerificationMail(Request $request)
    {
        $user_id = $request->input('user_id');

        $user = User::findOrFail($user_id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Email verification link sent to your email address',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        ); 
        
        return $status === Password::RESET_LINK_SENT
            ? response()->json([
                'message' => trans($status),
            ])
            : response()->json([
                'message' => trans($status)
            ], 400);
    }

    public function resetPassword(Request $request) 
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json([
                'message' => trans($status),
            ])
            : response()->json([
                'message' => trans($status)
            ], 400);
    }
}