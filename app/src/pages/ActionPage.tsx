/**
 * Action Page
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout/Layout';
import { DateRangeModal } from '../components/DateRangeModal/DateRangeModal';
import { companyService } from '../services/companyService';
import { mailService } from '../services/mailService';
import { emailHistoryService } from '../services/emailHistoryService';
import { emailTemplateService } from '../services/emailTemplateService';
import { useAuth } from '../contexts/AuthContext';
import type { Company } from '../types/company';
import type { MailSendResponse } from '../types/mail';
import type { EmailHistory } from '../types/emailHistory';
import type { EmailTemplate } from '../types/emailTemplate';

export const ActionPage = () => {
  const { isAdmin } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<MailSendResponse | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [emailSentFilter, setEmailSentFilter] = useState<'all' | 'sent' | 'not_sent'>('all');
  
  // Industries and Regions from API
  const [industries, setIndustries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  
  // Options
  // For non-admin users, skipSent is always true
  const [skipSent, setSkipSent] = useState(true);
  const [limit, setLimit] = useState(1000);
  
  // Ensure skipSent is always true for non-admin users
  useEffect(() => {
    if (!isAdmin) {
      setSkipSent(true);
    }
  }, [isAdmin]);
  
  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Date Range Modal
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [emailHistoryByCompany, setEmailHistoryByCompany] = useState<Map<string, EmailHistory[]>>(new Map());
  const [highlightedDates, setHighlightedDates] = useState<Set<string>>(new Set());

  // Reset email sent filter when email history is cleared
  useEffect(() => {
    if (emailHistoryByCompany.size === 0 && emailSentFilter !== 'all') {
      setEmailSentFilter('all');
    }
  }, [emailHistoryByCompany]);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: {
        skip?: number;
        limit?: number;
        is_active?: boolean;
        search?: string;
      } = {
        skip: 0,
        limit: 1000, // Maximum allowed by backend
      };
      
      // Only show active companies
      params.is_active = true;
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await companyService.getCompanies(params);
      setCompanies(response.items);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.msg || err.message || 'Failed to fetch companies';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await emailTemplateService.getTemplates({
        is_active: true,
        limit: 1000,
      });
      setTemplates(response.items);
      
      // Set default template if available
      if (response.items.length > 0 && !selectedTemplateId) {
        const defaultTemplate = response.items.find(t => t.name === 'factoring_service') || response.items[0];
        setSelectedTemplateId(defaultTemplate.id);
      }
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Fetch industries and regions from API
  const fetchFilters = async () => {
    try {
      const [industriesData, regionsData] = await Promise.all([
        companyService.getIndustries(true),
        companyService.getRegions(true),
      ]);
      setIndustries(industriesData);
      setRegions(regionsData);
    } catch (err: any) {
      console.error('Failed to fetch filters:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchTemplates();
    fetchFilters();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter((company) => company.is_active);

    if (industryFilter !== 'all') {
      filtered = filtered.filter((company) => company.industry?.name === industryFilter);
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter((company) => company.region?.name === regionFilter);
    }

    // Email sent filter (only apply if email history data is available)
    if (emailSentFilter !== 'all' && emailHistoryByCompany.size > 0) {
      filtered = filtered.filter((company) => {
        const hasEmailHistory = emailHistoryByCompany.has(company.id);
        if (emailSentFilter === 'sent') {
          return hasEmailHistory;
        } else {
          // not_sent
          return !hasEmailHistory;
        }
      });
    }

    return filtered;
  }, [companies, industryFilter, regionFilter, emailSentFilter, emailHistoryByCompany]);


  // Select All handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCompanyIds(new Set(filteredCompanies.map((c) => c.id)));
    } else {
      setSelectedCompanyIds(new Set());
    }
  };

  // Individual checkbox handler
  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    const newSelected = new Set(selectedCompanyIds);
    if (checked) {
      newSelected.add(companyId);
    } else {
      newSelected.delete(companyId);
    }
    setSelectedCompanyIds(newSelected);
  };

  const isAllSelected = filteredCompanies.length > 0 && selectedCompanyIds.size === filteredCompanies.length;
  const isIndeterminate = selectedCompanyIds.size > 0 && selectedCompanyIds.size < filteredCompanies.length;
  
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Send to all companies
  const handleSendToAll = async () => {
    if (!confirm('Send email to all active companies? This may take a while.')) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSendResult(null);

      const request = {
        company_ids: null,
        // "Send to all" means all active companies, regardless of filters
        template_id: selectedTemplateId || null,
        template_name: null,
        industry: null,
        region: null,
        skip_sent: skipSent,
        limit: limit,
      };

      const result = await mailService.sendEmails(request);
      setSendResult(result);
      
      // Refresh companies list after sending
      await fetchCompanies();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.msg || err.message || 'Failed to send emails';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setSending(false);
    }
  };

  // Send to selected companies
  const handleSendToSelected = async () => {
    if (selectedCompanyIds.size === 0) {
      alert('Please select at least one company');
      return;
    }

    if (!confirm(`Send email to ${selectedCompanyIds.size} selected company(ies)?`)) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSendResult(null);

      const request = {
        company_ids: Array.from(selectedCompanyIds),
        template_id: selectedTemplateId || null,
        template_name: null,
        industry: null, // When specific companies are selected, don't use industry filter
        region: null, // When specific companies are selected, don't use region filter
        skip_sent: skipSent,
        limit: limit,
      };

      const result = await mailService.sendEmails(request);
      setSendResult(result);
      
      // Clear selection after sending
      setSelectedCompanyIds(new Set());
      
      // Refresh companies list after sending
      await fetchCompanies();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.msg || err.message || 'Failed to send emails';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <h1 style={{
          color: 'var(--text-color)',
          fontSize: '1.875rem',
          fontWeight: '600',
          marginBottom: '2rem',
        }}>
          Action
        </h1>

        {/* Send to All Section */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              margin: 0,
            }}>
              Send email to all active companies in the database
            </p>
            
            {/* Template Selection */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              width: '100%',
              maxWidth: '400px',
            }}>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-color)',
                textAlign: 'left',
              }}>
                Email Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                disabled={loadingTemplates || sending}
                style={{
                  padding: '0.625rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: (loadingTemplates || sending) ? 'var(--hover-bg)' : 'var(--card-bg)',
                  color: 'var(--text-color)',
                  cursor: (loadingTemplates || sending) ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingTemplates ? (
                  <option>Loading templates...</option>
                ) : templates.length === 0 ? (
                  <option>No templates available</option>
                ) : (
                  templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} {template.description ? `- ${template.description}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <button
              onClick={handleSendToAll}
              disabled={sending || !selectedTemplateId || loadingTemplates}
              style={{
                padding: '1rem 2rem',
                backgroundColor: (sending || !selectedTemplateId || loadingTemplates) ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (sending || !selectedTemplateId || loadingTemplates) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (!sending && selectedTemplateId && !loadingTemplates) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!sending && selectedTemplateId && !loadingTemplates) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
            >
              {sending ? '⏳ Sending...' : '📧 Send Email to All Active Companies'}
            </button>
          </div>
        </div>

        {/* Select Companies Section */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{
              color: 'var(--text-color)',
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: 0,
            }}>
              Select Companies
            </h2>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}>
              {emailHistoryByCompany.size > 0 && (
                <button
                  onClick={() => {
                    setEmailHistoryByCompany(new Map());
                    setHighlightedDates(new Set());
                    setEmailSentFilter('all');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                  }}
                  title="Clear date range and email history"
                >
                  🗑️ Clear
                </button>
              )}
              <button
                onClick={() => setIsDateRangeModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                📅 Date
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 2.5rem 0.625rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  outline: 'none',
                }}
              />
              <span style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}>
                🔍
              </span>
            </div>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '150px',
              }}
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '150px',
              }}
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            {/* Email Sent Filter */}
            <select
              value={emailSentFilter}
              onChange={(e) => setEmailSentFilter(e.target.value as 'all' | 'sent' | 'not_sent')}
              disabled={emailHistoryByCompany.size === 0}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: emailHistoryByCompany.size === 0 ? 'var(--hover-bg)' : 'var(--card-bg)',
                color: emailHistoryByCompany.size === 0 ? 'var(--text-secondary)' : 'var(--text-color)',
                cursor: emailHistoryByCompany.size === 0 ? 'not-allowed' : 'pointer',
                outline: 'none',
                minWidth: '150px',
                opacity: emailHistoryByCompany.size === 0 ? 0.6 : 1,
              }}
              title={emailHistoryByCompany.size === 0 ? 'Please select a date range first' : ''}
            >
              <option value="all">
                {emailHistoryByCompany.size === 0 ? 'All Companies (Set Date First)' : 'All Companies'}
              </option>
              <option value="sent" disabled={emailHistoryByCompany.size === 0}>
                Email Sent
              </option>
              <option value="not_sent" disabled={emailHistoryByCompany.size === 0}>
                Not Sent
              </option>
            </select>
          </div>

          {/* Select All */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--hover-bg)',
            borderRadius: '6px',
          }}>
            <input
              type="checkbox"
              ref={selectAllCheckboxRef}
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            <label style={{
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}>
              Select All ({filteredCompanies.length} companies)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              marginBottom: '1rem',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {/* Company List */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            marginBottom: '1rem',
          }}>
            {loading ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}>
                Loading companies...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}>
                No companies found
              </div>
            ) : (
              <div style={{
                padding: '0.5rem',
              }}>
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompanyIds.has(company.id)}
                      onChange={(e) => handleCompanyToggle(company.id, e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: 'var(--text-color)',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                      }}>
                        {company.name}
                      </div>
                      <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                      }}>
                        {company.contact_email || company.email}
                      </div>
                    </div>
                    {emailHistoryByCompany.has(company.id) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <span style={{
                          padding: '0.5rem 0.875rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '0.8125rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                          border: '2px solid #059669',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.025em',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }}>
                          <span style={{ fontSize: '1rem', lineHeight: '1' }}>✓</span>
                          <span>Sent {emailHistoryByCompany.get(company.id)?.length || 0}</span>
                        </span>
                      </div>
                    )}
                    {company.industry && (
                      <div style={{
                        padding: '0.25rem 0.625rem',
                        backgroundColor: 'var(--hover-bg)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {company.industry.name}
                      </div>
                    )}
                    {company.region && (
                      <div style={{
                        padding: '0.25rem 0.625rem',
                        backgroundColor: 'var(--hover-bg)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {company.region.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Count and Send Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}>
              Selected: <strong style={{ color: 'var(--text-color)' }}>{selectedCompanyIds.size}</strong> company(ies)
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'flex-end',
            }}>
              {/* Template Selection */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                minWidth: '250px',
              }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                }}>
                  Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  disabled={loadingTemplates || sending}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: (loadingTemplates || sending) ? 'var(--hover-bg)' : 'var(--card-bg)',
                    color: 'var(--text-color)',
                    cursor: (loadingTemplates || sending) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loadingTemplates ? (
                    <option>Loading...</option>
                  ) : templates.length === 0 ? (
                    <option>No templates</option>
                  ) : (
                    templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button
                onClick={handleSendToSelected}
                disabled={selectedCompanyIds.size === 0 || sending || !selectedTemplateId || loadingTemplates}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: (selectedCompanyIds.size === 0 || sending || !selectedTemplateId || loadingTemplates) ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (selectedCompanyIds.size === 0 || sending || !selectedTemplateId || loadingTemplates) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {sending ? '⏳ Sending...' : '📧 Send to Selected Companies'}
              </button>
            </div>
          </div>
        </div>

        {/* Options Section - Only visible for admin users */}
        {isAdmin && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{
              color: 'var(--text-color)',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
            }}>
              Options
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {/* Skip Sent Option */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-color)',
                  fontSize: '0.875rem',
                }}>
                  <input
                    type="checkbox"
                    checked={skipSent}
                    onChange={(e) => setSkipSent(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Skip companies that have ever received this template before</span>
                </label>
                <div style={{
                  marginLeft: '1.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                }}>
                  When enabled, companies that have previously received this template will be automatically skipped to avoid duplicate emails.
                </div>
              </div>

              {/* Limit Option */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <label style={{
                  color: 'var(--text-color)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  Limit:
                </label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  min={1}
                  max={10000}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    outline: 'none',
                    width: '120px',
                  }}
                />
                <span style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                }}>
                  companies
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Send Result Section */}
        {sendResult && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginTop: '2rem',
          }}>
            <h2 style={{
              color: 'var(--text-color)',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              Send Result
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--hover-bg)',
                borderRadius: '6px',
              }}>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem',
                }}>
                  Total
                </div>
                <div style={{
                  color: 'var(--text-color)',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}>
                  {sendResult.total}
                </div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#d1fae5',
                borderRadius: '6px',
              }}>
                <div style={{
                  color: '#065f46',
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem',
                }}>
                  Success
                </div>
                <div style={{
                  color: '#065f46',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}>
                  {sendResult.success_count}
                </div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: sendResult.failure_count > 0 ? '#fee2e2' : 'var(--hover-bg)',
                borderRadius: '6px',
              }}>
                <div style={{
                  color: sendResult.failure_count > 0 ? '#991b1b' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem',
                }}>
                  Failed
                </div>
                <div style={{
                  color: sendResult.failure_count > 0 ? '#991b1b' : 'var(--text-color)',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}>
                  {sendResult.failure_count}
                </div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--hover-bg)',
                borderRadius: '6px',
              }}>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem',
                }}>
                  Processing Time
                </div>
                <div style={{
                  color: 'var(--text-color)',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}>
                  {sendResult.processing_time.toFixed(2)}s
                </div>
              </div>
            </div>
            {sendResult.failure_count > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
              }}>
                <div style={{
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}>
                  Failed Emails:
                </div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}>
                  {sendResult.results
                    .filter((r) => !r.success)
                    .map((r, idx) => (
                      <div key={idx} style={{
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#991b1b',
                        borderBottom: '1px solid #fecaca',
                      }}>
                        <strong>{r.recipient}</strong>: {r.error || 'Unknown error'}
                      </div>
                    ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setSendResult(null)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* Date Range Modal */}
        <DateRangeModal
          isOpen={isDateRangeModalOpen}
          onClose={() => setIsDateRangeModalOpen(false)}
          onApply={async (startDate, endDate) => {
            if (!startDate || !endDate) return;
            
            try {
              // Format dates for API
              const startDateStr = startDate.toISOString();
              const endDateStr = new Date(endDate);
              endDateStr.setHours(23, 59, 59, 999);
              const endDateStrFormatted = endDateStr.toISOString();

              // Get list of company IDs to filter (selected companies or all filtered companies)
              const companyIdsToCheck = selectedCompanyIds.size > 0
                ? Array.from(selectedCompanyIds)
                : filteredCompanies.map(c => c.id);

              // Create a Set for fast lookup
              const companyIdsSet = new Set(companyIdsToCheck);

              // Single API call: Fetch all email history in date range (without company_id filter)
              // Use limit: 1000 (maximum allowed by backend)
              const response = await emailHistoryService.getEmailHistory({
                start_date: startDateStr,
                end_date: endDateStrFormatted,
                limit: 1000, // Maximum allowed by backend
              });

              // Group email history by company_id on client side
              const historyMap = new Map<string, EmailHistory[]>();
              const datesSet = new Set<string>();

              response.items.forEach((item) => {
                // Only process emails for companies we're interested in
                if (item.company_id && companyIdsSet.has(item.company_id)) {
                  // Add to company history map
                  if (!historyMap.has(item.company_id)) {
                    historyMap.set(item.company_id, []);
                  }
                  historyMap.get(item.company_id)!.push(item);

                  // Add date to highlighted set
                  const sentDate = new Date(item.sent_at);
                  const dateKey = `${sentDate.getFullYear()}-${String(sentDate.getMonth() + 1).padStart(2, '0')}-${String(sentDate.getDate()).padStart(2, '0')}`;
                  datesSet.add(dateKey);
                }
              });

              setEmailHistoryByCompany(historyMap);
              setHighlightedDates(datesSet);
            } catch (err: any) {
              alert(err.response?.data?.detail || err.message || 'Failed to fetch email history');
            }
          }}
          highlightedDates={highlightedDates}
        />
      </div>
    </Layout>
  );
};
