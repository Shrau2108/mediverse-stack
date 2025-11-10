<?php
namespace App\Services;

use App\Config\Database;
use PDO;

class BillingService
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function getPatientBills(int $patientId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM bills WHERE patient_id = :pid ORDER BY id DESC');
        $stmt->execute([':pid' => $patientId]);
        return $stmt->fetchAll();
    }
}



