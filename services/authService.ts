import { httpClient } from './httpClient';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: { id: string; email: string; username: string };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await httpClient.post('/auth/login', credentials) as any;
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response as LoginResponse;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await httpClient.post('/auth/register', data) as any;
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response as LoginResponse;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    const response = await httpClient.post('/auth/refresh', { refreshToken }) as any;
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response.token;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getUser(): { id: string; email: string; username: string } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.user;
    } catch {
      return null;
    }
  },
};

export default authService;
