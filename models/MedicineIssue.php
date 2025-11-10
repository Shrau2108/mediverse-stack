<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class MedicineIssue
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function issue(array $data): int
    {
        // expects: prescription_item_id, patient_id, chemist_id, issued_quantity
        $this->db->beginTransaction();
        try {
            // Check stock
            $stmt = $this->db->prepare('SELECT m.id, m.stock_quantity, pi.quantity, COALESCE(SUM(mi.issued_quantity),0) AS already
                FROM prescription_items pi
                JOIN medicines m ON m.id = pi.medicine_id
                LEFT JOIN medicine_issues mi ON mi.prescription_item_id = pi.id
                WHERE pi.id = :piid
                GROUP BY m.id, m.stock_quantity, pi.quantity');
            $stmt->execute([':piid' => $data['prescription_item_id']]);
            $row = $stmt->fetch();
            if (!$row) {
                throw new \RuntimeException('Prescription item not found');
            }
            $remainingNeeded = (int)$row['quantity'] - (int)$row['already'];
            $toIssue = (int)$data['issued_quantity'];
            if ($toIssue <= 0 || $toIssue > $remainingNeeded) {
                throw new \RuntimeException('Invalid issue quantity');
            }
            if ((int)$row['stock_quantity'] < $toIssue) {
                throw new \RuntimeException('Insufficient stock');
            }

            // Create issue
            $ins = $this->db->prepare('INSERT INTO medicine_issues (prescription_item_id, patient_id, chemist_id, issued_quantity)
                VALUES (:piid, :pid, :cid, :qty)');
            $ins->execute([
                ':piid' => $data['prescription_item_id'],
                ':pid' => $data['patient_id'],
                ':cid' => $data['chemist_id'],
                ':qty' => $toIssue,
            ]);
            $issueId = (int)$this->db->lastInsertId();

            // Decrement stock
            $upd = $this->db->prepare('UPDATE medicines SET stock_quantity = stock_quantity - :qty WHERE id = :mid');
            $upd->execute([':qty' => $toIssue, ':mid' => (int)$row['id']]);

            // Activity log
            $this->db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
                VALUES (:uid, :action, :etype, :eid, JSON_OBJECT("prescription_item_id", :piid, "quantity", :qty))')
                ->execute([
                    ':uid' => (int)$data['chemist_id'],
                    ':action' => 'MEDICINE_DISPATCHED',
                    ':etype' => 'medicine_issues',
                    ':eid' => $issueId,
                    ':piid' => (int)$data['prescription_item_id'],
                    ':qty' => $toIssue,
                ]);

            $this->db->commit();
            return $issueId;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}



