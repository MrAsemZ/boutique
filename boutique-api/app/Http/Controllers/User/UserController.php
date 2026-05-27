<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
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
