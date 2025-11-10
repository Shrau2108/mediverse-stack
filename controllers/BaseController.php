<?php
namespace App\Controllers;

abstract class BaseController
{
    protected function ok(mixed $data = null, string $message = 'OK'): array
    {
        return ['success' => true, 'data' => $data, 'message' => $message];
    }

    protected function created(mixed $data = null, string $message = 'Created'): array
    {
        http_response_code(201);
        return ['success' => true, 'data' => $data, 'message' => $message];
    }

    protected function badRequest(string $message = 'Bad Request', mixed $data = null): array
    {
        http_response_code(400);
        return ['success' => false, 'data' => $data, 'message' => $message];
    }

    protected function notFound(string $message = 'Not Found'): array
    {
        http_response_code(404);
        return ['success' => false, 'data' => null, 'message' => $message];
    }

    protected function unprocessable(string $message = 'Validation error', mixed $data = null): array
    {
        http_response_code(422);
        return ['success' => false, 'data' => $data, 'message' => $message];
    }
}



