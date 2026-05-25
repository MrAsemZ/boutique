<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\VendorApplicationRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Mail\Vendor\VendorApplicationMail;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class VendorApplicationController extends Controller
{
    use ApiResponseTrait;

    public function apply(VendorApplicationRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->vendor()->exists()) {
            return $this->error('You have already submitted a vendor application.', null, 409);
        }

        $vendor = Vendor::create([
            'user_id'        => $user->id,
            'store_name'     => $request->store_name,
            'store_name_ar'  => $request->store_name_ar,
            'slug'           => Str::slug($request->store_name) . '-' . Str::lower(Str::random(6)),
            'description'    => $request->description,
            'description_ar' => $request->description_ar,
            'status'         => 'pending',
        ]);

        $vendor->load('user');

        Mail::to(config('mail.admin_email', env('ADMIN_EMAIL', 'admin@boutique.com')))
            ->send(new VendorApplicationMail($vendor));

        return $this->success($vendor, 'Your vendor application has been submitted and is under review.', 201);
    }
}
