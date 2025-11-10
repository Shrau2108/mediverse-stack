<?php
namespace App\Controllers;

use App\Models\Prescription;

class PrescriptionController extends BaseController
{
    public function __construct(private readonly Prescription $prescriptions = new Prescription()) {}

    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['treatment_id','prescribed_by_doctor_id'] as $field) {
            if (empty($input[$field])) {
                return $this->unprocessable("$field is required");
            }
        }
        try {
            $id = $this->prescriptions->create($input);
            return $this->created(['id' => $id], 'Prescription created');
        } catch (\Throwable $e) {
            return $this->badRequest('Unable to create prescription');
        }
    }

    public function markAdministered(int $id): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $nurseId = (int)($input['nurse_id'] ?? 0);
        if ($nurseId <= 0) {
            return $this->unprocessable('nurse_id is required');
        }
        $ok = $this->prescriptions->markAdministered($id, $nurseId);
        if (!$ok) {
            return $this->badRequest('Unable to mark administered');
        }
        return $this->ok(['marked' => true], 'Doses marked as administered');
    }
}



