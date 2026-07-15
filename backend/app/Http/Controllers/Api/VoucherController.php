<?php

namespace App\Http\Controllers\Api;

use App\Actions\GenerateVoucherAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckVoucherRequest;
use App\Http\Requests\GenerateVoucherRequest;
use App\Http\Resources\GeneratedVoucherResource;
use App\Http\Resources\VoucherAvailabilityResource;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class VoucherController extends Controller
{
    public function __construct(private GenerateVoucherAction $generateVoucher) {}

    public function check(CheckVoucherRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $exists = Voucher::query()->forFlight($validated['flightNumber'], $validated['date'])->exists();

        return response_success(
            'Voucher availability checked successfully.',
            new VoucherAvailabilityResource($exists),
        );
    }

    public function generate(GenerateVoucherRequest $request): JsonResponse
    {
        $voucher = $this->generateVoucher->handle($request->validated());

        return response_success(
            'Vouchers generated successfully.',
            new GeneratedVoucherResource($voucher),
            Response::HTTP_CREATED,
        );
    }
}
