<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Nurse
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function assignToAccommodation(int $nurseId, int $patientId, int $accommodationId): bool
    {
        // Ensure the accommodation belongs to patient
        $stmt = $this->db->prepare('UPDATE accommodations SET admitted_by_nurse_id = :nid
            WHERE id = :aid AND patient_id = :pid');
        return $stmt->execute([':nid' => $nurseId, ':aid' => $accommodationId, ':pid' => $patientId]);
    }
}



