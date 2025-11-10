<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Prescription
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function create(array $data): int
    {
        // expects: treatment_id, prescribed_by_doctor_id, items: [ { medicine_id, dosage, frequency, days, quantity } ]
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('INSERT INTO prescriptions (treatment_id, prescribed_by_doctor_id) VALUES (:treatment_id, :doctor_id)');
            $stmt->execute([
                ':treatment_id' => $data['treatment_id'],
                ':doctor_id' => $data['prescribed_by_doctor_id'],
            ]);
            $prescriptionId = (int)$this->db->lastInsertId();

            if (!empty($data['items']) && is_array($data['items'])) {
                $itemStmt = $this->db->prepare('INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, days, quantity)
                    VALUES (:pid, :medicine_id, :dosage, :frequency, :days, :quantity)');
                foreach ($data['items'] as $item) {
                    $itemStmt->execute([
                        ':pid' => $prescriptionId,
                        ':medicine_id' => $item['medicine_id'],
                        ':dosage' => $item['dosage'],
                        ':frequency' => $item['frequency'],
                        ':days' => $item['days'],
                        ':quantity' => $item['quantity'],
                    ]);
                }
            }

            $this->db->commit();
            return $prescriptionId;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function markAdministered(int $prescriptionId, int $nurseId): bool
    {
        // No status column in schema; record activity for audit trail
        $stmt = $this->db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
            VALUES (:uid, :action, :etype, :eid, JSON_OBJECT("note", "Prescription doses administered"))');
        return $stmt->execute([
            ':uid' => $nurseId,
            ':action' => 'PRESCRIPTION_ADMINISTERED',
            ':etype' => 'prescriptions',
            ':eid' => $prescriptionId,
        ]);
    }
}



