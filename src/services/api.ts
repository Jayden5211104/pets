/**
 * 爱宠宜家 API 服务层
 * 连接前端与后端 Express API，后端使用 Supabase 数据库
 *
 * 所有API调用返回统一的响应格式:
 * { success: boolean, data?: T, count?: number, message?: string, error?: string }
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// 通用请求工具
// ============================================
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; count?: number; message?: string; error?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, result.error || result.message);
      return { success: false, error: result.error || '请求失败' };
    }

    return result;
  } catch (err) {
    console.error(`Network Error [${endpoint}]:`, err);
    return { success: false, error: '网络连接失败，请检查后端服务是否启动' };
  }
}

// ============================================
// 类型定义（与后端数据库对应）
// ============================================
import type { Pet, User, AdoptionApplication, Message, Shelter } from '../types';

// ============================================
// 宠物 API
// ============================================
export const petApi = {
  /** 获取所有宠物（支持筛选） */
  async getAll(filters?: {
    category?: string;
    size?: string;
    location?: string;
    search?: string;
  }): Promise<Pet[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.size) params.set('size', filters.size);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString();
    const res = await request<Pet[]>(`/pets${query ? `?${query}` : ''}`);
    return res.success && res.data ? res.data : [];
  },

  /** 获取单个宠物详情 */
  async getById(id: string): Promise<Pet | null> {
    const res = await request<Pet>(`/pets/${id}`);
    return res.success && res.data ? res.data : null;
  },
};

// ============================================
// 用户 API
// ============================================
export const userApi = {
  /** 用户登录/注册 */
  async login(email: string, name?: string, phone?: string): Promise<User | null> {
    const res = await request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, name, phone }),
    });
    return res.success && res.data ? res.data : null;
  },

  /** 获取用户信息 */
  async getById(id: string): Promise<User | null> {
    const res = await request<User>(`/users/${id}`);
    return res.success && res.data ? res.data : null;
  },

  /** 更新用户信息 */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const res = await request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return res.success && res.data ? res.data : null;
  },

  /** 切换收藏 */
  async toggleFavorite(userId: string, petId: string): Promise<string[]> {
    const res = await request<{ favorites: string[] }>(`/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ petId }),
    });
    return res.success && res.data ? res.data.favorites : [];
  },

  /** 获取收藏列表 */
  async getFavorites(userId: string): Promise<Pet[]> {
    const res = await request<Pet[]>(`/users/${userId}/favorites`);
    return res.success && res.data ? res.data : [];
  },
};

// ============================================
// 领养申请 API
// ============================================
export const applicationApi = {
  /** 获取所有申请 */
  async getAll(filters?: { status?: string; email?: string }): Promise<AdoptionApplication[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.email) params.set('email', filters.email);

    const query = params.toString();
    const res = await request<AdoptionApplication[]>(`/applications${query ? `?${query}` : ''}`);
    return res.success && res.data ? res.data : [];
  },

  /** 创建领养申请 */
  async create(application: Omit<AdoptionApplication, 'id' | 'status' | 'date'>): Promise<AdoptionApplication | null> {
    const res = await request<AdoptionApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
    return res.success && res.data ? res.data : null;
  },

  /** 更新申请状态 */
  async updateStatus(id: string, status: string): Promise<AdoptionApplication | null> {
    const res = await request<AdoptionApplication>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.success && res.data ? res.data : null;
  },
};

// ============================================
// 消息 API
// ============================================
export const messageApi = {
  /** 获取消息列表 */
  async getAll(unreadOnly?: boolean): Promise<Message[]> {
    const query = unreadOnly ? '?unread=true' : '';
    const res = await request<Message[]>(`/messages${query}`);
    return res.success && res.data ? res.data : [];
  },

  /** 发送消息 */
  async send(message: {
    senderName: string;
    senderAvatar: string;
    messageText: string;
    isShelter?: boolean;
  }): Promise<Message | null> {
    const res = await request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
    return res.success && res.data ? res.data : null;
  },

  /** 标记消息为已读 */
  async markAsRead(id: string): Promise<boolean> {
    const res = await request(`/messages/${id}/read`, { method: 'PATCH' });
    return res.success;
  },
};

// ============================================
// 救助站 API
// ============================================
export const shelterApi = {
  /** 获取所有救助站 */
  async getAll(): Promise<Shelter[]> {
    const res = await request<Shelter[]>('/shelters');
    return res.success && res.data ? res.data : [];
  },

  /** 获取单个救助站 */
  async getById(id: string): Promise<Shelter | null> {
    const res = await request<Shelter>(`/shelters/${id}`);
    return res.success && res.data ? res.data : null;
  },
};

// ============================================
// 健康检查
// ============================================
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    const data = await res.json();
    return !!data.message;
  } catch {
    return false;
  }
}
