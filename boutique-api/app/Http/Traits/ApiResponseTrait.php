<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponseTrait
{
    protected function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $payload = ['success' => true, 'message' => $message];

        if (!is_null($data)) {
            if ($data instanceof ResourceCollection && $data->resource instanceof \Illuminate\Pagination\AbstractPaginator) {
                $resolved = $data->response()->getData(true);
                $payload['data']  = $resolved['data'];
                $payload['links'] = $resolved['links'];
                $payload['meta']  = $resolved['meta'];
            } else {
                $payload['data'] = $data;
            }
        }

        return response()->json($payload, $statusCode);
    }

    protected function error(string $message = 'An error occurred', mixed $errors = null, int $statusCode = 400): JsonResponse
    {
        $payload = ['success' => false, 'message' => $message];

        if (!is_null($errors)) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $statusCode);
    }
}
