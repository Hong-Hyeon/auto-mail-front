/**
 * Crawler service
 */

import apiClient from './api';
import type {
  CategoryStructure,
  CompanyListResponse,
  CrawlStatus,
  CrawlJob,
  CrawlJobStatus,
  CrawlResultFile,
} from '../types/crawler';

export interface GetCompaniesParams {
  category_url: string;
  max_companies?: number;
  extract_details?: boolean;
}

export interface CrawlAllCompaniesParams {
  max_companies_per_category?: number;
  extract_details?: boolean;
  category_level?: number;
  max_categories?: number;
}

export interface ListJobsParams {
  status_filter?: 'pending' | 'running' | 'completed' | 'failed';
  limit?: number;
}

export const crawlerService = {
  /**
   * Get crawler health status
   */
  getHealth: async (): Promise<CrawlStatus> => {
    const response = await apiClient.get<CrawlStatus>('/crawler/health');
    return response.data;
  },

  /**
   * Get category structure
   */
  getCategories: async (): Promise<CategoryStructure> => {
    const response = await apiClient.get<CategoryStructure>('/crawler/categories');
    return response.data;
  },

  /**
   * Get categories (simple format)
   */
  getCategoriesSimple: async (): Promise<{ total: number; categories: Array<{ name: string; url: string; level: number; count?: number }> }> => {
    const response = await apiClient.get('/crawler/categories/simple');
    return response.data;
  },

  /**
   * Get companies from a specific category
   */
  getCompanies: async (params: GetCompaniesParams): Promise<CompanyListResponse> => {
    const response = await apiClient.get<CompanyListResponse>('/crawler/companies', {
      params: {
        category_url: params.category_url,
        max_companies: params.max_companies || 50,
        extract_details: params.extract_details !== false,
      },
    });
    return response.data;
  },

  /**
   * Start crawling all categories (background job)
   */
  crawlAllCompanies: async (params: CrawlAllCompaniesParams): Promise<CrawlJob> => {
    const response = await apiClient.post<CrawlJob>('/crawler/companies/all', null, {
      params: {
        max_companies_per_category: params.max_companies_per_category || 0,
        extract_details: params.extract_details !== false,
        category_level: params.category_level || 3,
        max_categories: params.max_categories || 0,
      },
    });
    return response.data;
  },

  /**
   * Get crawl job status
   */
  getJobStatus: async (jobId: string): Promise<CrawlJobStatus> => {
    const response = await apiClient.get<CrawlJobStatus>(`/crawler/jobs/${jobId}`);
    return response.data;
  },

  /**
   * List crawl jobs
   */
  listJobs: async (params?: ListJobsParams): Promise<CrawlJobStatus[]> => {
    const response = await apiClient.get<CrawlJobStatus[]>('/crawler/jobs', {
      params: {
        status_filter: params?.status_filter,
        limit: params?.limit || 20,
      },
    });
    return response.data;
  },

  /**
   * Delete crawl job
   */
  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/crawler/jobs/${jobId}`);
  },

  /**
   * List result files
   */
  listResultFiles: async (): Promise<CrawlResultFile[]> => {
    const response = await apiClient.get<CrawlResultFile[]>('/crawler/results/files');
    return response.data;
  },

  /**
   * Download result file
   */
  downloadResultFile: async (filename: string): Promise<Blob> => {
    const response = await apiClient.get(`/crawler/results/files/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

