/**
 * Email History service
 */

import apiClient from './api';
import type { EmailHistory, EmailHistoryListResponse, EmailHistoryListParams } from '../types/emailHistory';

export const emailHistoryService = {
  /**
   * Get list of email history
   */
  getEmailHistory: async (params?: EmailHistoryListParams): Promise<EmailHistoryListResponse> => {
    const response = await apiClient.get<EmailHistoryListResponse>('/email-history', { params });
    return response.data;
  },

  /**
   * Get email history by ID
   */
  getEmailHistoryById: async (historyId: string): Promise<EmailHistory> => {
    const response = await apiClient.get<EmailHistory>(`/email-history/${historyId}`);
    return response.data;
  },

  /**
   * Get email history by company ID
   */
  getEmailHistoryByCompany: async (
    companyId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<EmailHistoryListResponse> => {
    const response = await apiClient.get<EmailHistoryListResponse>(
      `/email-history/company/${companyId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get email history by user ID
   */
  getEmailHistoryByUser: async (
    userId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<EmailHistoryListResponse> => {
    const response = await apiClient.get<EmailHistoryListResponse>(
      `/email-history/user/${userId}`,
      { params }
    );
    return response.data;
  },
};

