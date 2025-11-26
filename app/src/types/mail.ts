/**
 * Mail-related TypeScript types
 */

export interface EmailResult {
  success: boolean;
  recipient: string;
  message_id: string | null;
  error: string | null;
  timestamp: string;
}

export interface MailSendResponse {
  total: number;
  success_count: number;
  failure_count: number;
  results: EmailResult[];
  processing_time: number;
}

export interface MailSendRequest {
  company_ids?: string[] | null;
  template_id?: string | null;
  template_name?: string | null;
  industry?: string | null;
  region?: string | null;
  skip_sent: boolean;
  limit: number;
}

