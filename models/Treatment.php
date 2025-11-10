<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Treatment
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function all(int $limit = 50, int $offset = 0): array
    {
        $stmt = $this->db->prepare('SELECT t.id, t.appointment_id, t.patient_id, t.doctor_id, t.diagnosis, t.status,
            t.created_at, t.updated_at FROM treatments t ORDER BY t.id DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM treatments WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO treatments (appointment_id, patient_id, doctor_id, diagnosis, status)
            VALUES (:appointment_id, :patient_id, :doctor_id, :diagnosis, :status)');
        $stmt->execute([
            ':appointment_id' => $data['appointment_id'],
            ':patient_id' => $data['patient_id'],
            ':doctor_id' => $data['doctor_id'],
            ':diagnosis' => $data['diagnosis'],
            ':status' => $data['status'] ?? 'OPEN',
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare('UPDATE treatments SET diagnosis = :diagnosis, status = :status WHERE id = :id');
        return $stmt->execute([
            ':diagnosis' => $data['diagnosis'],
            ':status' => $data['status'],
            ':id' => $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM treatments WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}



