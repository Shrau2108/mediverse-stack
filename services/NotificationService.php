<?php
namespace App\Services;

use App\Config\Database;

class NotificationService
{
    public function notifyDoctor(int $doctorUserId, string $title, array $payload = []): void
    {
        // Placeholder: log notification to activity_logs; can be replaced by Pusher/socket later
        $db = Database::connection();
        $db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
            VALUES (:uid, :action, :etype, :eid, :meta)')
            ->execute([
                ':uid' => $doctorUserId,
                ':action' => 'DOCTOR_NOTIFIED',
                ':etype' => 'notifications',
                ':eid' => 0,
                ':meta' => json_encode(['title' => $title, 'payload' => $payload]),
            ]);
    }
}



