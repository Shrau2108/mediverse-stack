<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Billing
{
    private const CONSULTATION_FEE_CENTS = 50000; // per treatment
    private const LAB_REQUEST_FEE_CENTS = 8000;   // per lab request

    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function generateBillForPatient(int $patientId): array
    {
        // Find latest treatment for the patient
        $t = $this->db->prepare('SELECT * FROM treatments WHERE patient_id = :pid ORDER BY id DESC LIMIT 1');
        $t->execute([':pid' => $patientId]);
        $treatment = $t->fetch();
        if (!$treatment) {
            throw new \RuntimeException('No treatment found for patient');
        }
        $treatmentId = (int)$treatment['id'];

        $this->db->beginTransaction();
        try {
            // Create bill
            $this->db->prepare('INSERT INTO bills (patient_id, treatment_id, total_amount_cents, status, issued_at) VALUES (:pid, :tid, 0, "ISSUED", NOW())')
                ->execute([':pid' => $patientId, ':tid' => $treatmentId]);
            $billId = (int)$this->db->lastInsertId();

            // Consultation item
            $this->insertItem($billId, 'CONSULTATION', $treatmentId, 'Doctor consultation', self::CONSULTATION_FEE_CENTS);

            // Room charges: sum accommodations days * room daily rate for this patient
            $roomStmt = $this->db->prepare('SELECT r.id AS room_id, r.daily_rate_cents,
                CEIL(TIMESTAMPDIFF(HOUR, a.start_datetime, COALESCE(a.end_datetime, NOW()))/24) AS days
                FROM accommodations a JOIN rooms r ON r.id = a.room_id
                WHERE a.patient_id = :pid AND a.status <> "CANCELLED"');
            $roomStmt->execute([':pid' => $patientId]);
            $roomTotal = 0;
            while ($row = $roomStmt->fetch()) {
                $days = max(1, (int)$row['days']);
                $amount = $days * (int)$row['daily_rate_cents'];
                $roomTotal += $amount;
            }
            if ($roomTotal > 0) {
                $this->insertItem($billId, 'ROOM', 0, 'Room charges', $roomTotal);
            }

            // Lab charges for this treatment
            $labStmt = $this->db->prepare('SELECT COUNT(*) AS c FROM lab_requests WHERE treatment_id = :tid');
            $labStmt->execute([':tid' => $treatmentId]);
            $labCount = (int)($labStmt->fetch()['c'] ?? 0);
            if ($labCount > 0) {
                $this->insertItem($billId, 'LAB', 0, 'Laboratory charges', $labCount * self::LAB_REQUEST_FEE_CENTS);
            }

            // Medicine charges for prescriptions under this treatment
            $medStmt = $this->db->prepare('SELECT SUM(pi.quantity * m.unit_price_cents) AS total
                FROM prescriptions pr JOIN prescription_items pi ON pi.prescription_id = pr.id
                JOIN medicines m ON m.id = pi.medicine_id WHERE pr.treatment_id = :tid');
            $medStmt->execute([':tid' => $treatmentId]);
            $medTotal = (int)($medStmt->fetch()['total'] ?? 0);
            if ($medTotal > 0) {
                $this->insertItem($billId, 'MEDICINE', 0, 'Medicines dispensed', $medTotal);
            }

            // Update total
            $tot = $this->db->prepare('SELECT SUM(amount_cents) AS total FROM bill_items WHERE bill_id = :bid');
            $tot->execute([':bid' => $billId]);
            $total = (int)($tot->fetch()['total'] ?? 0);
            $this->db->prepare('UPDATE bills SET total_amount_cents = :t WHERE id = :bid')
                ->execute([':t' => $total, ':bid' => $billId]);

            $this->db->commit();
            return ['bill_id' => $billId, 'treatment_id' => $treatmentId, 'total_amount_cents' => $total];
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function insertItem(int $billId, string $type, int $refId, string $desc, int $amountCents): void
    {
        $this->db->prepare('INSERT INTO bill_items (bill_id, item_type, ref_id, description, amount_cents)
            VALUES (:bid, :type, :ref, :desc, :amt)')->execute([
            ':bid' => $billId,
            ':type' => $type,
            ':ref' => $refId ?: null,
            ':desc' => $desc,
            ':amt' => $amountCents,
        ]);
    }
}



