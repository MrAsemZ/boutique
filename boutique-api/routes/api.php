<?php

use App\Http\Controllers\Admin\VendorManagementController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Cart\CartController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Vendor\VendorApplicationController;
use App\Http\Controllers\Voucher\VoucherController;
use App\Http\Controllers\Wishlist\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('register', [RegisterController::class, 'register'])->name('register');
    Route::post('login', [LoginController::class, 'login'])->name('login')->middleware('throttle:login');

    Route::get('verify-email/{id}/{hash}', [RegisterController::class, 'verifyEmail'])
        ->name('verify-email')
        ->middleware('signed');

    Route::post('forgot-password', [PasswordController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('reset-password', [PasswordController::class, 'resetPassword'])->name('reset-password');

    Route::prefix('social')->name('social.')->group(function () {
        Route::get('{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('redirect');
        Route::get('{provider}/callback', [SocialAuthController::class, 'callback'])->name('callback');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [LoginController::class, 'logout'])->name('logout');
        Route::get('me', [LoginController::class, 'me'])->name('me');
        Route::post('resend-verification', [RegisterController::class, 'resendVerification'])->name('resend-verification');
    });
});

/*
|--------------------------------------------------------------------------
| Products — public (GenderScope applied automatically)
|--------------------------------------------------------------------------
*/
Route::prefix('products')->name('products.')->group(function () {
    Route::get('featured', [ProductController::class, 'featured'])->name('featured');
    Route::get('{slug}', [ProductController::class, 'show'])->name('show');
    Route::get('/', [ProductController::class, 'index'])->name('index');
});

/*
|--------------------------------------------------------------------------
| Categories — public
|--------------------------------------------------------------------------
*/
Route::prefix('categories')->name('categories.')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('index');
    Route::get('{slug}/products', [CategoryController::class, 'products'])->name('products');
});

/*
|--------------------------------------------------------------------------
| Cart — auth required
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/', [CartController::class, 'store'])->name('store');
    Route::put('{id}', [CartController::class, 'update'])->name('update');
    Route::delete('{id}', [CartController::class, 'destroy'])->name('destroy');
    Route::delete('/', [CartController::class, 'clear'])->name('clear');
});

/*
|--------------------------------------------------------------------------
| Wishlist — auth required
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('wishlist')->name('wishlist.')->group(function () {
    Route::get('/', [WishlistController::class, 'index'])->name('index');
    Route::post('/', [WishlistController::class, 'store'])->name('store');
    Route::delete('{id}', [WishlistController::class, 'destroy'])->name('destroy');
});

/*
|--------------------------------------------------------------------------
| Vouchers — auth required
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('vouchers')->name('vouchers.')->group(function () {
    Route::post('validate', [VoucherController::class, 'validate'])->name('validate');
});

/*
|--------------------------------------------------------------------------
| Vendor Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'email.verified'])->group(function () {
    Route::post('vendor/apply', [VendorApplicationController::class, 'apply'])->name('vendor.apply');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('vendors', [VendorManagementController::class, 'index'])->name('vendors.index');
    Route::put('vendors/{id}/approve', [VendorManagementController::class, 'approve'])->name('vendors.approve');
    Route::put('vendors/{id}/reject', [VendorManagementController::class, 'reject'])->name('vendors.reject');
});
