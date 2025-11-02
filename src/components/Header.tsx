import { useRole, UserRole } from "@/contexts/RoleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

const roleColors: Record<UserRole, string> = {
  Admin: "text-red-600",
  Doctor: "text-blue-600",
  Nurse: "text-green-600",
  Chemist: "text-purple-600",
  Attendant: "text-orange-600",
  "Lab Technician": "text-teal-600",
  Patient: "text-pink-600",
};

export function Header() {
  const { currentRole, setCurrentRole, availableRoles } = useRole();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <motion.div
            key={currentRole}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <UserCircle className={`h-8 w-8 ${roleColors[currentRole]}`} />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">Currently viewing as</p>
            <motion.p
              key={currentRole}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`font-semibold ${roleColors[currentRole]}`}
            >
              {currentRole}
            </motion.p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Switch Role
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card z-50">
            <DropdownMenuLabel>Select Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableRoles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`cursor-pointer ${
                  currentRole === role ? "bg-accent" : ""
                }`}
              >
                <UserCircle className={`mr-2 h-4 w-4 ${roleColors[role]}`} />
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
