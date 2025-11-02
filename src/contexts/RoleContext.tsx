import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = 
  | "Admin" 
  | "Doctor" 
  | "Nurse" 
  | "Chemist" 
  | "Attendant" 
  | "Lab Technician" 
  | "Patient";

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  availableRoles: UserRole[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const availableRoles: UserRole[] = [
  "Admin",
  "Doctor",
  "Nurse",
  "Chemist",
  "Attendant",
  "Lab Technician",
  "Patient",
];

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("Admin");

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        availableRoles,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
