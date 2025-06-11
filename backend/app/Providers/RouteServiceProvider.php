<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define your route model bindings, pattern filters, etc.
     */
    public function boot(): void
    {
        parent::boot();

        // Обертка для api.php с middleware 'api'
        Route::prefix('api')
            ->middleware('api')
            ->group(base_path('routes/api.php'));

        // Если нужно, добавьте web.php
        Route::middleware('web')
            ->group(base_path('routes/web.php'));

        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });
    }
}