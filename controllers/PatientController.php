<?php
namespace App\Controllers;

use App\Models\Patient;

class PatientController extends BaseController
{
    public function __construct(private readonly Patient $patients = new Patient()) {}

    public function index(): array
    {
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        return $this->ok($this->patients->all($limit, $offset));
    }

    public function show(int $id): array
    {
        $patient = $this->patients->find($id);
        if (!$patient) {
            return $this->notFound('Patient not found');
        }
        return $this->ok($patient);
    }

    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (!isset($input['user_id'])) {
            return $this->unprocessable('user_id is required');
        }
        $id = $this->patients->create($input);
        return $this->created(['id' => $id], 'Patient created');
    }

    public function update(int $id): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $ok = $this->patients->update($id, $input);
        if (!$ok) {
            return $this->badRequest('Unable to update patient');
        }
        return $this->ok(['updated' => true], 'Patient updated');
    }

    public function destroy(int $id): array
    {
        $ok = $this->patients->delete($id);
        if (!$ok) {
            return $this->badRequest('Unable to delete patient');
        }
        http_response_code(204);
        return $this->ok(['deleted' => true], 'Patient deleted');
    }
}


