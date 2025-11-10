<?php
namespace App\Controllers;

use App\Models\Nurse;
use App\Config\Database;

class NurseController extends BaseController
{
    public function __construct(private readonly Nurse $nurses = new Nurse()) {}

    public function assign(int $id): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $patientId = (int)($input['patient_id'] ?? 0);
        $accommodationId = (int)($input['accommodation_id'] ?? 0);
        if ($patientId <= 0 || $accommodationId <= 0) {
            return $this->unprocessable('patient_id and accommodation_id are required');
        }
        $ok = $this->nurses->assignToAccommodation($id, $patientId, $accommodationId);
        if (!$ok) {
            return $this->badRequest('Unable to assign nurse');
        }

        // Log activity
        $db = Database::connection();
        $db->prepare('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
            VALUES (:uid, :action, :etype, :eid, JSON_OBJECT("patient_id", :pid, "accommodation_id", :aid))')
            ->execute([':uid' => $id, ':action' => 'NURSE_ASSIGNED', ':etype' => 'accommodations', ':eid' => $accommodationId, ':pid' => $patientId, ':aid' => $accommodationId]);

        return $this->ok(['assigned' => true], 'Nurse assigned to patient');
    }
}



