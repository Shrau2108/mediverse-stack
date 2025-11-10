<?php
namespace App\Controllers;

use App\Models\LabReport;

class LabReportController extends BaseController
{
    public function __construct(private readonly LabReport $reports = new LabReport()) {}

    public function byPatient(int $patientId): array
    {
        return $this->ok($this->reports->listByPatient($patientId));
    }
}



