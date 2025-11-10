<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Patient
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        // The default arg is never used; real instance is provided via Database::connection()
        $this->db = Database::connection();
    }

    public function all(int $limit = 50, int $offset = 0): array
    {
        $stmt = $this->db->prepare('SELECT p.id, u.full_name, u.email, p.dob, p.gender, p.blood_group, p.address
            FROM patients p JOIN users u ON u.id = p.user_id ORDER BY p.id DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT p.*, u.full_name, u.email, u.phone
            FROM patients p JOIN users u ON u.id = p.user_id WHERE p.id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        // Minimal: expects existing users row (role=PATIENT) and provides patient specifics
        $stmt = $this->db->prepare('INSERT INTO patients (user_id, dob, gender, blood_group, emergency_contact, address)
            VALUES (:user_id, :dob, :gender, :blood_group, :emergency_contact, :address)');
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':dob' => $data['dob'] ?? null,
            ':gender' => $data['gender'] ?? null,
            ':blood_group' => $data['blood_group'] ?? null,
            ':emergency_contact' => $data['emergency_contact'] ?? null,
            ':address' => $data['address'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare('UPDATE patients SET dob = :dob, gender = :gender, blood_group = :blood_group,
            emergency_contact = :emergency_contact, address = :address WHERE id = :id');
        return $stmt->execute([
            ':dob' => $data['dob'] ?? null,
            ':gender' => $data['gender'] ?? null,
            ':blood_group' => $data['blood_group'] ?? null,
            ':emergency_contact' => $data['emergency_contact'] ?? null,
            ':address' => $data['address'] ?? null,
            ':id' => $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM patients WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}


