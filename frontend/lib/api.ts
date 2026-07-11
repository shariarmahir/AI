import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Extract meaningful message from FastAPI error responses
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ detail?: string | { msg: string }[] }>) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') {
      // Strip "Error code: 400 - {...}" wrapper if it contains a nested message
      const match = detail.match(/'message':\s*'([^']+)'/);
      err.message = match ? match[1] : detail;
    } else if (Array.isArray(detail) && detail[0]?.msg) {
      err.message = detail[0].msg;
    }
    return Promise.reject(err);
  }
);

// ── Types ────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  confidence: number | 'high' | 'medium' | 'low';
  sources?: { disease_id?: string; disease_name?: string; similarity?: number; type?: string }[];
  flagged_emergency: boolean;
  emergency?: boolean;
  disclaimer: string;
}

export interface TriageRequest {
  symptoms: string;
  age?: number;
  gender?: 'female' | 'male' | 'other';
  lat?: number;
  lng?: number;
  language?: 'en' | 'bn' | 'auto';
}

export interface Hospital {
  name: string;
  address: string;
  rating: number | null;
  total_ratings: number;
  open_now: boolean | null;
  location: { lat: number; lng: number };
  place_id: string;
  maps_url: string;
  /** Straight-line distance the backend computed against the coords it searched. */
  distance_meters?: number | null;
  /** 'local' when served from the curated dataset because Google Places was unavailable. */
  source?: 'google' | 'local';
  /** Local dataset only — Google Places does not return these. */
  phone?: string | null;
  emergency_24_7?: boolean | null;
  has_ambulance?: boolean | null;
  specialties?: string[];
}

export interface TriageResponse {
  specialty: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  summary: string;
  possible_conditions: string[];
  risk_factors: string[];
  red_flags: string[];
  self_care: string[];
  questions_for_doctor: string[];
  hospitals: Hospital[];
  confidence: 'high' | 'medium' | 'low';
  disclaimer: string;
  matched_diseases?: { name_en: string; name_bn: string; category: string }[];
}

export interface ImageAnalysisResponse {
  analysis: string;
  detected_type: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  suggested_specialty: string;
  confidence: 'high' | 'medium' | 'low';
  disclaimer: string;
}

// ── API calls ────────────────────────────────────────────────────
export async function chat(message: string, history: ChatMessage[] = []) {
  const { data } = await api.post<ChatResponse>('/api/chat', { message, history });
  return data;
}

export async function triage(req: TriageRequest) {
  const { data } = await api.post<TriageResponse>('/api/triage', req);
  return data;
}

export async function analyzeImage(file: File, imageType = 'auto', context = '') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('image_type', imageType);
  formData.append('context', context);
  const { data } = await api.post<ImageAnalysisResponse>('/api/image/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function findHospitals(lat: number, lng: number, specialty = 'hospital', radius = 8000) {
  const { data } = await api.post<{ hospitals: Hospital[] }>('/api/hospitals/search', {
    lat, lng, specialty, radius_meters: radius,
  });
  return data.hospitals;
}

export async function listDiseases(params: { category?: string; specialty?: string; search?: string } = {}) {
  const { data } = await api.get('/api/diseases', { params });
  return data;
}
