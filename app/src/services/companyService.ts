/**
 * Company management service
 */

import apiClient from './api';
import type { Company, CompanyCreate, CompanyUpdate, CompanyListResponse, CompanyUploadResponse, CompanyExistsResponse } from '../types/company';

export interface CompanyListParams {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}

export const companyService = {
  /**
   * Get list of companies (admin only)
   */
  getCompanies: async (params?: CompanyListParams): Promise<CompanyListResponse> => {
    const response = await apiClient.get<CompanyListResponse>('/companies', { params });
    return response.data;
  },

  /**
   * Get company by ID (admin only)
   */
  getCompanyById: async (companyId: string): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${companyId}`);
    return response.data;
  },

  /**
   * Create new company (admin only)
   */
  createCompany: async (companyData: CompanyCreate): Promise<Company> => {
    const response = await apiClient.post<Company>('/companies', companyData);
    return response.data;
  },

  /**
   * Update company (admin only)
   */
  updateCompany: async (companyId: string, companyData: CompanyUpdate): Promise<Company> => {
    const response = await apiClient.put<Company>(`/companies/${companyId}`, companyData);
    return response.data;
  },

  /**
   * Delete company (admin only)
   */
  deleteCompany: async (companyId: string): Promise<void> => {
    await apiClient.delete(`/companies/${companyId}`);
  },

  /**
   * Upload companies from Excel file (admin only)
   */
  uploadCompanies: async (file: File): Promise<CompanyUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<CompanyUploadResponse>(
      '/companies/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Check if company exists by name
   */
  checkCompanyExists: async (companyName: string): Promise<CompanyExistsResponse> => {
    // URL encode company name to handle special characters
    const encodedName = encodeURIComponent(companyName);
    const response = await apiClient.get<CompanyExistsResponse>(`/companies/check/${encodedName}`);
    return response.data;
  },
};

