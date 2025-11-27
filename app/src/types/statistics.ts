/**
 * Statistics-related TypeScript types
 */

export interface EmailStatistics {
  user_email: string | null;
  start_date: string | null;
  end_date: string | null;
  total_count: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
}

export interface CompanyStatistics {
  user_email: string | null;
  total_count: number;
  active_count: number;
  inactive_count: number;
}

export interface EmailStatisticsParams {
  user_email?: string;
  start_date?: string;
  end_date?: string;
}

export interface CompanyStatisticsParams {
  user_email?: string;
}

