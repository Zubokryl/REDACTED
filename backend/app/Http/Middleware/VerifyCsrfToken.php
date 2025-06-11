<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Session\TokenMismatchException;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
          
        'sanctum/csrf-cookie', 
     
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
{
        $serverCsrfToken = $request->session()->token();
        $clientCsrfToken = $request->header('X-XSRF-TOKEN');
     

    return parent::handle($request, $next);
}

protected function tokensMatch($request)
{
    return $request->session()->token() === $request->header('X-XSRF-TOKEN');
}

}