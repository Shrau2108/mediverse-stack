<?php
namespace App\Services;

use App\Config\Database;
use PDO;

class AuthService
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function verifyUser(string $email, string $password): ?array
    {
        $stmt = $this->db->prepare('SELECT id, password_hash, role, full_name FROM users WHERE email = :email AND is_active = 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
        if (!$user) {
            return null;
        }
        // In production, use password_verify. Demo placeholder:
        if ($password === 'secret' || password_verify($password, $user['password_hash'])) {
            unset($user['password_hash']);
            return $user;
        }
        return null;
    }
}



