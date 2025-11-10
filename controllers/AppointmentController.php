<?php
namespace App\Controllers;

use App\Models\Appointment;

class AppointmentController extends BaseController
{
    public function __construct(private readonly Appointment $appointments = new Appointment()) {}

    public function index(): array
    {
        $patientId = (int)($_GET['patient_id'] ?? 0);
        if ($patientId <= 0) {
            return $this->unprocessable('patient_id is required');
        }
        return $this->ok($this->appointments->listByPatient($patientId));
    }
}



