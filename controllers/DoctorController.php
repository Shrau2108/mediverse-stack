<?php
namespace App\Controllers;

use App\Models\Doctor;

class DoctorController extends BaseController
{
    public function __construct(private readonly Doctor $doctors = new Doctor()) {}

    public function index(): array
    {
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        return $this->ok($this->doctors->all($limit, $offset));
    }

    public function show(int $id): array
    {
        $doctor = $this->doctors->find($id);
        if (!$doctor) {
            return $this->notFound('Doctor not found');
        }
        return $this->ok($doctor);
    }

    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['user_id','specialty','license_no'] as $field) {
            if (empty($input[$field])) {
                return $this->unprocessable("$field is required");
            }
        }
        try {
            $id = $this->doctors->create($input);
            return $this->created(['id' => $id], 'Doctor created');
        } catch (\Throwable $e) {
            return $this->badRequest('Unable to create doctor');
        }
    }

    public function update(int $id): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($input['specialty'])) {
            return $this->unprocessable('specialty is required');
        }
        $ok = $this->doctors->update($id, $input);
        if (!$ok) {
            return $this->badRequest('Unable to update doctor');
        }
        return $this->ok(['updated' => true], 'Doctor updated');
    }

    public function destroy(int $id): array
    {
        $ok = $this->doctors->delete($id);
        if (!$ok) {
            return $this->badRequest('Unable to delete doctor');
        }
        http_response_code(204);
        return $this->ok(['deleted' => true], 'Doctor deleted');
    }
}



