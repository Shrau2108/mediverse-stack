<?php
namespace App\Controllers;

use App\Config\Database;

class PatientQueryController extends BaseController
{
    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['patient_user_id','doctor_user_id','subject','message'] as $f) {
            if (empty($input[$f])) {
                return $this->unprocessable("$f is required");
            }
        }
        $db = Database::connection();
        $ok = $db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
            VALUES (:uid, :action, :etype, :eid, JSON_OBJECT("doctor_user_id", :du, "subject", :subject, "message", :message))')
            ->execute([
                ':uid' => (int)$input['patient_user_id'],
                ':action' => 'PATIENT_QUERY',
                ':etype' => 'users',
                ':eid' => (int)$input['doctor_user_id'],
                ':du' => (int)$input['doctor_user_id'],
                ':subject' => (string)$input['subject'],
                ':message' => (string)$input['message'],
            ]);
        if (!$ok) {
            return $this->badRequest('Unable to send query');
        }
        return $this->created(['sent' => true], 'Query sent to doctor');
    }
}



