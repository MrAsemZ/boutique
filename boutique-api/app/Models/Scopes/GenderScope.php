<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class GenderScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Try Sanctum guard first (works even on public routes with a Bearer token present)
        $user = Auth::guard('sanctum')->user();

        // Female and prefer_not_to_say users see everything
        if ($user && in_array($user->gender, ['female', 'prefer_not_to_say'])) {
            return;
        }

        // Guests and male users never see women-exclusive products
        $builder->where('is_exclusive_women', false);
    }
}
