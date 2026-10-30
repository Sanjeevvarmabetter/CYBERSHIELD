import axios from 'axios';
import { AuthResponse, AnalysisResult, IncidentReport, ThreatIndicator, SafetyGuide } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: { email: string; password: string; full_name: string; role?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const analysisService = {
  analyzeScamMessage: async (data: { text: string; channel?: string }): Promise<AnalysisResult> => {
    const res = await api.post<AnalysisResult>('/analysis/scam', data);
    return res.data;
  },
  analyzeUrl: async (data: { url: string }): Promise<AnalysisResult> => {
    const res = await api.post<AnalysisResult>('/analysis/phishing', data);
    return res.data;
  },
  analyzeFraudTransaction: async (data: any): Promise<AnalysisResult> => {
    const res = await api.post<AnalysisResult>('/analysis/fraud', data);
    return res.data;
  },
  analyzeAbuse: async (data: { text: string; context_type?: string }): Promise<AnalysisResult> => {
    const res = await api.post<AnalysisResult>('/analysis/abuse', data);
    return res.data;
  }
};

export const incidentService = {
  submitIncident: async (data: any): Promise<IncidentReport> => {
    const res = await api.post<IncidentReport>('/incidents', data);
    return res.data;
  },
  trackIncident: async (refCode: string): Promise<IncidentReport> => {
    const res = await api.get<IncidentReport>(`/incidents/track/${encodeURIComponent(refCode)}`);
    return res.data;
  },
  listIncidents: async (params?: any): Promise<IncidentReport[]> => {
    const res = await api.get<IncidentReport[]>('/incidents', { params });
    return res.data;
  },
  updateStatus: async (id: string, update: { status: string; priority?: string; analyst_note?: string }) => {
    const res = await api.patch(`/incidents/${id}/status`, update);
    return res.data;
  }
};

export const educationService = {
  getGuides: async (): Promise<{ status: string; guides: SafetyGuide[] }> => {
    const res = await api.get('/education/guides');
    return res.data;
  },
  getEmergencyResources: async () => {
    const res = await api.get('/education/emergency-resources');
    return res.data;
  }
};

export const intelligenceService = {
  getIndicators: async (params?: any): Promise<ThreatIndicator[]> => {
    const res = await api.get<ThreatIndicator[]>('/intelligence/indicators', { params });
    return res.data;
  },
  getGraphData: async () => {
    const res = await api.get('/graph/data');
    return res.data;
  },
  getDashboardMetrics: async () => {
    const res = await api.get('/dashboard/metrics');
    return res.data;
  }
};

export default api;
