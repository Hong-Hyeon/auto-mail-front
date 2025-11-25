/**
 * Authentication service
 */

import apiClient from './api';
import type { UserLogin, UserCreate, TokenResponse, User, UserUpdate } from '../types/user';
import { storage } from '../utils/storage';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: UserLogin): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/users/login', credentials);
    const { access_token, user } = response.data;
    
    // Store token and user
    storage.setToken(access_token);
    storage.setUser(user);
    
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: UserCreate): Promise<User> => {
    const response = await apiClient.post<User>('/users/register', userData);
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  /**
   * Update current user
   */
  updateCurrentUser: async (userData: UserUpdate): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', userData);
    const updatedUser = response.data;
    storage.setUser(updatedUser);
    return updatedUser;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    storage.clear();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!storage.getToken();
  },

  /**
   * Get stored user
   */
  getStoredUser: (): User | null => {
    return storage.getUser();
  },
};

