export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = (import.meta.env as any)?.VITE_API_BASE_URL || 'http://localhost:8000/api';

class HttpClient {
  private getAccessToken(): string | null {
    return localStorage.getItem('cyberguard_token');
  }

  private handle401() {
    localStorage.removeItem('cyberguard_token');
    localStorage.removeItem('cyberguard_auth');
    if (window.location.pathname !== '/') sessionStorage.setItem('redirect_after_login', window.location.pathname);
    window.location.href = '/';
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) headers.set('Authorization', `Bearer ${token}`);

    const config: RequestInit = { ...options, headers };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      this.handle401();
      throw new ApiError('Unauthorized', 401, null);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(errorData?.message || `HTTP ${response.status}`, response.status, errorData);
    }

    if (response.status === 204) return null as unknown as T;
    return await response.json();
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  post<T>(endpoint: string, body?: any, options?: RequestInit) { return this.request<T>(endpoint, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }); }
  put<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const httpClient = new HttpClient();
