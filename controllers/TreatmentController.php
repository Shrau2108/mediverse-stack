<?php
namespace App\Controllers;

use App\Models\Treatment;

class TreatmentController extends BaseController
{
    public function __construct(private readonly Treatment $treatments = new Treatment()) {}

    public function index(): array
    {
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        return $this->ok($this->treatments->all($limit, $offset));
    }

    public function show(int $id): array
    {
        $row = $this->treatments->find($id);
        if (!$row) {
            return $this->notFound('Treatment not found');
        }
        return $this->ok($row);
    }

    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['appointment_id','patient_id','doctor_id','diagnosis'] as $field) {
            if (empty($input[$field])) {
                return $this->unprocessable("$field is required");
            }
        }
        // Optional: validate status against allowed values
        $status = $input['status'] ?? 'OPEN';
        $allowed = ['OPEN','IN_PROGRESS','AWAITING_LAB','COMPLETED','CANCELLED'];
        if (!in_array($status, $allowed, true)) {
            return $this->unprocessable('Invalid status');
        }
        try {
            $id = $this->treatments->create($input);
            return $this->created(['id' => $id], 'Treatment created');
        } catch (\Throwable $e) {
            return $this->badRequest('Unable to create treatment');
        }
    }

    public function update(int $id): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($input['diagnosis']) || empty($input['status'])) {
            return $this->unprocessable('diagnosis and status are required');
        }
        $allowed = ['OPEN','IN_PROGRESS','AWAITING_LAB','COMPLETED','CANCELLED'];
        if (!in_array($input['status'], $allowed, true)) {
            return $this->unprocessable('Invalid status');
        }
        $ok = $this->treatments->update($id, $input);
        if (!$ok) {
            return $this->badRequest('Unable to update treatment');
        }
        return $this->ok(['updated' => true], 'Treatment updated');
    }

    public function destroy(int $id): array
    {
        $ok = $this->treatments->delete($id);
        if (!$ok) {
            return $this->badRequest('Unable to delete treatment');
        }
        http_response_code(204);
        return $this->ok(['deleted' => true], 'Treatment deleted');
    }
}



