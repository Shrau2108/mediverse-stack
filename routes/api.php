<?php
namespace App\Routes;

use App\Controllers\PatientController;
use App\Controllers\DoctorController;
use App\Controllers\TreatmentController;
use App\Controllers\PrescriptionController;
use App\Controllers\LabRequestController;
use App\Controllers\LabReportController;
use App\Controllers\NurseController;
use App\Controllers\AppointmentController;
use App\Controllers\VitalsController;
use App\Controllers\PatientQueryController;
use App\Controllers\ChemistController;
use App\Controllers\LabTechController;
use App\Controllers\BillingController;
use App\Controllers\PaymentController;
use App\Controllers\WalletController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuditController;

return static function (Router $router): void {
    // Health check
    $router->get('/health', fn () => ['status' => 'ok']);

    // Patient CRUD
    $router->get('/patients', [PatientController::class, 'index']);
    $router->get('/patients/{id}', [PatientController::class, 'show']);
    $router->post('/patients', [PatientController::class, 'store']);
    $router->put('/patients/{id}', [PatientController::class, 'update']);
    $router->delete('/patients/{id}', [PatientController::class, 'destroy']);

    // Doctor CRUD
    $router->get('/doctors', [DoctorController::class, 'index']);
    $router->get('/doctors/{id}', [DoctorController::class, 'show']);
    $router->post('/doctors', [DoctorController::class, 'store']);
    $router->put('/doctors/{id}', [DoctorController::class, 'update']);
    $router->delete('/doctors/{id}', [DoctorController::class, 'destroy']);

    // Treatment CRUD
    $router->get('/treatments', [TreatmentController::class, 'index']);
    $router->get('/treatments/{id}', [TreatmentController::class, 'show']);
    $router->post('/treatments', [TreatmentController::class, 'store']);
    $router->put('/treatments/{id}', [TreatmentController::class, 'update']);
    $router->delete('/treatments/{id}', [TreatmentController::class, 'destroy']);

    // Prescriptions
    $router->post('/prescriptions', [PrescriptionController::class, 'store']);
    $router->put('/prescriptions/{id}/mark-administered', [PrescriptionController::class, 'markAdministered']);

    // Lab Requests & Reports
    $router->post('/lab-requests', [LabRequestController::class, 'store']);
    $router->get('/lab-reports/{id}', [LabReportController::class, 'byPatient']);

    // Nurse workflow
    $router->put('/nurses/{id}/assign', [NurseController::class, 'assign']);
    $router->post('/vitals', [VitalsController::class, 'store']);

    // Patient workflow
    $router->get('/appointments', [AppointmentController::class, 'index']);
    $router->post('/patient-queries', [PatientQueryController::class, 'store']);

    // Chemist module
    $router->get('/prescriptions/pending', [ChemistController::class, 'pending']);
    $router->post('/medicine-issues', [ChemistController::class, 'issue']);

    // Lab Technician module
    $router->get('/lab-requests/pending', [LabTechController::class, 'pending']);
    $router->post('/lab-reports', [LabTechController::class, 'uploadReport']);

    // Billing & Payments
    $router->post('/bills/generate/{id}', [BillingController::class, 'generate']);
    $router->get('/bills/{id}', [BillingController::class, 'patientBills']);
    $router->post('/payments', [PaymentController::class, 'store']);
    $router->get('/wallet', [WalletController::class, 'current']);

    // Admin routes
    $router->group(['middleware' => ['auth:api', 'role:admin']], function ($router) {
        // System statistics
        $router->get('/admin/stats', [AdminController::class, 'getStats']);
        
        // User management
        $router->get('/admin/users', [AdminController::class, 'getUsers']);
        $router->put('/admin/users/{id}/deactivate', [AdminController::class, 'deactivateUser']);
        
        // Audit logs
        $router->get('/admin/audit/logs', [AuditController::class, 'getLogs']);
    });

    // Audit logs - accessible by all authenticated users with appropriate permissions
    $router->group(['middleware' => ['auth:api', 'role:admin,doctor,nurse']], function ($router) {
        $router->get('/audit/logs', [AuditController::class, 'getLogs']);
    });
};


