<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ModelController;
use App\Http\Controllers\DigitalOrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StripeWebhookController;

// Auth routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/email/verify/{id}/{hash}', [AuthController::class, 'emailVerify'])->name('verification.verify');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');

// Public routes
Route::get('/shop/models', [ModelController::class, 'getPublishedModels']);
Route::get('models/file/{filename}', [ModelController::class, 'serveModelFile']);
Route::get('/creator/{id}', [ProfileController::class, 'getCreatorProfile']);
Route::get('/models/{id}', [ModelController::class, 'show']);

Route::post('/webhooks/stripe', StripeWebhookController::class);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/resend-email-verify', [AuthController::class, 'resendEmailVerificationMail']);

    Route::post('/payments', PaymentController::class);

    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::match(['put', 'post'], '/profile', [ProfileController::class, 'updateProfile']);

    Route::get('/user', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });

    // ModelController CRUD
    Route::get('/models', [ModelController::class, 'index']);
    Route::post('/models', [ModelController::class, 'store']);
    Route::put('/models/{id}', [ModelController::class, 'update']);
    Route::delete('/models/{id}', [ModelController::class, 'destroy']);

    // CartController
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);

    // DigitalOrderController
    Route::get('/orders', [DigitalOrderController::class, 'index']);
    Route::post('/orders', [DigitalOrderController::class, 'store']);
    Route::post('/orders/bulk', [DigitalOrderController::class, 'bulkStore']);
    Route::post('/orders/all', [DigitalOrderController::class, 'storeAllModels']);
    Route::get('/orders/{id}', [DigitalOrderController::class, 'show']);
    Route::get('/orders/{id}/download', [DigitalOrderController::class, 'download']);
});