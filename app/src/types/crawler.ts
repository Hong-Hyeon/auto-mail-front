/**
 * Crawler-related TypeScript types
 */

export interface Category {
  name: string;
  url: string;
  level: number;
  parent?: string;
  count?: number;
}

export interface CategoryStructure {
  total: number;
  by_level: {
    [key: string]: Category[];
  };
  categories: Category[];
}

export interface CrawledCompany {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  detail_url?: string;
  category_url?: string;
}

export interface CompanyListResponse {
  total: number;
  companies: CrawledCompany[];
}

export interface CrawlStatus {
  status: 'success' | 'error';
  message: string;
  data?: {
    base_url?: string;
  };
}

export interface CrawlJob {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  estimated_time?: string;
}

export interface CrawlJobProgress {
  total_categories: number;
  processed_categories: number;
  total_companies: number;
  current_category?: string;
}

export interface CrawlJobConfig {
  max_companies_per_category: number;
  extract_details: boolean;
  category_level: number;
  max_categories: number;
}

export interface CrawlJobStatus {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: CrawlJobProgress;
  config: CrawlJobConfig;
  result?: {
    total_companies: number;
    total_categories: number;
    file_path?: string;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlResultFile {
  filename: string;
  filepath: string;
  size: number;
  created_at: string;
  job_id?: string;
}

