<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Appointment
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function listByPatient(int $patientId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM appointments WHERE patient_id = :pid ORDER BY scheduled_at DESC');
        $stmt->execute([':pid' => $patientId]);
        return $stmt->fetchAll();
    }
}



