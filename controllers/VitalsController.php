<?php
namespace App\Controllers;

use App\Config\Database;

class VitalsController extends BaseController
{
    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['nurse_id','patient_id','vitals'] as $f) {
            if (empty($input[$f])) {
                return $this->unprocessable("$f is required");
            }
        }
        // Persist vitals as audit log JSON
        $db = Database::connection();
        $ok = $db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
            VALUES (:uid, :action, :etype, :eid, :meta)')
            ->execute([
                ':uid' => (int)$input['nurse_id'],
                ':action' => 'VITALS_RECORDED',
                ':etype' => 'patients',
                ':eid' => (int)$input['patient_id'],
                ':meta' => json_encode($input['vitals']),
            ]);
        if (!$ok) {
            return $this->badRequest('Unable to log vitals');
        }
        return $this->created(['logged' => true], 'Vitals recorded');
    }
}



