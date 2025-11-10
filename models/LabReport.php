<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class LabReport
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function listByPatient(int $patientId): array
    {
        $stmt = $this->db->prepare('SELECT lr.*
            FROM lab_reports lr
            JOIN lab_requests lq ON lq.id = lr.lab_request_id
            JOIN treatments t ON t.id = lq.treatment_id
            WHERE t.patient_id = :pid
            ORDER BY lr.id DESC');
        $stmt->execute([':pid' => $patientId]);
        return $stmt->fetchAll();
    }
}



