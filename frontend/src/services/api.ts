import axios, { AxiosError } from 'axios';
import {
  User, StudentProfile, Assessment, Prediction, Recommendation,
  StudentDashboardSummary, AdminStats, StudentListItem, StudentDetail,
  AssessmentWithResult
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placepilot_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('placepilot_token');
      localStorage.removeItem('placepilot_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/api/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'faculty';
    reg_number?: string;
    department?: string;
  }) => {
    const res = await api.post<User>('/api/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/api/auth/me');
    return res.data;
  },
  updateMe: async (data: { full_name?: string; reg_number?: string; department?: string }) => {
    const res = await api.put<User>('/api/auth/me', data);
    return res.data;
  },
};

export const studentsAPI = {
  getProfile: async () => {
    const res = await api.get<StudentProfile>('/api/students/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<StudentProfile>) => {
    const res = await api.put<StudentProfile>('/api/students/profile', data);
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get<StudentDashboardSummary>('/api/students/dashboard');
    return res.data;
  },
};

export const assessmentsAPI = {
  submitAssessment: async (data: {
    cgpa: number;
    aptitude_score: number;
    technical_score: number;
    communication_score: number;
    coding_score: number;
    projects_count: number;
    internships_count: number;
    certifications_count: number;
    backlogs_count: number;
    resume_readiness: number;
    interview_prep_level: string;
  }) => {
    const res = await api.post<AssessmentWithResult>('/api/assessments', data);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get<Assessment[]>('/api/assessments');
    return res.data;
  },
  getDetail: async (id: number) => {
    const res = await api.get<Assessment>(`/api/assessments/${id}`);
    return res.data;
  },
};

export const predictionsAPI = {
  getLatest: async () => {
    const res = await api.get<Prediction>('/api/predictions/latest');
    return res.data;
  },
  getModelInfo: async () => {
    const res = await api.get<any>('/api/predictions/model-info');
    return res.data;
  },
};

export const recommendationsAPI = {
  getAll: async () => {
    const res = await api.get<Recommendation[]>('/api/recommendations');
    return res.data;
  },
  toggle: async (id: number) => {
    const res = await api.patch<Recommendation>(`/api/recommendations/${id}/toggle`);
    return res.data;
  },
};

export const adminAPI = {
  getStats: async () => {
    const res = await api.get<AdminStats>('/api/admin/stats');
    return res.data;
  },
  getStudents: async (params?: {
    query?: string;
    department?: string;
    readiness_category?: string;
    skip?: number;
    limit?: number;
  }) => {
    const res = await api.get<StudentListItem[]>('/api/admin/students', { params });
    return res.data;
  },
  getStudentDetail: async (id: number) => {
    const res = await api.get<StudentDetail>(`/api/admin/students/${id}`);
    return res.data;
  },
  exportCSVUrl: () => `${API_BASE_URL}/api/admin/export-csv`,
  downloadCSV: async () => {
    const res = await api.get('/api/admin/export-csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `placepilot_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
