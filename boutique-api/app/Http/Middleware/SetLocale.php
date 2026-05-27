<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED = ['ar', 'en'];
    private const DEFAULT   = 'ar';

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolveLocale($request);

        App::setLocale($locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }

    private function resolveLocale(Request $request): string
    {
        // 1. Authenticated user's saved preference
        $user = $request->user();
        if ($user && in_array($user->preferred_locale, self::SUPPORTED, true)) {
            return $user->preferred_locale;
        }

        // 2. Accept-Language header (first matching supported locale)
        $header = $request->header('Accept-Language', '');
        foreach (explode(',', $header) as $part) {
            $tag = strtolower(trim(explode(';', $part)[0]));
            $lang = substr($tag, 0, 2); // "ar-JO" → "ar"
            if (in_array($lang, self::SUPPORTED, true)) {
                return $lang;
            }
        }

        return self::DEFAULT;
    }
}
