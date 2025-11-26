/**
 * Template Preview Component
 */

import { useMemo } from 'react';
import type { EmailTemplate, TemplateVariable } from '../../types/emailTemplate';
import { emailTemplateService } from '../../services/emailTemplateService';
import { useState, useEffect } from 'react';

interface TemplatePreviewProps {
  template: EmailTemplate;
}

export const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const [variables, setVariables] = useState<TemplateVariable[]>([]);

  useEffect(() => {
    const loadVariables = async () => {
      try {
        const data = await emailTemplateService.getTemplateVariables();
        setVariables(data.variables);
      } catch (err) {
        console.error('Failed to load template variables:', err);
      }
    };
    loadVariables();
  }, []);

  // Sample data for preview
  const sampleData = useMemo(() => {
    const data: Record<string, string> = {
      company_name: 'ABC회사',
      company_email: 'contact@abc.com',
      company_phone: '02-1234-5678',
      company_address: '서울시 강남구',
      sender_name: '식스티페이 팀',
      sender_email: 'noreply@sixtypay.com',
      current_date: new Date().toLocaleDateString('ko-KR'),
      logo_url: 'https://via.placeholder.com/200x50',
    };

    // Add all variables with example values
    variables.forEach((variable) => {
      if (variable.example_value) {
        data[variable.name] = variable.example_value;
      }
    });

    return data;
  }, [variables]);

  // Render preview
  const previewSubject = useMemo(() => {
    let subject = template.subject;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      subject = subject.replace(regex, value);
    });
    return subject;
  }, [template.subject, sampleData]);

  const previewBody = useMemo(() => {
    let body = template.body;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      body = body.replace(regex, value);
    });
    return body;
  }, [template.body, sampleData]);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-color)',
        }}>
          Template Information
        </div>
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Name:</strong> {template.name}
          </div>
          {template.description && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Description:</strong> {template.description}
            </div>
          )}
          <div>
            <strong>Status:</strong>{' '}
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: template.is_active ? '#d1fae5' : '#f3f4f6',
              color: template.is_active ? '#065f46' : '#6b7280',
            }}>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-color)',
        }}>
          Subject:
        </label>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-color)',
        }}>
          {previewSubject || '(No subject)'}
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-color)',
        }}>
          Body:
        </label>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            minHeight: '400px',
          }}
          dangerouslySetInnerHTML={{ __html: previewBody || '(No content)' }}
        />
      </div>
    </div>
  );
};

