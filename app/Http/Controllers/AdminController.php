<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getStats()
    {
        $stats = [
            'total_patients' => Patient::count(),
            'total_revenue' => Appointment::where('status', 'completed')
                ->sum('amount_paid'),
            'bed_occupancy' => [
                'occupied' => DB::table('beds')->where('status', 'occupied')->count(),
                'total' => DB::table('beds')->count(),
                'percentage' => DB::table('beds')
                    ->selectRaw('ROUND((COUNT(CASE WHEN status = "occupied" THEN 1 END) * 100.0) / COUNT(*), 2) as percentage')
                    ->value('percentage') ?? 0
            ]
        ];

        return response()->json($stats);
    }

    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active')
            ->orderBy('role')
            ->get()
            ->groupBy('role');

        return response()->json($users);
    }

    public function deactivateUser($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deactivating own account
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot deactivate your own account'], 403);
        }

        $user->update(['is_active' => false]);
        
        // Log the action
        activity('admin')
            ->causedBy(auth()->user())
            ->withProperties(['ip' => request()->ip()])
            ->log("Deactivated user: {$user->email}");

        return response()->json(['message' => 'User deactivated successfully']);
    }
}
