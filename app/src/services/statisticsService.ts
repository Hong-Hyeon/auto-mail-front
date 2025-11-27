/**
 * Statistics service
 */

import apiClient from './api';
import type { EmailStatistics, CompanyStatistics, EmailStatisticsParams, CompanyStatisticsParams } from '../types/statistics';

export const statisticsService = {
  /**
   * Get email statistics
   */
  getEmailStatistics: async (params?: EmailStatisticsParams): Promise<EmailStatistics> => {
    const response = await apiClient.get<EmailStatistics>('/statistics/email', { params });
    return response.data;
  },

  /**
   * Get company statistics
   */
  getCompanyStatistics: async (params?: CompanyStatisticsParams): Promise<CompanyStatistics> => {
    const response = await apiClient.get<CompanyStatistics>('/statistics/companies', { params });
    return response.data;
  },
};

