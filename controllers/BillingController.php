<?php
namespace App\Controllers;

use App\Models\Billing;
use App\Services\BillingService;

class BillingController extends BaseController
{
    public function __construct(
        private readonly Billing $billing = new Billing(),
        private readonly BillingService $service = new BillingService()
    ) {}

    public function generate(int $patientId): array
    {
        try {
            $summary = $this->billing->generateBillForPatient($patientId);
            return $this->created($summary, 'Bill generated');
        } catch (\Throwable $e) {
            return $this->badRequest($e->getMessage());
        }
    }

    public function patientBills(int $patientId): array
    {
        return $this->ok($this->service->getPatientBills($patientId));
    }
}



