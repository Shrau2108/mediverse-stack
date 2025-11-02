import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Clock,
  Calendar as CalendarIcon,
  UserRound,
  Stethoscope
} from "lucide-react";
import { motion } from "framer-motion";

const appointments = [
  { 
    id: 1, 
    patient: "John Doe", 
    doctor: "Dr. Sarah Smith",
    specialty: "Cardiology",
    date: "2025-11-02",
    time: "10:00 AM", 
    duration: "30 min",
    status: "Scheduled",
    type: "Follow-up"
  },
  { 
    id: 2, 
    patient: "Jane Wilson", 
    doctor: "Dr. Michael Johnson",
    specialty: "Endocrinology",
    date: "2025-11-02",
    time: "11:30 AM", 
    duration: "45 min",
    status: "In Progress",
    type: "Consultation"
  },
  { 
    id: 3, 
    patient: "Bob Brown", 
    doctor: "Dr. Emily Davis",
    specialty: "Orthopedics",
    date: "2025-11-02",
    time: "2:00 PM", 
    duration: "30 min",
    status: "Scheduled",
    type: "Regular Checkup"
  },
  { 
    id: 4, 
    patient: "Alice Cooper", 
    doctor: "Dr. James Miller",
    specialty: "General Medicine",
    date: "2025-11-02",
    time: "3:30 PM", 
    duration: "20 min",
    status: "Scheduled",
    type: "Regular Checkup"
  },
  { 
    id: 5, 
    patient: "David Lee", 
    doctor: "Dr. Sarah Smith",
    specialty: "Cardiology",
    date: "2025-11-02",
    time: "4:30 PM", 
    duration: "30 min",
    status: "Scheduled",
    type: "Follow-up"
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-accent/20 text-accent border-accent/30";
    case "Scheduled":
      return "bg-primary/20 text-primary border-primary/30";
    case "Completed":
      return "bg-success/20 text-success border-success/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Appointments() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage and schedule patient appointments</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5" />
              Today's Schedule - November 2, 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-4 py-2">
                      <span className="text-xs font-medium text-primary">Time</span>
                      <span className="text-sm font-bold text-foreground">{appointment.time}</span>
                    </div>
                    
                    <div className="h-12 w-px bg-border" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{appointment.patient}</span>
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>{appointment.doctor}</span>
                        <span>•</span>
                        <span>{appointment.specialty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {appointment.duration}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Today</p>
                  <p className="text-3xl font-bold text-foreground">48</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-foreground">1</p>
                </div>
                <div className="rounded-xl bg-accent/10 p-3">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                  <p className="text-3xl font-bold text-foreground">4</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <Stethoscope className="h-6 w-6 text-secondary-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
