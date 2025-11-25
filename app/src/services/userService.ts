/**
 * User management service
 */

import apiClient from './api';
import type { User, UserCreate, UserUpdate } from '../types/user';

export interface UserListParams {
  skip?: number;
  limit?: number;
  is_active?: boolean;
}

export const userService = {
  /**
   * Get list of users (admin only)
   */
  getUsers: async (params?: UserListParams): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await apiClient.post<User>('/users/register', userData);
    return response.data;
  },

  /**
   * Update user (admin only)
   */
  updateUser: async (userId: string, userData: UserUpdate): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
};

