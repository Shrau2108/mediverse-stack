import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import {
  Users,
  Stethoscope,
  Activity,
  DollarSign,
  Calendar,
  Pill,
  FileText,
  Bed,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHospitalData } from "@/hooks/useHospitalData";
import { UserRole } from "@/contexts/RoleContext";

interface DashboardContentProps {
  role: UserRole;
}

export function RoleDashboardContent({ role }: DashboardContentProps) {
  return (
    <>
      {role === "Admin" && <AdminDashboard />}
      {role === "Doctor" && <DoctorDashboard />}
      {role === "Nurse" && <NurseDashboard />}
      {role === "Chemist" && <ChemistDashboard />}
      {role === "Attendant" && <AttendantDashboard />}
      {role === "Lab Technician" && <LabTechnicianDashboard />}
      {role === "Patient" && <PatientDashboard />}
    </>
  );
}

// Admin Dashboard Component
export const AdminDashboard = () => {
  const { patients, doctors, rooms, bills, labReports, accommodations, prescriptions, treatments } = useHospitalData();
  
  const todayAppointments = treatments.filter(t => t.status === 'Active').length;
  const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const activeAccommodations = accommodations.filter(a => a.status === 'Active').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Complete hospital overview and management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Available Rooms"
          value={rooms.filter((r) => r.status === "Available").length}
          icon={Bed}
          change="Ready for admission"
        />
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          change={`${patients.filter((p) => p.status === "Critical").length} critical`}
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointments}
          icon={Calendar}
          change="Scheduled"
        />
        <StatCard
          title="Staff on Duty"
          value={doctors.length}
          icon={Stethoscope}
          change={`${doctors.length} doctors`}
        />
        <StatCard
          title="Pending Bills"
          value={bills.filter((b) => b.status === "Pending").length}
          icon={DollarSign}
          change={`Total: $${bills.reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString()}`}
        />
        <StatCard
          title="Prescriptions"
          value={prescriptions.length}
          icon={Pill}
          change="Active prescriptions"
        />
        <StatCard
          title="Lab Tests"
          value={labReports.length}
          icon={FileText}
          change="Pending results"
        />
        <StatCard
          title="Accommodations"
          value={activeAccommodations}
          icon={Bed}
          change="Active accommodations"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Patient</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.slice(0, 5).map((bill) => (
                <tr key={bill.id} className="border-b border-border">
                  <td className="py-3 px-4">Patient {bill.patient_id.slice(0, 8)}</td>
                  <td className="py-3 px-4">${Number(bill.amount).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bill.status === "Paid"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              change="This month"
            />
            <StatCard
              title="Total Bills"
              value={bills.length}
              icon={FileText}
              change="Processed this month"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Doctor Dashboard Component
export const DoctorDashboard = () => {
  const { patients, treatments, labReports, prescriptions } = useHospitalData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Your patients and appointments today</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Patients"
          value={patients.length}
          icon={Users}
          change="Under your care"
        />
        <StatCard
          title="Today's Appointments"
          value={treatments.filter(t => t.status === 'Active').length}
          icon={Calendar}
          change="Scheduled consultations"
        />
        <StatCard
          title="Lab Reports Pending"
          value={labReports.filter(l => l.status === 'Pending').length}
          icon={FileText}
          change="Awaiting review"
        />
        <StatCard
          title="Prescriptions Written"
          value={prescriptions.length}
          icon={Pill}
          change="This month"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Age</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 5).map((patient) => (
                <tr key={patient.id} className="border-b border-border">
                  <td className="py-3 px-4">{patient.name}</td>
                  <td className="py-3 px-4">{new Date(patient.dob).getFullYear()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        patient.status === "Critical"
                          ? "bg-red-500/20 text-red-500"
                          : "bg-green-500/20 text-green-500"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Nurse Dashboard Component
export const NurseDashboard = () => {
  const { patients, treatments, prescriptions } = useHospitalData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nurse Dashboard</h1>
        <p className="text-muted-foreground">Patient care and ward management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Patients"
          value={patients.filter((p) => p.status === 'Active').length}
          icon={Users}
          change="Currently under your care"
        />
        <StatCard
          title="Medications Due"
          value={prescriptions.filter(p => p.status === 'Pending').length}
          icon={Pill}
          change="In the next 2 hours"
        />
        <StatCard
          title="Vitals to Check"
          value={treatments.filter(t => t.status === 'Active').length}
          icon={Activity}
          change="Scheduled today"
        />
        <StatCard
          title="Critical Patients"
          value={patients.filter((p) => p.status === "Critical").length}
          icon={AlertCircle}
          change="Requires immediate attention"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critical Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {patients.filter((p) => p.status === "Critical").length > 0 ? (
            <div className="space-y-3">
              {patients
                .filter((p) => p.status === "Critical")
                .slice(0, 5)
                .map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.disease || "N/A"}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                      Critical
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No critical patients at the moment</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Chemist Dashboard Component
export const ChemistDashboard = () => {
  const { prescriptions } = useHospitalData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chemist Dashboard</h1>
        <p className="text-muted-foreground">Pharmacy inventory and prescriptions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Prescriptions"
          value={prescriptions.filter(p => p.status === 'Pending').length}
          icon={Pill}
          change="To be dispensed"
        />
        <StatCard
          title="Dispensed Today"
          value={prescriptions.filter(p => p.status === 'Dispensed').length}
          icon={FileText}
          change="Completed prescriptions"
        />
        <StatCard
          title="Low Stock Items"
          value={5}
          icon={AlertCircle}
          change="Requires restocking"
        />
        <StatCard
          title="Inventory Value"
          value="$45,000"
          icon={DollarSign}
          change="Current stock value"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Patient</th>
                <th className="text-left py-3 px-4">Medicine</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.slice(0, 5).map((prescription) => (
                <tr key={prescription.id} className="border-b border-border">
                  <td className="py-3 px-4">Patient {prescription.patient_id.slice(0, 8)}</td>
                  <td className="py-3 px-4">{prescription.medicine_name}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline">
                      Dispense
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Attendant Dashboard Component
export const AttendantDashboard = () => {
  const { patients, rooms, accommodations } = useHospitalData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendant Dashboard</h1>
        <p className="text-muted-foreground">Patient support and facility management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Patients to Assist"
          value={patients.length}
          icon={Users}
          change="Requiring attention"
        />
        <StatCard
          title="Meals Pending"
          value={accommodations.filter(a => a.status === 'Active').length}
          icon={Calendar}
          change="To be served"
        />
        <StatCard
          title="Room Cleaning"
          value={rooms.filter((r) => r.status === "Available").length}
          icon={Bed}
          change="Tasks pending"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Meal Distribution</p>
                <p className="text-sm text-muted-foreground">Ward A - Breakfast</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Room Cleaning</p>
                <p className="text-sm text-muted-foreground">Rooms 101-110</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Linen Change</p>
                <p className="text-sm text-muted-foreground">ICU Wing</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Lab Technician Dashboard Component
export const LabTechnicianDashboard = () => {
  const { labReports, patients } = useHospitalData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lab Technician Dashboard</h1>
        <p className="text-muted-foreground">Laboratory tests and reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Tests"
          value={labReports.filter(l => l.status === 'Pending').length}
          icon={FileText}
          change="To be processed"
        />
        <StatCard
          title="In Progress"
          value={labReports.filter(l => l.status === 'In Progress').length}
          icon={Activity}
          change="Currently testing"
        />
        <StatCard
          title="Completed Today"
          value={labReports.filter(l => l.status === 'Completed').length}
          icon={Calendar}
          change="Results submitted"
        />
        <StatCard
          title="Critical Results"
          value={patients.filter((p) => p.status === "Critical").length}
          icon={AlertCircle}
          change="Requires immediate attention"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Lab Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Patient</th>
                <th className="text-left py-3 px-4">Test</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {labReports.slice(0, 5).map((report) => (
                <tr key={report.id} className="border-b border-border">
                  <td className="py-3 px-4">Patient {report.patient_id.slice(0, 8)}</td>
                  <td className="py-3 px-4">{report.test_name}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline">
                      Process
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Patient Dashboard Component
export const PatientDashboard = () => {
  const { treatments, bills, prescriptions, labReports } = useHospitalData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
        <p className="text-muted-foreground">Your medical records and appointments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Appointments"
          value={treatments.length}
          icon={Calendar}
          change="Total appointments"
        />
        <StatCard
          title="Prescriptions"
          value={prescriptions.length}
          icon={Pill}
          change="Active medications"
        />
        <StatCard
          title="Lab Reports"
          value={labReports.length}
          icon={FileText}
          change="Test results"
        />
        <StatCard
          title="Pending Bills"
          value={bills.filter(b => b.status === 'Pending').length}
          icon={DollarSign}
          change="Payment required"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {labReports.length > 0 ? (
            <div className="space-y-3">
              {labReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{report.test_name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(report.date).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      report.status === "Completed"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No lab reports available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {bills.filter(b => b.status === 'Pending').length > 0 ? (
            <div className="space-y-3">
              {bills.filter(b => b.status === 'Pending').slice(0, 5).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Bill #{bill.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">${Number(bill.amount).toLocaleString()}</p>
                  </div>
                  <Button size="sm">Pay Now</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No pending bills</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
