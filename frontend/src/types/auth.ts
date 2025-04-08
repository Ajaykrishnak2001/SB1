export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'expert';
  expertName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}