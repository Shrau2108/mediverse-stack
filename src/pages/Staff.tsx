import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

const staff = [
  { 
    id: 1, 
    name: "Dr. Sarah Smith", 
    role: "Cardiologist",
    department: "Cardiology",
    phone: "+1 234-567-8911",
    email: "sarah.smith@medicare.com",
    experience: "15 years",
    status: "Available",
    patients: 28
  },
  { 
    id: 2, 
    name: "Dr. Michael Johnson", 
    role: "Endocrinologist",
    department: "Endocrinology",
    phone: "+1 234-567-8912",
    email: "michael.j@medicare.com",
    experience: "12 years",
    status: "In Consultation",
    patients: 32
  },
  { 
    id: 3, 
    name: "Dr. Emily Davis", 
    role: "Orthopedic Surgeon",
    department: "Orthopedics",
    phone: "+1 234-567-8913",
    email: "emily.davis@medicare.com",
    experience: "10 years",
    status: "Available",
    patients: 24
  },
  { 
    id: 4, 
    name: "Dr. James Miller", 
    role: "General Physician",
    department: "General Medicine",
    phone: "+1 234-567-8914",
    email: "james.miller@medicare.com",
    experience: "8 years",
    status: "On Break",
    patients: 35
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-success/20 text-success border-success/30";
    case "In Consultation":
      return "bg-accent/20 text-accent border-accent/30";
    case "On Break":
      return "bg-warning/20 text-warning border-warning/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Staff() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Staff</h1>
            <p className="text-muted-foreground">Manage doctors and healthcare professionals</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Staff Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {staff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm font-medium text-primary">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Experience: {member.experience}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Active Patients: {member.patients}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Schedule
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
