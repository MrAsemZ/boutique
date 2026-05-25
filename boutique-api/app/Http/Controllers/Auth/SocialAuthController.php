<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    use ApiResponseTrait;

    private const SUPPORTED_PROVIDERS = ['google', 'facebook'];

    public function redirect(string $provider): JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
            return $this->error("Unsupported provider: {$provider}.", null, 422);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): JsonResponse
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
            return $this->error("Unsupported provider: {$provider}.", null, 422);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception) {
            return $this->error('Social authentication failed. Please try again.', null, 422);
        }

        if (!$socialUser->getEmail()) {
            return $this->error('No email address returned by the provider.', null, 422);
        }

        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name'             => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'password'         => bcrypt(Str::random(40)),
                'role'             => 'customer',
                'is_active'        => true,
                'email_verified'   => true,
                'email_verified_at' => now(),
                'avatar'           => $socialUser->getAvatar(),
            ]
        );

        // If existing user, ensure social login marks them verified
        if (!$user->wasRecentlyCreated && !$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $user->tokens()->where('name', 'auth_token')->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user'       => $user,
            'token'      => $token,
            'token_type' => 'Bearer',
        ], 'Social authentication successful.');
    }
}
