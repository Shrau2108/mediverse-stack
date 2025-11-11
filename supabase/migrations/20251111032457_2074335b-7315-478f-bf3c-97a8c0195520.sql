-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL,
  address TEXT,
  bmi DECIMAL(5,2),
  blood_group TEXT,
  disease TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  patient_type TEXT NOT NULL CHECK (patient_type IN ('In-Patient', 'Out-Patient')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged', 'Emergency', 'Critical')),
  doctor_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  degree TEXT NOT NULL,
  specialty TEXT NOT NULL,
  contact_no TEXT,
  date_of_joining TIMESTAMPTZ DEFAULT now(),
  work_experience INT DEFAULT 0,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Nurses table
CREATE TABLE IF NOT EXISTS public.nurses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  work_experience INT DEFAULT 0,
  gender TEXT,
  age INT,
  dob DATE,
  contact_no TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

-- Chemists table
CREATE TABLE IF NOT EXISTS public.chemists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_no TEXT,
  email TEXT UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chemists ENABLE ROW LEVEL SECURITY;

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  room_no TEXT PRIMARY KEY,
  room_type TEXT NOT NULL CHECK (room_type IN ('Normal', 'Emergency', 'Critical', 'ICU', 'General')),
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
  floor INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  patient_type TEXT NOT NULL,
  health_card TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Partial')),
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Online', 'Insurance')),
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Lab Reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  category TEXT NOT NULL,
  test_name TEXT NOT NULL,
  result TEXT,
  report_file TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  doctor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT,
  prescription_notes TEXT,
  treatment_date TIMESTAMPTZ DEFAULT now(),
  discharge_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Discharged')),
  follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Accommodations table
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  room_no TEXT REFERENCES public.rooms(room_no) ON DELETE RESTRICT NOT NULL,
  check_in_date TIMESTAMPTZ DEFAULT now(),
  check_out_date TIMESTAMPTZ,
  daily_rate DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Checked Out')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  chemist_id UUID REFERENCES public.chemists(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  quantity INT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispensed', 'Completed')),
  dispensed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Add foreign key for doctor in patients (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_patients_doctor'
  ) THEN
    ALTER TABLE public.patients ADD CONSTRAINT fk_patients_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS Policies (Public access for now, will be secured with authentication later)
DROP POLICY IF EXISTS "Allow public read access" ON public.patients;
CREATE POLICY "Allow public read access" ON public.patients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.patients;
CREATE POLICY "Allow public insert" ON public.patients FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.patients;
CREATE POLICY "Allow public update" ON public.patients FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.patients;
CREATE POLICY "Allow public delete" ON public.patients FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.doctors;
CREATE POLICY "Allow public read access" ON public.doctors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.doctors;
CREATE POLICY "Allow public insert" ON public.doctors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.doctors;
CREATE POLICY "Allow public update" ON public.doctors FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.doctors;
CREATE POLICY "Allow public delete" ON public.doctors FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.nurses;
CREATE POLICY "Allow public read access" ON public.nurses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.nurses;
CREATE POLICY "Allow public insert" ON public.nurses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.nurses;
CREATE POLICY "Allow public update" ON public.nurses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.nurses;
CREATE POLICY "Allow public delete" ON public.nurses FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.chemists;
CREATE POLICY "Allow public read access" ON public.chemists FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.chemists;
CREATE POLICY "Allow public insert" ON public.chemists FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.chemists;
CREATE POLICY "Allow public update" ON public.chemists FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.chemists;
CREATE POLICY "Allow public delete" ON public.chemists FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.rooms;
CREATE POLICY "Allow public read access" ON public.rooms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.rooms;
CREATE POLICY "Allow public insert" ON public.rooms FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.rooms;
CREATE POLICY "Allow public update" ON public.rooms FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.rooms;
CREATE POLICY "Allow public delete" ON public.rooms FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.bills;
CREATE POLICY "Allow public read access" ON public.bills FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.bills;
CREATE POLICY "Allow public insert" ON public.bills FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.bills;
CREATE POLICY "Allow public update" ON public.bills FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.bills;
CREATE POLICY "Allow public delete" ON public.bills FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.lab_reports;
CREATE POLICY "Allow public read access" ON public.lab_reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.lab_reports;
CREATE POLICY "Allow public insert" ON public.lab_reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.lab_reports;
CREATE POLICY "Allow public update" ON public.lab_reports FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.lab_reports;
CREATE POLICY "Allow public delete" ON public.lab_reports FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.treatments;
CREATE POLICY "Allow public read access" ON public.treatments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.treatments;
CREATE POLICY "Allow public insert" ON public.treatments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.treatments;
CREATE POLICY "Allow public update" ON public.treatments FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.treatments;
CREATE POLICY "Allow public delete" ON public.treatments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.accommodations;
CREATE POLICY "Allow public read access" ON public.accommodations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.accommodations;
CREATE POLICY "Allow public insert" ON public.accommodations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.accommodations;
CREATE POLICY "Allow public update" ON public.accommodations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.accommodations;
CREATE POLICY "Allow public delete" ON public.accommodations FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.prescriptions;
CREATE POLICY "Allow public read access" ON public.prescriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.prescriptions;
CREATE POLICY "Allow public insert" ON public.prescriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update" ON public.prescriptions;
CREATE POLICY "Allow public update" ON public.prescriptions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete" ON public.prescriptions;
CREATE POLICY "Allow public delete" ON public.prescriptions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.user_roles;
CREATE POLICY "Allow public read access" ON public.user_roles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON public.user_roles;
CREATE POLICY "Allow public insert" ON public.user_roles FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_nurses_updated_at ON public.nurses;
CREATE TRIGGER update_nurses_updated_at BEFORE UPDATE ON public.nurses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_chemists_updated_at ON public.chemists;
CREATE TRIGGER update_chemists_updated_at BEFORE UPDATE ON public.chemists FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_lab_reports_updated_at ON public.lab_reports;
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON public.lab_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_accommodations_updated_at ON public.accommodations;
CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();