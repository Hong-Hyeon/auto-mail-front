/**
 * Companies Page
 */

import { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout/Layout';
import { companyService } from '../services/companyService';
import type { Company } from '../types/company';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortField = 'name' | 'email' | 'created_at';
type SortOrder = 'asc' | 'desc';

export const CompaniesPage = () => {
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
  }, [companies, sortBy, sortOrder]);

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
              onClick={() => {
                // TODO: Add company modal
                alert('Add company functionality will be implemented');
              }}
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
                          {company.industry || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {company.region || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: company.is_active ? '#d1fae5' : '#f3f4f6',
                            color: company.is_active ? '#065f46' : '#6b7280',
                          }}>
                            {company.is_active ? 'Active' : 'Inactive'}
                          </span>
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
                              onClick={() => {
                                // TODO: Edit company modal
                                alert('Edit company functionality will be implemented');
                              }}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                              }}
                            >
                              Edit
                            </button>
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
    </Layout>
  );
};
