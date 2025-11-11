import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient, Doctor, Nurse, Chemist, Room, Bill, LabReport, Treatment, Accommodation, Prescription } from "@/lib/types";

export const useHospitalData = () => {
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: nurses = [] } = useQuery<Nurse[]>({
    queryKey: ["nurses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nurses").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: chemists = [] } = useQuery<Chemist[]>({
    queryKey: ["chemists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chemists").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ["bills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bills").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: labReports = [] } = useQuery<LabReport[]>({
    queryKey: ["lab_reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lab_reports").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: treatments = [] } = useQuery<Treatment[]>({
    queryKey: ["treatments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("treatments").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: accommodations = [] } = useQuery<Accommodation[]>({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accommodations").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["prescriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("prescriptions").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  return {
    patients,
    doctors,
    nurses,
    chemists,
    rooms,
    bills,
    labReports,
    treatments,
    accommodations,
    prescriptions,
  };
};
