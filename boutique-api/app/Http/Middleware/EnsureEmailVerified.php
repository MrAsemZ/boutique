<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->email_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email address before continuing.',
            ], 403);
        }

        return $next($request);
    }
}
