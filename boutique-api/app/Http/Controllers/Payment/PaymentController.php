<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Services\PaymentServices\CliQService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private CliQService $cliqService) {}

    public function cliqWebhook(Request $request): JsonResponse
    {
        // Signature already verified by VerifyCliqWebhook middleware
        $this->cliqService->handleWebhook($request->all());

        return response()->json(['status' => 'ok'], 200);
    }

    public function cliqSimulate(string $cliqRequestId): JsonResponse
    {
        $result = $this->cliqService->simulateApproval($cliqRequestId);

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}
