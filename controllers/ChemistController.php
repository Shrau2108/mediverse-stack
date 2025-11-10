<?php
namespace App\Controllers;

use App\Models\Chemist as ChemistModel;
use App\Models\MedicineIssue;

class ChemistController extends BaseController
{
    public function __construct(
        private readonly ChemistModel $chem = new ChemistModel(),
        private readonly MedicineIssue $issues = new MedicineIssue()
    ) {}

    public function pending(): array
    {
        $limit = (int)($_GET['limit'] ?? 100);
        $offset = (int)($_GET['offset'] ?? 0);
        return $this->ok($this->chem->pendingPrescriptions($limit, $offset));
    }

    public function issue(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['prescription_item_id','patient_id','chemist_id','issued_quantity'] as $f) {
            if (!isset($input[$f])) {
                return $this->unprocessable("$f is required");
            }
        }
        try {
            $id = $this->issues->issue([
                'prescription_item_id' => (int)$input['prescription_item_id'],
                'patient_id' => (int)$input['patient_id'],
                'chemist_id' => (int)$input['chemist_id'],
                'issued_quantity' => (int)$input['issued_quantity'],
            ]);
            return $this->created(['id' => $id], 'Medicine issued');
        } catch (\Throwable $e) {
            return $this->badRequest($e->getMessage());
        }
    }
}



