import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  UserRound,
  Phone,
  Mail,
  Calendar,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

const patients = [
  { 
    id: 1, 
    name: "John Doe", 
    age: 45, 
    gender: "Male", 
    phone: "+1 234-567-8901",
    email: "john.doe@email.com",
    lastVisit: "2025-10-28",
    condition: "Hypertension",
    status: "Active"
  },
  { 
    id: 2, 
    name: "Jane Wilson", 
    age: 32, 
    gender: "Female", 
    phone: "+1 234-567-8902",
    email: "jane.wilson@email.com",
    lastVisit: "2025-10-30",
    condition: "Diabetes Type 2",
    status: "Active"
  },
  { 
    id: 3, 
    name: "Bob Brown", 
    age: 58, 
    gender: "Male", 
    phone: "+1 234-567-8903",
    email: "bob.brown@email.com",
    lastVisit: "2025-10-15",
    condition: "Arthritis",
    status: "Follow-up"
  },
  { 
    id: 4, 
    name: "Alice Cooper", 
    age: 28, 
    gender: "Female", 
    phone: "+1 234-567-8904",
    email: "alice.cooper@email.com",
    lastVisit: "2025-11-01",
    condition: "Regular Checkup",
    status: "Active"
  },
];

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Patient
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search patients by name or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardHeader className="border-b border-border bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <UserRound className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} years • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <Badge variant={patient.status === "Active" ? "default" : "secondary"}>
                      {patient.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last visit: {patient.lastVisit}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{patient.condition}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Record
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Schedule
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
