const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Patients
  patients = {
    getAll: (params?: { status?: string; type?: string; doctorId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/patients${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/patients/${id}`),
    create: (data: any) => this.request('/patients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => this.request(`/patients/${id}`, { method: 'DELETE' }),
  };

  // Doctors
  doctors = {
    getAll: (params?: { specialty?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/doctors${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/doctors/${id}`),
    getPatients: (id: string) => this.request(`/doctors/${id}/patients`),
    create: (data: any) => this.request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // Nurses
  nurses = {
    getAll: () => this.request('/nurses'),
    getById: (id: string) => this.request(`/nurses/${id}`),
    getPatients: (id: string) => this.request(`/nurses/${id}/patients`),
    create: (data: any) => this.request('/nurses', { method: 'POST', body: JSON.stringify(data) }),
  };

  // Chemists
  chemists = {
    getAll: () => this.request('/chemists'),
    getById: (id: string) => this.request(`/chemists/${id}`),
    getPendingPrescriptions: (id: string) => this.request(`/chemists/${id}/prescriptions/pending`),
    dispensePrescription: (id: string) => this.request(`/chemists/prescriptions/${id}/dispense`, { method: 'PUT' }),
  };

  // Rooms
  rooms = {
    getAll: (params?: { status?: string; type?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/rooms${query ? `?${query}` : ''}`);
    },
    getAvailable: (params?: { type?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/rooms/available${query ? `?${query}` : ''}`);
    },
    getByNo: (roomNo: string) => this.request(`/rooms/${roomNo}`),
    create: (data: any) => this.request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (roomNo: string, data: any) => this.request(`/rooms/${roomNo}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // Bills
  bills = {
    getAll: (params?: { status?: string; patientId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/bills${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/bills/${id}`),
    create: (data: any) => this.request('/bills', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    addCharge: (id: string, data: any) => this.request(`/bills/${id}/charges`, { method: 'POST', body: JSON.stringify(data) }),
  };

  // Lab Reports
  labReports = {
    getAll: (params?: { status?: string; category?: string; patientId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/lab-reports${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/lab-reports/${id}`),
    getPending: () => this.request('/lab-reports/pending/all'),
    create: (data: any) => this.request('/lab-reports', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/lab-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    review: (id: string, data: any) => this.request(`/lab-reports/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // Treatments
  treatments = {
    getAll: (params?: { doctorId?: string; patientId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/treatments${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/treatments/${id}`),
    create: (data: any) => this.request('/treatments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/treatments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // Accommodations
  accommodations = {
    getAll: (params?: { status?: string; patientId?: string; roomNo?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/accommodations${query ? `?${query}` : ''}`);
    },
    getActive: () => this.request('/accommodations/active'),
    create: (data: any) => this.request('/accommodations', { method: 'POST', body: JSON.stringify(data) }),
    checkout: (id: string) => this.request(`/accommodations/${id}/checkout`, { method: 'PUT' }),
  };

  // Prescriptions
  prescriptions = {
    getAll: (params?: { status?: string; doctorId?: string; patientId?: string; shopId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/prescriptions${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request(`/prescriptions/${id}`),
    create: (data: any) => this.request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // Analytics
  analytics = {
    getOverview: () => this.request('/analytics/overview'),
    getRevenue: (params?: { startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/analytics/revenue${query ? `?${query}` : ''}`);
    },
    getPatientFlow: (params?: { days?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request(`/analytics/patient-flow${query ? `?${query}` : ''}`);
    },
    getDoctorPerformance: () => this.request('/analytics/doctors/performance'),
  };
}

export const api = new ApiClient(API_BASE_URL);





