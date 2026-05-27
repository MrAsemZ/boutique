<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyCliqWebhook
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.cliq.webhook_secret', '');

        if ($secret === '') {
            Log::error('CliQ webhook: CLIQ_WEBHOOK_SECRET is not configured');
            return response()->json(['message' => 'Webhook secret not configured.'], 500);
        }

        $payload   = $request->all();
        $signature = $payload['signature'] ?? '';
        $data      = $payload['data'] ?? [];

        $expected = hash_hmac('sha256', json_encode($data), $secret);

        if (! hash_equals($expected, $signature)) {
            Log::warning('CliQ webhook: invalid signature', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        return $next($request);
    }
}
