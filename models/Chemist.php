<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Chemist
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function pendingPrescriptions(int $limit = 100, int $offset = 0): array
    {
        // Items where issued total < prescribed quantity
        $sql = 'SELECT pi.id AS prescription_item_id, pr.id AS prescription_id, t.patient_id, pr.prescribed_by_doctor_id,
                       m.id AS medicine_id, m.name, pi.dosage, pi.frequency, pi.days, pi.quantity,
                       COALESCE(SUM(mi.issued_quantity), 0) AS issued_quantity
                FROM prescription_items pi
                JOIN prescriptions pr ON pr.id = pi.prescription_id
                JOIN treatments t ON t.id = pr.treatment_id
                JOIN medicines m ON m.id = pi.medicine_id
                LEFT JOIN medicine_issues mi ON mi.prescription_item_id = pi.id
                GROUP BY pi.id
                HAVING issued_quantity < pi.quantity
                ORDER BY pi.id DESC
                LIMIT :limit OFFSET :offset';
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}



