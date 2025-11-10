<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Payment
{
    public function __construct(private readonly PDO $db = new \PDO('sqlite::memory:'))
    {
        $this->db = Database::connection();
    }

    public function create(array $data): int
    {
        // expects: bill_id, amount_cents, method, payer_id, transaction_id
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('INSERT INTO payments (bill_id, amount_cents, method, status, paid_at) VALUES (:bid, :amt, :method, "SUCCESS", NOW())');
            $stmt->execute([
                ':bid' => (int)$data['bill_id'],
                ':amt' => (int)$data['amount_cents'],
                ':method' => $data['method'] ?? 'UPI',
            ]);
            $paymentId = (int)$this->db->lastInsertId();

            // Wallet update: credit
            $prev = $this->db->query('SELECT balance_after_cents FROM hospital_wallet ORDER BY id DESC LIMIT 1')->fetch();
            $prevBal = (int)($prev['balance_after_cents'] ?? 0);
            $newBal = $prevBal + (int)$data['amount_cents'];
            $this->db->prepare('INSERT INTO hospital_wallet (bill_id, payment_id, direction, amount_cents, balance_after_cents)
                VALUES (:bid, :pid, "CREDIT", :amt, :bal)')->execute([
                ':bid' => (int)$data['bill_id'],
                ':pid' => $paymentId,
                ':amt' => (int)$data['amount_cents'],
                ':bal' => $newBal,
            ]);

            // If payment covers total, mark bill PAID
            $q = $this->db->prepare('SELECT total_amount_cents FROM bills WHERE id = :bid');
            $q->execute([':bid' => (int)$data['bill_id']]);
            $billTotal = (int)($q->fetch()['total_amount_cents'] ?? 0);
            if ((int)$data['amount_cents'] >= $billTotal && $billTotal > 0) {
                $this->db->prepare('UPDATE bills SET status = "PAID" WHERE id = :bid')->execute([':bid' => (int)$data['bill_id']]);
            }

            // Activity log
            $this->db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
                VALUES (:uid, :action, :etype, :eid, JSON_OBJECT("bill_id", :bid, "transaction_id", :tx, "amount_cents", :amt))')
                ->execute([
                    ':uid' => (int)($data['payer_id'] ?? 0),
                    ':action' => 'PAYMENT_SUCCESS',
                    ':etype' => 'payments',
                    ':eid' => $paymentId,
                    ':bid' => (int)$data['bill_id'],
                    ':tx' => (string)($data['transaction_id'] ?? ''),
                    ':amt' => (int)$data['amount_cents'],
                ]);

            $this->db->commit();
            return $paymentId;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}



