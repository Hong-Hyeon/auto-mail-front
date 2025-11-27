/**
 * Email History-related TypeScript types
 */

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
}

export interface EmailHistory {
  id: string;
  company_id: string | null;
  user_id: string | null;
  user: UserInfo | null;
  recipient_email: string;
  recipient_name: string | null;
  sender_email: string;
  sender_name: string | null;
  subject: string;
  template_name: string | null;
  status: 'sent' | 'failed' | 'pending';
  message_id: string | null;
  error_message: string | null;
  sent_at: string;
  created_at: string;
}

export interface EmailHistoryListResponse {
  total: number;
  items: EmailHistory[];
}

export interface EmailHistoryListParams {
  skip?: number;
  limit?: number;
  company_id?: string;
  user_id?: string;
  recipient_email?: string;
  template_name?: string;
  status?: 'sent' | 'failed' | 'pending';
  start_date?: string;
  end_date?: string;
}

