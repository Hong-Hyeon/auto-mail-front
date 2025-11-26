/**
 * Mail sending service
 */

import apiClient from './api';
import type { MailSendRequest, MailSendResponse } from '../types/mail';

export const mailService = {
  /**
   * Send emails to companies from database
   */
  sendEmails: async (request: MailSendRequest): Promise<MailSendResponse> => {
    const response = await apiClient.post<MailSendResponse>('/mail/send', request);
    return response.data;
  },
};

