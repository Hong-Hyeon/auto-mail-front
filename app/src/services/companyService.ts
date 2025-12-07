/**
 * Company management service
 */

import apiClient from './api';
import type { Company, CompanyCreate, CompanyUpdate, CompanyListResponse, CompanyUploadResponse, CompanyExistsResponse, IndustryListResponse, RegionListResponse, IndustryFullListResponse, RegionFullListResponse } from '../types/company';

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
   * Download Excel template for company upload (authenticated users)
   */
  downloadUploadTemplate: async (): Promise<void> => {
    const response = await apiClient.get('/companies/upload-template', {
      responseType: 'blob',
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'company_upload_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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

  /**
   * Get list of industries (used by companies)
   */
  getIndustries: async (isActive: boolean = true): Promise<string[]> => {
    const response = await apiClient.get<IndustryListResponse>('/companies/industries', {
      params: { is_active: isActive },
    });
    return response.data.industries;
  },

  /**
   * Get list of regions (used by companies)
   */
  getRegions: async (isActive: boolean = true): Promise<string[]> => {
    const response = await apiClient.get<RegionListResponse>('/companies/regions', {
      params: { is_active: isActive },
    });
    return response.data.regions;
  },

  /**
   * Get list of all industries with ID and name (for forms)
   */
  getIndustriesFull: async (isActive: boolean = true): Promise<IndustryFullListResponse> => {
    const response = await apiClient.get<IndustryFullListResponse>('/companies/industries-full', {
      params: { is_active: isActive },
    });
    return response.data;
  },

  /**
   * Get list of all regions with ID and name (for forms)
   */
  getRegionsFull: async (isActive: boolean = true): Promise<RegionFullListResponse> => {
    const response = await apiClient.get<RegionFullListResponse>('/companies/regions-full', {
      params: { is_active: isActive },
    });
    return response.data;
  },
};

