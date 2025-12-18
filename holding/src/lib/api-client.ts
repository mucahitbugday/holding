// API URL'ini dinamik olarak belirle
function getApiUrl(): string {
  // Client-side'da window.location.origin kullan
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Server-side'da environment variable veya fallback kullan
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://holding.ogrencim.info/';
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Validation hatalarını da içeren detaylı hata mesajı
      const errorMessage = data.error || 'Bir hata oluştu';
      const error = new Error(errorMessage);
      // Validation hatalarını error objesine ekle
      if (data.validationErrors) {
        (error as any).validationErrors = data.validationErrors;
      }
      throw error;
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  }

  // Menu
  async getMenus(type?: string) {
    const query = type ? `?type=${type}` : '';
    return this.request(`/menu${query}`);
  }

  async getMenu(id: string) {
    return this.request(`/menu/${id}`);
  }

  async createMenu(data: any) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenu(id: string, data: any) {
    return this.request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenu(id: string) {
    return this.request(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Content
  async getContents(type?: string, slug?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (slug) params.append('slug', slug);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/content${query}`);
  }

  async getContent(id: string) {
    return this.request(`/content/${id}`);
  }

  async createContent(data: any) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContent(id: string, data: any) {
    return this.request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContent(id: string) {
    return this.request(`/content/${id}`, {
      method: 'DELETE',
    });
  }

  // HomePage Settings
  async getHomePageSettings() {
    return this.request('/homepage');
  }

  async updateHomePageSettings(data: any) {
    return this.request('/homepage', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Media
  async getMedia(type?: 'image' | 'pdf') {
    const query = type ? `?type=${type}` : '';
    return this.request(`/media${query}`);
  }

  async uploadMedia(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/api/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Bir hata oluştu');
    }

    return data;
  }

  async deleteMedia(id: string) {
    return this.request(`/media/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/users${query}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(data: { email: string; password: string; name: string; role?: 'admin' | 'user'; isActive?: boolean }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: { email?: string; password?: string; name?: string; role?: 'admin' | 'user'; isActive?: boolean }) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
