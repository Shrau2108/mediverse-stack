import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  BedDouble,
  ArrowRight,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const recentAppointments = [
  { id: 1, patient: "John Doe", doctor: "Dr. Smith", time: "10:00 AM", status: "Scheduled" },
  { id: 2, patient: "Jane Wilson", doctor: "Dr. Johnson", time: "11:30 AM", status: "In Progress" },
  { id: 3, patient: "Bob Brown", doctor: "Dr. Davis", time: "2:00 PM", status: "Scheduled" },
  { id: 4, patient: "Alice Cooper", doctor: "Dr. Miller", time: "3:30 PM", status: "Scheduled" },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your hospital overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Patients"
            value="1,284"
            change="+12% from last month"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Today's Appointments"
            value="48"
            change="+8 from yesterday"
            icon={Calendar}
            trend="up"
          />
          <StatCard
            title="Available Doctors"
            value="24"
            change="On duty today"
            icon={Stethoscope}
          />
          <StatCard
            title="Occupied Beds"
            value="142/200"
            change="71% occupancy"
            icon={BedDouble}
          />
        </div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
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
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
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
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        appointment.status === "In Progress"
                          ? "bg-accent/20 text-accent"
                          : "bg-primary/20 text-primary"
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                  <Users className="h-8 w-8" />
                  <span>Add New Patient</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                  <Calendar className="h-8 w-8" />
                  <span>Schedule Appointment</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                  <Stethoscope className="h-8 w-8" />
                  <span>View Medical Records</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
