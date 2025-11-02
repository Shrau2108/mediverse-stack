import { UserRole } from "@/contexts/RoleContext";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  BedDouble,
  ArrowRight,
  Clock,
  Pill,
  FlaskConical,
  ClipboardList,
  Heart,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

const recentAppointments = [
  { id: 1, patient: "John Doe", doctor: "Dr. Smith", time: "10:00 AM", status: "Scheduled" },
  { id: 2, patient: "Jane Wilson", doctor: "Dr. Johnson", time: "11:30 AM", status: "In Progress" },
  { id: 3, patient: "Bob Brown", doctor: "Dr. Davis", time: "2:00 PM", status: "Scheduled" },
];

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

function AdminDashboard() {
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
        <StatCard title="Total Patients" value="1,284" change="+12% from last month" icon={Users} trend="up" />
        <StatCard title="Today's Appointments" value="48" change="+8 from yesterday" icon={Calendar} trend="up" />
        <StatCard title="Available Doctors" value="24" change="On duty today" icon={Stethoscope} />
        <StatCard title="Occupied Beds" value="142/200" change="71% occupancy" icon={BedDouble} />
      </div>

      <AppointmentsCard />
    </motion.div>
  );
}

function DoctorDashboard() {
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

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Today's Patients" value="12" change="3 pending" icon={Users} />
        <StatCard title="Appointments" value="15" change="2 completed" icon={Calendar} />
        <StatCard title="Urgent Cases" value="2" change="Requires attention" icon={Heart} />
      </div>

      <AppointmentsCard />
    </motion.div>
  );
}

function NurseDashboard() {
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

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Assigned Patients" value="28" change="Ward A & B" icon={Users} />
        <StatCard title="Medications Due" value="14" change="Next 2 hours" icon={Pill} />
        <StatCard title="Vital Checks" value="8" change="Pending" icon={Activity} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TaskItem task="Administer medication - Ward A" time="10:30 AM" />
          <TaskItem task="Vital signs check - Room 204" time="11:00 AM" />
          <TaskItem task="Patient discharge - Room 301" time="2:00 PM" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChemistDashboard() {
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

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Prescriptions Today" value="42" change="18 pending" icon={ClipboardList} />
        <StatCard title="Low Stock Items" value="8" change="Reorder needed" icon={Pill} />
        <StatCard title="Dispensed Today" value="34" change="8 more to go" icon={Pill} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Prescriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PrescriptionItem patient="John Doe" medicine="Amoxicillin 500mg" qty="30 tablets" />
          <PrescriptionItem patient="Jane Wilson" medicine="Metformin 850mg" qty="60 tablets" />
          <PrescriptionItem patient="Bob Brown" medicine="Ibuprofen 400mg" qty="20 tablets" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AttendantDashboard() {
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
        <StatCard title="Patients Assisted" value="15" change="Today" icon={Users} />
        <StatCard title="Room Cleaning" value="8/12" change="67% complete" icon={BedDouble} />
        <StatCard title="Meal Distribution" value="42" change="Next round: 1:00 PM" icon={ClipboardList} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TaskItem task="Ward rounds - Floor 2" time="9:00 AM" />
          <TaskItem task="Lunch distribution - All wards" time="12:30 PM" />
          <TaskItem task="Evening medication support" time="6:00 PM" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LabTechnicianDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lab Technician Dashboard</h1>
        <p className="text-muted-foreground">Laboratory tests and results</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Tests Today" value="32" change="24 completed" icon={FlaskConical} />
        <StatCard title="Pending Results" value="8" change="In progress" icon={ClipboardList} />
        <StatCard title="Urgent Tests" value="3" change="Priority" icon={Activity} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Lab Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LabTestItem patient="John Doe" test="Complete Blood Count" priority="High" />
          <LabTestItem patient="Jane Wilson" test="Lipid Profile" priority="Normal" />
          <LabTestItem patient="Bob Brown" test="Urine Analysis" priority="Normal" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PatientDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Portal</h1>
        <p className="text-muted-foreground">Your health information and appointments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Upcoming Appointments" value="2" change="Next: Tomorrow" icon={Calendar} />
        <StatCard title="Prescriptions" value="3" change="Active" icon={Pill} />
        <StatCard title="Lab Results" value="1" change="New result available" icon={FlaskConical} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AppointmentItem doctor="Dr. Sarah Smith" specialty="Cardiology" date="Nov 3, 2025" time="10:00 AM" />
          <AppointmentItem doctor="Dr. James Miller" specialty="General Medicine" date="Nov 10, 2025" time="2:30 PM" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper Components
function AppointmentsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Today's Appointments</CardTitle>
        <Button variant="outline" size="sm">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{appointment.patient}</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {appointment.time}
                </div>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                  {appointment.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskItem({ task, time }: { task: string; time: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm text-foreground">{task}</span>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

function PrescriptionItem({ patient, medicine, qty }: { patient: string; medicine: string; qty: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">{patient}</p>
          <p className="text-sm text-muted-foreground">{medicine}</p>
        </div>
        <span className="text-sm text-muted-foreground">{qty}</span>
      </div>
    </div>
  );
}

function LabTestItem({ patient, test, priority }: { patient: string; test: string; priority: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">{patient}</p>
          <p className="text-sm text-muted-foreground">{test}</p>
        </div>
        <span className={`text-xs font-medium ${priority === "High" ? "text-destructive" : "text-muted-foreground"}`}>
          {priority}
        </span>
      </div>
    </div>
  );
}

function AppointmentItem({ doctor, specialty, date, time }: { doctor: string; specialty: string; date: string; time: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">{doctor}</p>
          <p className="text-sm text-muted-foreground">{specialty}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{date}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}
