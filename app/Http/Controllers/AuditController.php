<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

class AuditController extends Controller
{
    public function getLogs(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        
        $logs = Activity::with('causer')
            ->select('id', 'log_name', 'description', 'subject_type', 'subject_id', 
                    'causer_type', 'causer_id', 'properties', 'created_at')
            ->latest()
            ->paginate($perPage);

        // Transform the log data
        $transformedLogs = $logs->getCollection()->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->description,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'caused_by' => $log->causer ? [
                    'id' => $log->causer->id,
                    'name' => $log->causer->name,
                    'email' => $log->causer->email,
                    'role' => $log->causer->role,
                ] : null,
                'ip_address' => $log->properties['ip'] ?? null,
                'performed_at' => $log->created_at->toDateTimeString(),
                'details' => $log->properties
            ];
        });

        return response()->json([
            'data' => $transformedLogs,
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ]
        ]);
    }
}
