/**
 * Edit Company Form Component
 */

import { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import type { Company, CompanyUpdate, IndustryInfo, RegionInfo } from '../../types/company';

interface EditCompanyFormProps {
  company: Company;
  onSubmit: (companyId: string, companyData: CompanyUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EditCompanyForm = ({ company, onSubmit, onCancel, loading = false }: EditCompanyFormProps) => {
  const [formData, setFormData] = useState<CompanyUpdate>({
    name: company.name,
    email: company.email,
    contact_phone: company.contact_phone || '',
    contact_email: company.contact_email || '',
    address: company.address || '',
    industry_id: company.industry?.id || null,
    region_id: company.region?.id || null,
    description: company.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Industries and Regions for select dropdowns
  const [industries, setIndustries] = useState<IndustryInfo[]>([]);
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  
  // Fetch industries and regions on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [industriesData, regionsData] = await Promise.all([
          companyService.getIndustriesFull(true),
          companyService.getRegionsFull(true),
        ]);
        setIndustries(industriesData.industries);
        setRegions(regionsData.regions);
      } catch (err) {
        console.error('Failed to fetch industries/regions:', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    // Reset form when company changes
    setFormData({
      name: company.name,
      email: company.email,
      contact_phone: company.contact_phone || '',
      contact_email: company.contact_email || '',
      address: company.address || '',
      industry_id: company.industry?.id || null,
      region_id: company.region?.id || null,
      description: company.description || '',
    });
    setErrors({});
    setSubmitError(null);
  }, [company]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(company.id, {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        contact_phone: formData.contact_phone?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        address: formData.address?.trim() || null,
        industry_id: formData.industry_id || null,
        region_id: formData.region_id || null,
        description: formData.description?.trim() || null,
      });
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to update company');
    }
  };

  const handleChange = (field: keyof CompanyUpdate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChangeId = (field: 'industry_id' | 'region_id', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {submitError && (
        <div style={{
          padding: '0.875rem 1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          fontSize: '0.875rem',
        }}>
          {submitError}
        </div>
      )}

      {/* Name */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-name"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Company Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="edit-name"
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: `1px solid ${errors.name ? '#dc2626' : 'var(--border-color)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.name && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: '#dc2626',
          }}>
            {errors.name}
          </div>
        )}
      </div>

      {/* Email */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-email"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Email <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="edit-email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: `1px solid ${errors.email ? '#dc2626' : 'var(--border-color)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.email && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: '#dc2626',
          }}>
            {errors.email}
          </div>
        )}
      </div>

      {/* Contact Phone */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-contact_phone"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Contact Phone
        </label>
        <input
          id="edit-contact_phone"
          type="text"
          value={formData.contact_phone || ''}
          onChange={(e) => handleChange('contact_phone', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Contact Email */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-contact_email"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Contact Email
        </label>
        <input
          id="edit-contact_email"
          type="email"
          value={formData.contact_email || ''}
          onChange={(e) => handleChange('contact_email', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: `1px solid ${errors.contact_email ? '#dc2626' : 'var(--border-color)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.contact_email && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: '#dc2626',
          }}>
            {errors.contact_email}
          </div>
        )}
      </div>

      {/* Address */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-address"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Address
        </label>
        <textarea
          id="edit-address"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          disabled={loading}
          rows={3}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Industry */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-industry_id"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Industry
        </label>
        <select
          id="edit-industry_id"
          value={formData.industry_id || ''}
          onChange={(e) => handleChangeId('industry_id', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="">Select Industry (Optional)</option>
          {industries.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.name}
            </option>
          ))}
        </select>
      </div>

      {/* Region */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="edit-region_id"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Region
        </label>
        <select
          id="edit-region_id"
          value={formData.region_id || ''}
          onChange={(e) => handleChangeId('region_id', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="">Select Region (Optional)</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="edit-description"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Description
        </label>
        <textarea
          id="edit-description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={loading}
          rows={4}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: 'transparent',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
        >
          {loading ? 'Updating...' : 'Update Company'}
        </button>
      </div>
    </form>
  );
};

