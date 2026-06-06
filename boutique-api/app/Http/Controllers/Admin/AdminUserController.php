<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role'   => ['nullable', 'in:customer,vendor,admin'],
            'active' => ['nullable', 'in:0,1'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $users = User::query()
            ->when($request->role, fn ($q, $r) => $q->where('role', $r))
            ->when(
                $request->has('active') && $request->active !== '',
                fn ($q) => $q->where('is_active', (bool) $request->active)
            )
            ->when($request->search, fn ($q, $s) => $q->where(
                fn ($sq) => $sq->where('name', 'like', "%{$s}%")
                               ->orWhere('email', 'like', "%{$s}%")
            ))
            ->select(['id', 'name', 'email', 'role', 'is_active', 'email_verified', 'preferred_locale', 'created_at'])
            ->latest()
            ->paginate(15);

        return $this->success($users, 'Users retrieved successfully.');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        if (auth()->id() === $id) {
            return $this->error('Cannot deactivate your own account.', null, 403);
        }

        $user = User::findOrFail($id);
        $user->update(['is_active' => ! $user->is_active]);

        return $this->success(
            $user->only(['id', 'name', 'email', 'role', 'is_active', 'email_verified', 'preferred_locale', 'created_at']),
            'User status updated.'
        );
    }
}
