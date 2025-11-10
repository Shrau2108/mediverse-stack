<?php
namespace App\Controllers;

use App\Models\LabRequest;
use App\Config\Database;
use App\Services\NotificationService;

class LabTechController extends BaseController
{
    public function __construct(
        private readonly LabRequest $requests = new LabRequest(),
        private readonly NotificationService $notify = new NotificationService()
    ) {}

    public function pending(): array
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT lq.id, lq.treatment_id, lq.requested_by_doctor_id, lq.test_type, lq.status
            FROM lab_requests lq WHERE lq.status = "REQUESTED" ORDER BY lq.id DESC');
        return $this->ok($stmt->fetchAll());
    }

    public function uploadReport(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['lab_request_id','processed_by_labtech_id','url'] as $f) {
            if (empty($input[$f])) {
                return $this->unprocessable("$f is required");
            }
        }
        $db = Database::connection();
        $db->beginTransaction();
        try {
            // Insert report with findings containing URL JSON
            $ins = $db->prepare('INSERT INTO lab_reports (lab_request_id, processed_by_labtech_id, findings) VALUES (:lrid, :ltid, :find)');
            $ins->execute([
                ':lrid' => (int)$input['lab_request_id'],
                ':ltid' => (int)$input['processed_by_labtech_id'],
                ':find' => json_encode(['url' => (string)$input['url'], 'notes' => (string)($input['notes'] ?? '')]),
            ]);
            $reportId = (int)$db->lastInsertId();

            // Update lab request status to COMPLETED
            $db->prepare('UPDATE lab_requests SET status = "COMPLETED" WHERE id = :id')->execute([':id' => (int)$input['lab_request_id']]);

            // Resolve doctor user id for notification
            $q = $db->prepare('SELECT requested_by_doctor_id, t.patient_id, t.doctor_id, d.user_id AS doctor_user_id
                FROM lab_requests lq JOIN treatments t ON t.id = lq.treatment_id
                JOIN doctors d ON d.id = t.doctor_id WHERE lq.id = :id');
            $q->execute([':id' => (int)$input['lab_request_id']]);
            $row = $q->fetch();

            // Log activity
            $db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
                VALUES (:uid, :action, :etype, :eid, JSON_OBJECT("lab_request_id", :lrid, "url", :url))')
                ->execute([
                    ':uid' => (int)$input['processed_by_labtech_id'],
                    ':action' => 'LAB_REPORT_UPLOADED',
                    ':etype' => 'lab_reports',
                    ':eid' => $reportId,
                    ':lrid' => (int)$input['lab_request_id'],
                    ':url' => (string)$input['url'],
                ]);

            // Notify doctor
            if ($row && (int)$row['doctor_user_id'] > 0) {
                $this->notify->notifyDoctor((int)$row['doctor_user_id'], 'Lab report available', [
                    'lab_request_id' => (int)$input['lab_request_id'],
                    'lab_report_id' => $reportId,
                    'url' => (string)$input['url'],
                ]);
            }

            $db->commit();
            return $this->created(['id' => $reportId], 'Lab report uploaded');
        } catch (\Throwable $e) {
            $db->rollBack();
            return $this->badRequest('Unable to upload report');
        }
    }
}



