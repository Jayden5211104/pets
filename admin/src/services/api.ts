/**
 * Admin API 客户端
 * 调用 /api/admin/* (Vercel Serverless Function)
 */
import type { Pet, AdoptionApplication, DashboardStats, PetFormData } from '../types';

const BASE = '/api/admin';

function getToken(): string {
  return localStorage.getItem('admin_token') || '';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; count?: number; error?: string; page?: number; limit?: number }> {
  const token = getToken();
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers as Record<string, string>,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error || '请求失败' };
  return { success: true, ...data };
}

export const adminApi = {
  // 登录
  async login(password: string): Promise<boolean> {
    const res = await request<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (res.success && res.data?.token) {
      localStorage.setItem('admin_token', res.data.token);
      return true;
    }
    return false;
  },

  isLoggedIn(): boolean {
    return !!getToken();
  },

  logout() {
    localStorage.removeItem('admin_token');
  },

  // 仪表盘
  getDashboard(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    return request<DashboardStats>('/dashboard');
  },

  // 宠物
  getPets(params?: { search?: string; category?: string; isOnline?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.isOnline) q.set('isOnline', params.isOnline);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return request<Pet[]>(`/pets${qs ? '?' + qs : ''}`);
  },

  createPet(data: PetFormData & { imageBase64?: string; shelterId?: string }): Promise<{ success: boolean; data?: Pet; error?: string }> {
    return request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePet(id: string, data: Partial<PetFormData> & { imageBase64?: string }): Promise<{ success: boolean; data?: Pet; error?: string }> {
    return request<Pet>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePet(id: string): Promise<{ success: boolean; error?: string }> {
    return request(`/pets/${id}`, { method: 'DELETE' });
  },

  // 领养申请
  getApplications(params?: { status?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return request<AdoptionApplication[]>(`/applications${qs ? '?' + qs : ''}`);
  },

  approveApplication(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
    return request(`/applications/${id}/approve`, { method: 'PUT' });
  },

  rejectApplication(id: string, reason?: string): Promise<{ success: boolean; error?: string; message?: string }> {
    return request(`/applications/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },
};
