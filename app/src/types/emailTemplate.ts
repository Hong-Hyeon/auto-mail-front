/**
 * Email Template-related TypeScript types
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string | null;
  is_active: boolean;
  is_html: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateCreate {
  name: string;
  subject: string;
  body: string;
  description?: string | null;
}

export interface EmailTemplateUpdate {
  subject?: string;
  body?: string;
  description?: string | null;
  is_active?: boolean;
}

export interface EmailTemplateListResponse {
  total: number;
  items: EmailTemplate[];
}

export interface TemplateVariable {
  name: string;
  display_name: string;
  description: string;
  source_type: 'company' | 'sender' | 'system' | 'custom';
  source_table?: string | null;
  source_column?: string | null;
  jinja2_syntax: string;
  example_value?: string | null;
  is_required: boolean;
  category: string;
}

export interface TemplateVariableListResponse {
  variables: TemplateVariable[];
  categories: string[];
}

