/**
 * Companies Page
 */

import { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Modal } from '../components/Modal/Modal';
import { AdminOnly } from '../components/AdminOnly';
import { AddCompanyForm } from '../components/CompanyForm/AddCompanyForm';
import { EditCompanyForm } from '../components/CompanyForm/EditCompanyForm';
import { companyService } from '../services/companyService';
import { useAuth } from '../contexts/AuthContext';
import type { Company, CompanyCreate, CompanyUpdate } from '../types/company';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortField = 'name' | 'email' | 'created_at';
type SortOrder = 'asc' | 'desc';

export const CompaniesPage = () => {
  const { user, isAdmin } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal state
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  const [isDownloadTemplateModalOpen, setIsDownloadTemplateModalOpen] = useState(false);

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
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      };
      
      if (statusFilter === 'active') {
        params.is_active = true;
      } else if (statusFilter === 'inactive') {
        params.is_active = false;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await companyService.getCompanies(params);
      setCompanies(response.items);
      setTotalCompanies(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchCompanies();
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sort companies (client-side for now, can be moved to server)
  const sortedCompanies = useMemo(() => {
    const sorted = [...companies];
    
    sorted.sort((a, b) => {
      // For non-admin users, prioritize their own companies first
      if (!isAdmin && user) {
        const aIsOwn = a.created_by === user.id;
        const bIsOwn = b.created_by === user.id;
        
        // If one is own and the other is not, own comes first
        if (aIsOwn && !bIsOwn) return -1;
        if (!aIsOwn && bIsOwn) return 1;
        // If both are own or both are not, continue with normal sorting
      }
      
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'created_at':
          aValue = a.created_at || '';
          bValue = b.created_at || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [companies, sortBy, sortOrder, isAdmin, user]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      await companyService.deleteCompany(companyId);
      await fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete company');
    }
  };

  const handleToggleActive = async (company: Company) => {
    try {
      await companyService.updateCompany(company.id, {
        is_active: !company.is_active,
      });
      await fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to toggle company status');
    }
  };

  const handleAddCompany = async (companyData: CompanyCreate) => {
    setIsCreatingCompany(true);
    try {
      await companyService.createCompany(companyData);
      setIsAddCompanyModalOpen(false);
      await fetchCompanies();
    } catch (err: any) {
      throw err; // Let the form handle the error
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleEditCompany = async (companyId: string, companyData: CompanyUpdate) => {
    setIsUpdatingCompany(true);
    try {
      await companyService.updateCompany(companyId, companyData);
      setIsEditCompanyModalOpen(false);
      setEditingCompany(null);
      await fetchCompanies();
    } catch (err: any) {
      throw err; // Let the form handle the error
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setIsEditCompanyModalOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await companyService.uploadCompanies(file);
      alert(`Upload completed: ${response.success_count} successful, ${response.failure_count} failed`);
      await fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload companies');
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    setIsDownloadTemplateModalOpen(true);
  };

  const confirmDownloadTemplate = async () => {
    try {
      await companyService.downloadUploadTemplate();
      setIsDownloadTemplateModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to download template');
    }
  };

  const totalPages = Math.ceil(totalCompanies / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCompanies);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{
            color: 'var(--text-color)',
            fontSize: '1.875rem',
            fontWeight: '600',
            margin: 0,
          }}>
            Companies
          </h1>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
          }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              📥 Download Template
            </button>
            <label
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              📄 Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button
              onClick={() => setIsAddCompanyModalOpen(true)}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              + Add Company
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search companies by name or email..."
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.625rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              Loading...
            </div>
          ) : sortedCompanies.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              No companies found
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: 'var(--hover-bg)',
                      borderBottom: '1px solid var(--border-color)',
                    }}>
                      <th
                        onClick={() => handleSort('name')}
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Contact Phone
                      </th>
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Industry
                      </th>
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Region
                      </th>
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Created By
                      </th>
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Status
                      </th>
                      <th
                        onClick={() => handleSort('created_at')}
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Created At {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCompanies.map((company) => (
                      <tr
                        key={company.id}
                        style={{
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
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                          fontWeight: '500',
                        }}>
                          {company.name}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                        }}>
                          {company.email}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {company.contact_phone || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {company.industry?.name || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {company.region?.name || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {company.creator?.email || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                        }}>
                          <button
                            onClick={() => handleToggleActive(company)}
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: company.is_active ? '#d1fae5' : '#fee2e2',
                              color: company.is_active ? '#065f46' : '#991b1b',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = company.is_active ? '#a7f3d0' : '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = company.is_active ? '#d1fae5' : '#fee2e2';
                            }}
                          >
                            {company.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {formatDate(company.created_at)}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                          }}>
                            <button
                              onClick={() => openEditModal(company)}
                              disabled={!isAdmin && company.created_by !== user?.id}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: (!isAdmin && company.created_by !== user?.id) ? '#9ca3af' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (!isAdmin && company.created_by !== user?.id) ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                opacity: (!isAdmin && company.created_by !== user?.id) ? 0.6 : 1,
                              }}
                              title={(!isAdmin && company.created_by !== user?.id) ? 'You can only edit companies you created' : ''}
                            >
                              Edit
                            </button>
                            <AdminOnly>
                            <button
                              onClick={() => handleDelete(company.id)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                              }}
                            >
                              Delete
                            </button>
                            </AdminOnly>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    Showing {startIndex}-{endIndex} of {totalCompanies} companies
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: currentPage === 1 ? 'var(--hover-bg)' : 'var(--card-bg)',
                        color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: currentPage === pageNum ? '#2563eb' : 'var(--card-bg)',
                            color: currentPage === pageNum ? 'white' : 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: currentPage === pageNum ? '600' : '400',
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: currentPage === totalPages ? 'var(--hover-bg)' : 'var(--card-bg)',
                        color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Company Modal */}
      <Modal
        isOpen={isAddCompanyModalOpen}
        onClose={() => setIsAddCompanyModalOpen(false)}
        title="Add New Company"
        size="large"
      >
        <AddCompanyForm
          onSubmit={handleAddCompany}
          onCancel={() => setIsAddCompanyModalOpen(false)}
          loading={isCreatingCompany}
        />
      </Modal>

      {/* Edit Company Modal */}
      {editingCompany && (
        <Modal
          isOpen={isEditCompanyModalOpen}
          onClose={() => {
            setIsEditCompanyModalOpen(false);
            setEditingCompany(null);
          }}
          title="Edit Company"
          size="large"
        >
          <EditCompanyForm
            company={editingCompany}
            onSubmit={handleEditCompany}
            onCancel={() => {
              setIsEditCompanyModalOpen(false);
              setEditingCompany(null);
            }}
            loading={isUpdatingCompany}
          />
        </Modal>
      )}

      {/* Download Template Warning Modal */}
      <Modal
        isOpen={isDownloadTemplateModalOpen}
        onClose={() => setIsDownloadTemplateModalOpen(false)}
        title="⚠️ 엑셀 양식 다운로드"
        size="medium"
      >
        <div style={{
          padding: '1.5rem',
        }}>
          <div style={{
            marginBottom: '1.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            lineHeight: '1.6',
          }}>
            <p style={{ marginBottom: '1rem', fontWeight: '600' }}>
              엑셀 양식을 다운로드하기 전에 다음 사항을 확인해주세요:
            </p>
            <ul style={{
              marginLeft: '1.5rem',
              marginBottom: '1rem',
              paddingLeft: '0.5rem',
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>모든 필수 컬럼</strong>에 데이터를 입력해야 합니다.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                필수 컬럼: <strong>회사명, contact_email, 업종, 지역, 연락처, 주소, 설명</strong>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                업종과 지역은 드롭다운 목록에서 선택해야 합니다.
              </li>
              <li>
                모든 데이터를 입력하지 않으면 업로드가 실패할 수 있습니다.
              </li>
            </ul>
            <p style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              color: '#92400e',
              fontSize: '0.875rem',
            }}>
              ⚠️ <strong>주의:</strong> 모든 필수 데이터를 입력한 후 업로드해주세요.
            </p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}>
            <button
              onClick={() => setIsDownloadTemplateModalOpen(false)}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: 'transparent',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              취소
            </button>
            <button
              onClick={confirmDownloadTemplate}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              다운로드
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
