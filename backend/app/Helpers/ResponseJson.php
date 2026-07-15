<?php

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

if (! function_exists('response_success')) {
    /**
     * @param  JsonResponse|JsonResource|ResourceCollection|Collection<int, Model>|array<array-key, mixed>  $data
     */
    function response_success(string $message, JsonResponse|JsonResource|ResourceCollection|Collection|array $data = [], int $status = Response::HTTP_OK): JsonResponse
    {
        return response()->json(
            data: [
                'success' => true,
                'message' => $message,
                'code' => $status,
                'data' => (! empty($data) ? $data : []),
            ],
            status: $status,
        );
    }
}

if (! function_exists('response_failed')) {
    /**
     * @param  JsonResponse|JsonResource|ResourceCollection|Collection<int, Model>|array<array-key, mixed>  $data
     */
    function response_failed(string $message, JsonResponse|JsonResource|ResourceCollection|Collection|array $data = [], int $status = Response::HTTP_NOT_FOUND): JsonResponse
    {
        return response()->json(
            data: [
                'success' => false,
                'message' => $message,
                'code' => $status,
                'data' => (! empty($data) ? $data : []),
            ],
            status: $status,
        );
    }
}
