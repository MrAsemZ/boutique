<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $request->user()->load('vendor'),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'phone'           => 'sometimes|string|max:20',
            'gender'          => 'sometimes|string|in:male,female',
            'date_of_birth'   => 'sometimes|date|before:today',
            'preferred_theme' => 'sometimes|string|in:light,dark',
        ]);

        $request->user()->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.user.profile_updated'),
            'data'    => $request->user()->fresh()->load('vendor'),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => __('messages.user.wrong_current_password'),
            ], 422);
        }

        $user->update(['password' => bcrypt($request->password)]);

        // Revoke all other tokens — keep the current session active
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.user.password_changed'),
        ]);
    }

    public function updateLocale(Request $request): JsonResponse
    {
        $request->validate([
            'locale' => ['required', 'string', 'in:' . implode(',', config('app.available_locales', ['ar', 'en']))],
        ]);

        $request->user()->update(['preferred_locale' => $request->locale]);

        app()->setLocale($request->locale);

        return response()->json([
            'success' => true,
            'message' => __('messages.user.locale_updated'),
            'data'    => ['locale' => $request->locale],
        ]);
    }
}
