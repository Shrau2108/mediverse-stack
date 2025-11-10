<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class LabRequest
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO lab_requests (treatment_id, requested_by_doctor_id, test_type, status)
            VALUES (:treatment_id, :doctor_id, :test_type, :status)');
        $stmt->execute([
            ':treatment_id' => $data['treatment_id'],
            ':doctor_id' => $data['requested_by_doctor_id'],
            ':test_type' => $data['test_type'],
            ':status' => $data['status'] ?? 'REQUESTED',
        ]);
        return (int)$this->db->lastInsertId();
    }
}



