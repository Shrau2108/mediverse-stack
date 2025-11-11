export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          daily_rate: number
          id: string
          patient_id: string
          room_no: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          daily_rate: number
          id?: string
          patient_id: string
          room_no: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          daily_rate?: number
          id?: string
          patient_id?: string
          room_no?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_room_no_fkey"
            columns: ["room_no"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["room_no"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          created_at: string | null
          health_card: string | null
          id: string
          patient_id: string
          patient_type: string
          payment_date: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          health_card?: string | null
          id?: string
          patient_id: string
          patient_type: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          health_card?: string | null
          id?: string
          patient_id?: string
          patient_type?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chemists: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_no: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone_no?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone_no?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          contact_no: string | null
          created_at: string | null
          date_of_joining: string | null
          degree: string
          email: string | null
          id: string
          name: string
          specialty: string
          updated_at: string | null
          work_experience: number | null
        }
        Insert: {
          contact_no?: string | null
          created_at?: string | null
          date_of_joining?: string | null
          degree: string
          email?: string | null
          id?: string
          name: string
          specialty: string
          updated_at?: string | null
          work_experience?: number | null
        }
        Update: {
          contact_no?: string | null
          created_at?: string | null
          date_of_joining?: string | null
          degree?: string
          email?: string | null
          id?: string
          name?: string
          specialty?: string
          updated_at?: string | null
          work_experience?: number | null
        }
        Relationships: []
      }
      lab_reports: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string | null
          doctor_notes: string | null
          id: string
          patient_id: string
          report_file: string | null
          result: string | null
          status: string | null
          test_name: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string | null
          doctor_notes?: string | null
          id?: string
          patient_id: string
          report_file?: string | null
          result?: string | null
          status?: string | null
          test_name: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string | null
          doctor_notes?: string | null
          id?: string
          patient_id?: string
          report_file?: string | null
          result?: string | null
          status?: string | null
          test_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      nurses: {
        Row: {
          age: number | null
          contact_no: string | null
          created_at: string | null
          dob: string | null
          email: string | null
          gender: string | null
          id: string
          name: string
          specialty: string | null
          updated_at: string | null
          work_experience: number | null
        }
        Insert: {
          age?: number | null
          contact_no?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name: string
          specialty?: string | null
          updated_at?: string | null
          work_experience?: number | null
        }
        Update: {
          age?: number | null
          contact_no?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          specialty?: string | null
          updated_at?: string | null
          work_experience?: number | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          blood_group: string | null
          bmi: number | null
          created_at: string | null
          disease: string | null
          dob: string
          doctor_id: string | null
          email: string | null
          gender: string
          height: number | null
          id: string
          name: string
          patient_type: string
          phone: string | null
          status: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          bmi?: number | null
          created_at?: string | null
          disease?: string | null
          dob: string
          doctor_id?: string | null
          email?: string | null
          gender: string
          height?: number | null
          id?: string
          name: string
          patient_type: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          bmi?: number | null
          created_at?: string | null
          disease?: string | null
          dob?: string
          doctor_id?: string | null
          email?: string | null
          gender?: string
          height?: number | null
          id?: string
          name?: string
          patient_type?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patients_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          chemist_id: string | null
          created_at: string | null
          dispensed_date: string | null
          doctor_id: string
          dosage: string
          duration: string
          frequency: string
          id: string
          medicine_name: string
          patient_id: string
          quantity: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          chemist_id?: string | null
          created_at?: string | null
          dispensed_date?: string | null
          doctor_id: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          medicine_name: string
          patient_id: string
          quantity: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          chemist_id?: string | null
          created_at?: string | null
          dispensed_date?: string | null
          doctor_id?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          medicine_name?: string
          patient_id?: string
          quantity?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_chemist_id_fkey"
            columns: ["chemist_id"]
            isOneToOne: false
            referencedRelation: "chemists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          floor: number | null
          room_no: string
          room_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          floor?: number | null
          room_no: string
          room_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          floor?: number | null
          room_no?: string
          room_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      treatments: {
        Row: {
          created_at: string | null
          diagnosis: string | null
          discharge_date: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          patient_id: string
          prescription_notes: string | null
          status: string | null
          treatment_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diagnosis?: string | null
          discharge_date?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          patient_id: string
          prescription_notes?: string | null
          status?: string | null
          treatment_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diagnosis?: string | null
          discharge_date?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          patient_id?: string
          prescription_notes?: string | null
          status?: string | null
          treatment_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "chemist"
        | "attendant"
        | "lab_technician"
        | "patient"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "chemist",
        "attendant",
        "lab_technician",
        "patient",
      ],
    },
  },
} as const
