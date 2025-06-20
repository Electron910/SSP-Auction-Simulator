import axios, { AxiosInstance } from 'axios';
import { 
  AdRequest, 
  AuctionResult, 
  AdRequestRecord, 
  DSP, 
  Analytics, 
  TargetingRules 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// For WebSocket in useWebSocket.ts
// const wsUrl = import.meta.env.VITE_WS_URL || 
//   (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + 
//   '//' + window.location.host + '/ws';
  
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateDSPData {
  name: string;
  targetingRules: TargetingRules;
  baseBid: number;
  creativeUrl: string;
}

export const apiService = {
  // Ad Request
  createAdRequest: (data: AdRequest) => 
    api.post<AuctionResult>('/ad-request', data),
  
  // Admin endpoints
  getAdRequests: () => 
    api.get<AdRequestRecord[]>('/admin/ad-requests'),
  
  getDSPs: () => 
    api.get<DSP[]>('/admin/dsps'),
  
  getAnalytics: () => 
    api.get<Analytics>('/admin/analytics'),
  
  // DSP Management
  createDSP: (data: CreateDSPData) => 
    api.post<{ id: number; message: string }>('/admin/dsps', data),
  
  updateDSP: (id: number, data: CreateDSPData) => 
    api.put<{ message: string }>(`/admin/dsps/${id}`, data),
};

export default apiService;