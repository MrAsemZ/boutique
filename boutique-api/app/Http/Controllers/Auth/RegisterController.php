<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    use ApiResponseTrait;

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => $request->password,
            'phone'          => $request->phone,
            'gender'         => $request->gender,
            'role'           => 'customer',
            'is_active'      => true,
            'email_verified' => false,
        ]);

        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user'       => $user,
            'token'      => $token,
            'token_type' => 'Bearer',
        ], 'Registration successful. Please check your email to verify your account.', 201);
    }

    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return $this->error('Invalid verification link.', null, 403);
        }

        if (!$request->hasValidSignature()) {
            return $this->error('Verification link has expired. Please request a new one.', null, 403);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email address is already verified.');
        }

        $user->markEmailAsVerified();

        return $this->success(null, 'Email verified successfully. You may now log in.');
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email address is already verified.');
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Verification email has been resent.');
    }
}
