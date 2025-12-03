/**
 * User-related TypeScript types
 */

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name?: string | null;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string | null;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

