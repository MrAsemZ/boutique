<?php

namespace App\Http\Middleware;

use App\Services\PaymentServices\PayPalService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyPayPalWebhook
{
    public function __construct(private PayPalService $payPalService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $rawBody = $request->getContent();
        $headers = array_change_key_case($request->headers->all(), CASE_LOWER);
        // Flatten single-value header arrays
        $flatHeaders = array_map(fn($v) => is_array($v) ? $v[0] : $v, $headers);

        if (! $this->payPalService->verifyWebhookSignature($flatHeaders, $rawBody)) {
            Log::warning('PayPal webhook: invalid signature', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        return $next($request);
    }
}
