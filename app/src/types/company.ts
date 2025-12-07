/**
 * Company-related TypeScript types
 */

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  industry: IndustryInfo | null;
  region: RegionInfo | null;
  description: string | null;
  created_by: string | null;
  creator: UserInfo | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndustryInfo {
  id: string;
  name: string;
  code?: string | null;
}

export interface RegionInfo {
  id: string;
  name: string;
  code?: string | null;
}

export interface CompanyCreate {
  name: string;
  email: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  industry_id?: string | null;
  region_id?: string | null;
  description?: string | null;
}

export interface CompanyUpdate {
  name?: string;
  email?: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  industry_id?: string | null;
  region_id?: string | null;
  description?: string | null;
  is_active?: boolean;
}

export interface CompanyListResponse {
  total: number;
  items: Company[];
  skip: number;
  limit: number;
}

export interface CompanyUploadResponse {
  total_rows: number;
  success_count: number;
  failure_count: number;
  skipped_count: number;
  results: CompanyUploadResult[];
}

export interface CompanyUploadResult {
  row_number: number;
  company_name?: string | null;
  email?: string | null;
  success: boolean;
  company_id?: string | null;
  error?: string | null;
}

export interface CompanyExistsResponse {
  exists: boolean;
  company: Company | null;
}

export interface IndustryListResponse {
  industries: string[];
  count: number;
}

export interface RegionListResponse {
  regions: string[];
  count: number;
}

export interface IndustryFullListResponse {
  industries: IndustryInfo[];
  count: number;
}

export interface RegionFullListResponse {
  regions: RegionInfo[];
  count: number;
}

