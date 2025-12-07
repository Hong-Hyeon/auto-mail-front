/**
 * Add Company Form Component
 */

import { useState, useEffect, useMemo } from 'react';
import { companyService } from '../../services/companyService';
import type { CompanyCreate, IndustryInfo, RegionInfo } from '../../types/company';

interface AddCompanyFormProps {
  onSubmit: (companyData: CompanyCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const AddCompanyForm = ({ onSubmit, onCancel, loading = false }: AddCompanyFormProps) => {
  const [formData, setFormData] = useState<CompanyCreate>({
    name: '',
    email: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    industry_id: null,
    region_id: null,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(false);
  const [companyExists, setCompanyExists] = useState<boolean | null>(null);
  const [existingCompany, setExistingCompany] = useState<any>(null);
  
  // Industries and Regions for select dropdowns
  const [industries, setIndustries] = useState<IndustryInfo[]>([]);
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  
  // Fetch industries and regions on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError(null);
        console.log('[AddCompanyForm] Fetching industries and regions...');
        const [industriesData, regionsData] = await Promise.all([
          companyService.getIndustriesFull(true),
          companyService.getRegionsFull(true),
        ]);
        console.log('[AddCompanyForm] Industries:', industriesData);
        console.log('[AddCompanyForm] Regions:', regionsData);
        setIndustries(industriesData.industries || []);
        setRegions(regionsData.regions || []);
      } catch (err: any) {
        console.error('[AddCompanyForm] Failed to fetch industries/regions:', err);
        setOptionsError(err.response?.data?.detail || err.message || 'Failed to load options');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.industry_id !== null &&
      formData.industry_id !== '' &&
      formData.region_id !== null &&
      formData.region_id !== '' &&
      companyExists !== true
    );
  }, [formData.name, formData.email, formData.industry_id, formData.region_id, companyExists]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (companyExists === true) {
      newErrors.name = `Company "${formData.name.trim()}" already exists${existingCompany?.email ? ` (Email: ${existingCompany.email})` : ''}`;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    if (!formData.industry_id) {
      newErrors.industry_id = 'Industry is required';
    }

    if (!formData.region_id) {
      newErrors.region_id = 'Region is required';
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
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact_phone: formData.contact_phone?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        address: formData.address?.trim() || null,
        industry_id: formData.industry_id || null,
        region_id: formData.region_id || null,
        description: formData.description?.trim() || null,
      });
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to create company');
    }
  };

  const handleChange = (field: keyof CompanyCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Reset company existence check when name changes
    if (field === 'name') {
      setCompanyExists(null);
      setExistingCompany(null);
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

  const handleCheckCompany = async () => {
    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Please enter a company name first' }));
      return;
    }

    try {
      setCheckingCompany(true);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
      
      const result = await companyService.checkCompanyExists(formData.name.trim());
      setCompanyExists(result.exists);
      setExistingCompany(result.company);
      
      if (result.exists) {
        setErrors((prev) => ({
          ...prev,
          name: `Company "${formData.name.trim()}" already exists${result.company?.email ? ` (Email: ${result.company.email})` : ''}`,
        }));
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        name: err.response?.data?.detail || err.message || 'Failed to check company',
      }));
      setCompanyExists(null);
      setExistingCompany(null);
    } finally {
      setCheckingCompany(false);
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
          htmlFor="name"
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={loading}
          style={{
              flex: 1,
            padding: '0.625rem 0.875rem',
              border: `1px solid ${errors.name ? '#dc2626' : companyExists === true ? '#f59e0b' : companyExists === false ? '#10b981' : 'var(--border-color)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCheckCompany();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCheckCompany}
            disabled={loading || checkingCompany || !formData.name.trim()}
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: (loading || checkingCompany || !formData.name.trim()) ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (loading || checkingCompany || !formData.name.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            {checkingCompany ? 'Checking...' : 'Check'}
          </button>
        </div>
        {companyExists === false && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            <span>✓</span>
            <span>Company name is available</span>
          </div>
        )}
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
          htmlFor="email"
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
          id="email"
          type="email"
          value={formData.email}
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
          htmlFor="contact_phone"
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
          id="contact_phone"
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
          htmlFor="contact_email"
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
          id="contact_email"
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
          htmlFor="address"
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
          id="address"
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
          htmlFor="industry_id"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Industry <span style={{ color: '#dc2626' }}>*</span>
        </label>
        {loadingOptions ? (
          <div style={{
            padding: '0.625rem 0.875rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}>
            Loading industries...
          </div>
        ) : optionsError ? (
          <div style={{
            padding: '0.625rem 0.875rem',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            Error: {optionsError}
          </div>
        ) : (
          <select
            id="industry_id"
            value={formData.industry_id || ''}
            onChange={(e) => handleChangeId('industry_id', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: errors.industry_id ? '1px solid #dc2626' : '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">Select Industry *</option>
            {industries.length === 0 ? (
              <option value="" disabled>No industries available</option>
            ) : (
              industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))
            )}
          </select>
        )}
        {errors.industry_id && (
          <div style={{
            marginTop: '0.25rem',
            color: '#dc2626',
            fontSize: '0.75rem',
          }}>
            {errors.industry_id}
          </div>
        )}
      </div>

      {/* Region */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="region_id"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Region <span style={{ color: '#dc2626' }}>*</span>
        </label>
        {loadingOptions ? (
          <div style={{
            padding: '0.625rem 0.875rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}>
            Loading regions...
          </div>
        ) : optionsError ? (
          <div style={{
            padding: '0.625rem 0.875rem',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            Error: {optionsError}
          </div>
        ) : (
          <select
            id="region_id"
            value={formData.region_id || ''}
            onChange={(e) => handleChangeId('region_id', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: errors.region_id ? '1px solid #dc2626' : '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">Select Region *</option>
            {regions.length === 0 ? (
              <option value="" disabled>No regions available</option>
            ) : (
              regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))
            )}
          </select>
        )}
        {errors.region_id && (
          <div style={{
            marginTop: '0.25rem',
            color: '#dc2626',
            fontSize: '0.75rem',
          }}>
            {errors.region_id}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="description"
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
          id="description"
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
          disabled={loading || !isFormValid}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: (loading || !isFormValid) ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: (loading || !isFormValid) ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
        >
          {loading ? 'Creating...' : 'Create Company'}
        </button>
      </div>
    </form>
  );
};

