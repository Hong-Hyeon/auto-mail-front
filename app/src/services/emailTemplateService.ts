/**
 * Email Template management service
 */

import apiClient from './api';
import type {
  EmailTemplate,
  EmailTemplateCreate,
  EmailTemplateUpdate,
  EmailTemplateListResponse,
  TemplateVariableListResponse,
} from '../types/emailTemplate';

export interface EmailTemplateListParams {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}

export const emailTemplateService = {
  /**
   * Get list of email templates
   */
  getTemplates: async (params?: EmailTemplateListParams): Promise<EmailTemplateListResponse> => {
    const response = await apiClient.get<EmailTemplateListResponse>('/mail/templates', { params });
    return response.data;
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (templateId: string): Promise<EmailTemplate> => {
    const response = await apiClient.get<EmailTemplate>(`/mail/templates/${templateId}`);
    return response.data;
  },

  /**
   * Get template by name
   */
  getTemplateByName: async (templateName: string): Promise<EmailTemplate> => {
    const response = await apiClient.get<EmailTemplate>(`/mail/templates/name/${templateName}`);
    return response.data;
  },

  /**
   * Create new template
   */
  createTemplate: async (templateData: EmailTemplateCreate): Promise<EmailTemplate> => {
    const response = await apiClient.post<EmailTemplate>('/mail/templates', templateData);
    return response.data;
  },

  /**
   * Update template
   */
  updateTemplate: async (templateId: string, templateData: EmailTemplateUpdate): Promise<EmailTemplate> => {
    const response = await apiClient.put<EmailTemplate>(`/mail/templates/${templateId}`, templateData);
    return response.data;
  },

  /**
   * Delete template (soft delete)
   */
  deleteTemplate: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/mail/templates/${templateId}`);
  },

  /**
   * Get available template variables
   */
  getTemplateVariables: async (): Promise<TemplateVariableListResponse> => {
    const response = await apiClient.get<TemplateVariableListResponse>('/mail/template-variables');
    return response.data;
  },
};

