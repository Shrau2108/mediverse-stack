export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  address: string | null;
  bmi: number | null;
  blood_group: string | null;
  disease: string | null;
  email: string | null;
  phone: string | null;
  weight: number | null;
  height: number | null;
  patient_type: string;
  status: string;
  doctor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  contact_no: string | null;
  date_of_joining: string;
  work_experience: number;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Nurse {
  id: string;
  name: string;
  specialty: string | null;
  work_experience: number;
  gender: string | null;
  age: number | null;
  dob: string | null;
  contact_no: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chemist {
  id: string;
  name: string;
  phone_no: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  room_no: string;
  room_type: string;
  status: string;
  floor: number | null;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  patient_id: string;
  patient_type: string;
  health_card: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  date: string;
  category: string;
  test_name: string;
  result: string | null;
  report_file: string | null;
  amount: number;
  status: string;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  doctor_id: string;
  patient_id: string;
  diagnosis: string | null;
  prescription_notes: string | null;
  treatment_date: string;
  discharge_date: string | null;
  status: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  patient_id: string;
  room_no: string;
  check_in_date: string;
  check_out_date: string | null;
  daily_rate: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  doctor_id: string;
  patient_id: string;
  chemist_id: string | null;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  status: string;
  dispensed_date: string | null;
  created_at: string;
  updated_at: string;
}
