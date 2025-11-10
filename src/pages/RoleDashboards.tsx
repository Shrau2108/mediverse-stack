import { UserRole } from "@/contexts/RoleContext";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Activity,
  TrendingUp,
  DollarSign,
  FileText,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { socketService } from "@/lib/socket";

interface DashboardContentProps {
  role: UserRole;
}

export function RoleDashboardContent({ role }: DashboardContentProps) {
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

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
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.analytics.getOverview(),
    refetchInterval: 30000,
  });

  const { data: revenue } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => api.analytics.getRevenue(),
  });

  useEffect(() => {
    const socket = socketService.connect();
    socketService.joinRoom('admin:all');
    return () => {
      socketService.leaveRoom('admin:all');
    };
  }, []);

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const occupancyRate = analytics?.rooms?.occupancyRate || 0;

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
          title="Total Patients" 
          value={analytics?.patients?.total?.toLocaleString() || "0"} 
          change={`${analytics?.patients?.active || 0} active`} 
          icon={Users} 
        />
        <StatCard 
          title="Today's Appointments" 
          value={analytics?.todayAppointments?.toLocaleString() || "0"} 
          change="Treatment sessions today" 
          icon={Calendar} 
        />
        <StatCard 
          title="Doctors" 
          value={analytics?.staff?.doctors?.toLocaleString() || "0"} 
          change={`${analytics?.staff?.nurses || 0} nurses`} 
          icon={Stethoscope} 
        />
        <StatCard 
          title="Room Occupancy" 
          value={`${analytics?.rooms?.occupied || 0}/${analytics?.rooms?.total || 0}`} 
          change={`${occupancyRate.toFixed(1)}% occupied`} 
          icon={BedDouble} 
          trend={occupancyRate > 80 ? "up" : undefined}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Pending Bills" 
          value={analytics?.bills?.pending?.toLocaleString() || "0"} 
          change={`${analytics?.bills?.paid || 0} paid`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Pending Prescriptions" 
          value={analytics?.prescriptions?.pending?.toLocaleString() || "0"} 
          change="Awaiting dispense" 
          icon={Pill} 
        />
        <StatCard 
          title="Lab Tests Pending" 
          value={analytics?.labTests?.pending?.toLocaleString() || "0"} 
          change="In progress" 
          icon={FlaskConical} 
        />
        <StatCard 
          title="Active Accommodations" 
          value={analytics?.activeAccommodations?.toLocaleString() || "0"} 
          change="Current in-patients" 
          icon={BedDouble} 
        />
      </div>

      {revenue && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{revenue.totalRevenue?.toLocaleString() || "0"}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              From {revenue.totalBills || 0} paid bills
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function DoctorDashboard() {
  // For demo, using first doctor - in production, use authenticated user's ID
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.doctors.getAll(),
  });

  const doctorId = doctors?.[0]?.Doctor_ID;

  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctors', doctorId, 'patients'],
    queryFn: () => doctorId ? api.doctors.getPatients(doctorId) : Promise.resolve([]),
    enabled: !!doctorId,
  });

  const { data: treatments } = useQuery({
    queryKey: ['treatments', 'doctor', doctorId],
    queryFn: () => doctorId ? api.treatments.getAll({ doctorId, status: 'Active' }) : Promise.resolve([]),
    enabled: !!doctorId,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', 'doctor', doctorId],
    queryFn: () => doctorId ? api.prescriptions.getAll({ doctorId, status: 'Pending' }) : Promise.resolve([]),
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (doctorId) {
      const socket = socketService.connect();
      socketService.joinRoom(`doctor:${doctorId}`);
      return () => {
        socketService.leaveRoom(`doctor:${doctorId}`);
      };
    }
  }, [doctorId]);

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

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
        <StatCard 
          title="Assigned Patients" 
          value={patients?.length?.toLocaleString() || "0"} 
          change="Active cases" 
          icon={Users} 
        />
        <StatCard 
          title="Active Treatments" 
          value={treatments?.length?.toLocaleString() || "0"} 
          change="Ongoing care" 
          icon={Stethoscope} 
        />
        <StatCard 
          title="Pending Prescriptions" 
          value={prescriptions?.length?.toLocaleString() || "0"} 
          change="Awaiting dispense" 
          icon={Pill} 
        />
      </div>

      {patients && patients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.slice(0, 5).map((patient: any) => (
                <div key={patient.Patient_ID} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{patient.Name}</p>
                    <p className="text-sm text-muted-foreground">{patient.Patient_Type} • {patient.Status}</p>
                  </div>
                  <Badge variant={patient.Status === 'Critical' ? 'destructive' : 'default'}>
                    {patient.Status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function NurseDashboard() {
  const { data: nurses } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => api.nurses.getAll(),
  });

  const nurseId = nurses?.[0]?.Nurse_ID;

  const { data: patients, isLoading } = useQuery({
    queryKey: ['nurses', nurseId, 'patients'],
    queryFn: () => nurseId ? api.nurses.getPatients(nurseId) : Promise.resolve([]),
    enabled: !!nurseId,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', 'nurse'],
    queryFn: () => api.prescriptions.getAll({ status: 'Pending' }),
  });

  useEffect(() => {
    if (nurseId) {
      const socket = socketService.connect();
      socketService.joinRoom(`nurse:${nurseId}`);
      return () => {
        socketService.leaveRoom(`nurse:${nurseId}`);
      };
    }
  }, [nurseId]);

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const pendingPrescriptions = prescriptions?.filter((p: any) => 
    patients?.some((pt: any) => pt.Patient_ID === p.Patient_ID)
  ) || [];

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
        <StatCard 
          title="Assigned Patients" 
          value={patients?.length?.toLocaleString() || "0"} 
          change="Under your care" 
          icon={Users} 
        />
        <StatCard 
          title="Medications Due" 
          value={pendingPrescriptions.length.toLocaleString()} 
          change="Pending dispense" 
          icon={Pill} 
        />
        <StatCard 
          title="Active Rooms" 
          value={patients?.filter((p: any) => p.Accommodations?.length > 0)?.length?.toLocaleString() || "0"} 
          change="Ward management" 
          icon={BedDouble} 
        />
      </div>

      {pendingPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPrescriptions.slice(0, 5).map((prescription: any) => (
              <div key={prescription.Prescription_ID} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{prescription.Patient?.Name}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.Medicine_Name} • {prescription.Dosage}
                    </p>
                  </div>
                  <Badge variant="outline">{prescription.Quantity} units</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function ChemistDashboard() {
  const { data: chemists } = useQuery({
    queryKey: ['chemists'],
    queryFn: () => api.chemists.getAll(),
  });

  const chemistId = chemists?.[0]?.Shop_ID;

  const { data: pendingPrescriptions, isLoading } = useQuery({
    queryKey: ['chemists', chemistId, 'prescriptions', 'pending'],
    queryFn: () => chemistId ? api.chemists.getPendingPrescriptions(chemistId) : Promise.resolve([]),
    enabled: !!chemistId,
  });

  useEffect(() => {
    if (chemistId) {
      const socket = socketService.connect();
      socketService.joinRoom(`chemist:${chemistId}`);
      return () => {
        socketService.leaveRoom(`chemist:${chemistId}`);
      };
    }
  }, [chemistId]);

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

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
        <StatCard 
          title="Pending Prescriptions" 
          value={pendingPrescriptions?.length?.toLocaleString() || "0"} 
          change="Awaiting dispense" 
          icon={ClipboardList} 
        />
        <StatCard 
          title="Total Prescriptions" 
          value={(pendingPrescriptions?.length || 0).toLocaleString()} 
          change="This period" 
          icon={Pill} 
        />
        <StatCard 
          title="Ready to Dispense" 
          value={pendingPrescriptions?.length?.toLocaleString() || "0"} 
          change="In queue" 
          icon={Pill} 
        />
      </div>

      {pendingPrescriptions && pendingPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPrescriptions.slice(0, 10).map((prescription: any) => (
              <div key={prescription.Prescription_ID} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{prescription.Patient?.Name}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.Medicine_Name} • {prescription.Dosage} • {prescription.Frequency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{prescription.Quantity} units</Badge>
                    <Button 
                      size="sm"
                      onClick={() => {
                        api.chemists.dispensePrescription(prescription.Prescription_ID);
                      }}
                    >
                      Dispense
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function AttendantDashboard() {
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.patients.getAll(),
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms', 'available'],
    queryFn: () => api.rooms.getAvailable(),
  });

  const { data: accommodations } = useQuery({
    queryKey: ['accommodations', 'active'],
    queryFn: () => api.accommodations.getActive(),
  });

  if (patientsLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const todayPatients = patients?.filter((p: any) => {
    const today = new Date().toDateString();
    return new Date(p.CreatedAt).toDateString() === today;
  }) || [];

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
          title="Total Patients" 
          value={patients?.length?.toLocaleString() || "0"} 
          change={`${todayPatients.length} registered today`} 
          icon={Users} 
        />
        <StatCard 
          title="Available Rooms" 
          value={rooms?.length?.toLocaleString() || "0"} 
          change="Ready for assignment" 
          icon={BedDouble} 
        />
        <StatCard 
          title="Active Accommodations" 
          value={accommodations?.length?.toLocaleString() || "0"} 
          change="Currently occupied" 
          icon={ClipboardList} 
        />
      </div>

      {todayPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's New Patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayPatients.slice(0, 5).map((patient: any) => (
              <div key={patient.Patient_ID} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{patient.Name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.Patient_Type} • {patient.Gender} • {patient.Phone || 'No phone'}
                  </p>
                </div>
                <Badge variant={patient.Status === 'Emergency' ? 'destructive' : 'default'}>
                  {patient.Status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function LabTechnicianDashboard() {
  const { data: pendingTests, isLoading } = useQuery({
    queryKey: ['lab-reports', 'pending'],
    queryFn: () => api.labReports.getPending(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = socketService.connect();
    socketService.joinRoom('lab:all');
    return () => {
      socketService.leaveRoom('lab:all');
    };
  }, []);

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const urgentTests = pendingTests?.filter((test: any) => 
    test.Category === 'Blood' || test.Status === 'In Progress'
  ) || [];

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
        <StatCard 
          title="Pending Tests" 
          value={pendingTests?.length?.toLocaleString() || "0"} 
          change="Awaiting completion" 
          icon={FlaskConical} 
        />
        <StatCard 
          title="Urgent Tests" 
          value={urgentTests.length.toLocaleString()} 
          change="High priority" 
          icon={AlertCircle} 
        />
        <StatCard 
          title="Total Tests Today" 
          value={(pendingTests?.length || 0).toLocaleString()} 
          change="In queue" 
          icon={ClipboardList} 
        />
      </div>

      {pendingTests && pendingTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Lab Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTests.slice(0, 10).map((test: any) => (
              <div key={test.Lab_No} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{test.Patient?.Name}</p>
                    <p className="text-sm text-muted-foreground">
                      {test.Test_Name} • {test.Category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={test.Status === 'In Progress' ? 'default' : 'outline'}>
                      {test.Status}
                    </Badge>
                    {test.Status === 'Pending' && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          api.labReports.update(test.Lab_No, { Status: 'Completed' });
                        }}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function PatientDashboard() {
  // For demo, using first patient - in production, use authenticated user's ID
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.patients.getAll(),
  });

  const patientId = patients?.[0]?.Patient_ID;

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => patientId ? api.patients.getById(patientId) : Promise.resolve(null),
    enabled: !!patientId,
  });

  useEffect(() => {
    if (patientId) {
      const socket = socketService.connect();
      socketService.joinRoom(`patient:${patientId}`);
      return () => {
        socketService.leaveRoom(`patient:${patientId}`);
      };
    }
  }, [patientId]);

  if (isLoading || !patient) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const appointments = patient.Treatments || [];
  const prescriptions = patient.Prescriptions || [];
  const labResults = patient.LabReports || [];

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
        <StatCard 
          title="Treatment History" 
          value={appointments.length.toLocaleString()} 
          change="Total treatments" 
          icon={Calendar} 
        />
        <StatCard 
          title="Active Prescriptions" 
          value={prescriptions.filter((p: any) => p.Status !== 'Completed').length.toLocaleString()} 
          change="Medications" 
          icon={Pill} 
        />
        <StatCard 
          title="Lab Results" 
          value={labResults.length.toLocaleString()} 
          change="Test reports available" 
          icon={FlaskConical} 
        />
      </div>

      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Treatments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.slice(0, 5).map((treatment: any) => (
              <div key={treatment.Treatment_ID} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{treatment.Doctor?.Name}</p>
                    <p className="text-sm text-muted-foreground">{treatment.Diagnosis || 'No diagnosis recorded'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(treatment.Treatment_Date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={treatment.Status === 'Active' ? 'default' : 'secondary'}>
                    {treatment.Status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
