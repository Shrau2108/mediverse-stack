<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Doctor
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function all(int $limit = 50, int $offset = 0): array
    {
        $stmt = $this->db->prepare('SELECT d.id, u.full_name, u.email, d.specialty, d.license_no
            FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY d.id DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT d.*, u.full_name, u.email, u.phone
            FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO doctors (user_id, specialty, license_no)
            VALUES (:user_id, :specialty, :license_no)');
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':specialty' => $data['specialty'],
            ':license_no' => $data['license_no'],
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare('UPDATE doctors SET specialty = :specialty WHERE id = :id');
        return $stmt->execute([
            ':specialty' => $data['specialty'],
            ':id' => $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM doctors WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}



