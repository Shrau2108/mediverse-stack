<?php

namespace App\Http\Controllers;

use App\Events\PrescriptionCreated;
use App\Events\TreatmentUpdated;
use App\Models\Prescription;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorController extends Controller
{
    /**
     * Create a new prescription and broadcast the event
     */
    public function createPrescription(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medicines' => 'required|array',
            'medicines.*.medicine_id' => 'required|exists:medicines,id',
            'medicines.*.dosage' => 'required|string',
            'medicines.*.frequency' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($validated) {
            $prescription = Prescription::create([
                'doctor_id' => auth()->id(),
                'patient_id' => $validated['patient_id'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending'
            ]);

            // Add prescription items
            foreach ($validated['medicines'] as $medicine) {
                $prescription->items()->create([
                    'medicine_id' => $medicine['medicine_id'],
                    'dosage' => $medicine['dosage'],
                    'frequency' => $medicine['frequency'],
                    'status' => 'pending'
                ]);
            }

            // Broadcast the event
            event(new PrescriptionCreated([
                'prescription_id' => $prescription->id,
                'patient_id' => $prescription->patient_id,
                'doctor_id' => $prescription->doctor_id,
                'created_at' => $prescription->created_at->toDateTimeString(),
                'medicines_count' => $prescription->items->count()
            ]));

            return response()->json([
                'message' => 'Prescription created successfully',
                'data' => $prescription->load('items')
            ], 201);
        });
    }

    /**
     * Update treatment and broadcast the event
     */
    public function updateTreatment(Request $request, $treatmentId)
    {
        $validated = $request->validate([
            'status' => 'required|in:in_progress,completed,pending',
            'notes' => 'nullable|string',
            'next_steps' => 'nullable|string'
        ]);

        $treatment = Treatment::findOrFail($treatmentId);
        
        $treatment->update($validated);

        // Broadcast the event
        event(new TreatmentUpdated([
            'treatment_id' => $treatment->id,
            'patient_id' => $treatment->patient_id,
            'doctor_id' => $treatment->doctor_id,
            'status' => $treatment->status,
            'updated_at' => $treatment->updated_at->toDateTimeString()
        ]));

        return response()->json([
            'message' => 'Treatment updated successfully',
            'data' => $treatment
        ]);
    }
}
