<?php
namespace App\Controllers;

use App\Models\LabRequest;

class LabRequestController extends BaseController
{
    public function __construct(private readonly LabRequest $requests = new LabRequest()) {}

    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['treatment_id','requested_by_doctor_id','test_type'] as $f) {
            if (empty($input[$f])) {
                return $this->unprocessable("$f is required");
            }
        }
        try {
            $id = $this->requests->create($input);
            return $this->created(['id' => $id], 'Lab request created');
        } catch (\Throwable $e) {
            return $this->badRequest('Unable to create lab request');
        }
    }
}



