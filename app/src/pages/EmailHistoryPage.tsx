/**
 * Email History Page
 */

import { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout/Layout';
import { emailHistoryService } from '../services/emailHistoryService';
import { companyService } from '../services/companyService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import type { EmailHistory } from '../types/emailHistory';
import type { Company } from '../types/company';
import type { User } from '../types/user';

type StatusFilter = 'all' | 'sent' | 'failed' | 'pending';
type SortField = 'sent_at' | 'subject' | 'recipient_email';
type SortOrder = 'asc' | 'desc';

export const EmailHistoryPage = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.is_admin || false;

  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEmails, setTotalEmails] = useState(0);

  // Companies and Users for filters (admin only)
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Filters
  const [recipientEmail, setRecipientEmail] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sorting
  const [sortBy, setSortBy] = useState<SortField>('sent_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch companies and users for filters (admin only)
  useEffect(() => {
    if (isAdmin) {
      const fetchFilters = async () => {
        try {
          const [companiesRes, usersRes] = await Promise.all([
            companyService.getCompanies({ limit: 1000 }),
            userService.getUsers({ limit: 1000 }),
          ]);
          setCompanies(companiesRes.items);
          setUsers(usersRes);
        } catch (err) {
          console.error('Failed to fetch filter data:', err);
        }
      };
      fetchFilters();
    }
  }, [isAdmin]);

  // Fetch email history
  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        skip?: number;
        limit?: number;
        company_id?: string;
        user_id?: string;
        recipient_email?: string;
        template_name?: string;
        status?: 'sent' | 'failed' | 'pending';
        start_date?: string;
        end_date?: string;
      } = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (recipientEmail.trim()) {
        params.recipient_email = recipientEmail.trim();
      }

      if (templateName.trim()) {
        params.template_name = templateName.trim();
      }

      if (companyFilter !== 'all' && isAdmin) {
        params.company_id = companyFilter;
      }

      if (userFilter !== 'all' && isAdmin) {
        params.user_id = userFilter;
      }

      if (startDate) {
        params.start_date = new Date(startDate).toISOString();
      }

      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.end_date = endDateTime.toISOString();
      }

      const response = await emailHistoryService.getEmailHistory(params);
      setEmailHistory(response.items);
      setTotalEmails(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch email history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailHistory();
  }, [currentPage, statusFilter, companyFilter, userFilter, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchEmailHistory();
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [recipientEmail, templateName]);

  // Sort email history
  const sortedEmailHistory = useMemo(() => {
    const sorted = [...emailHistory];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'sent_at':
          aValue = a.sent_at || '';
          bValue = b.sent_at || '';
          break;
        case 'subject':
          aValue = a.subject;
          bValue = b.subject;
          break;
        case 'recipient_email':
          aValue = a.recipient_email;
          bValue = b.recipient_email;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [emailHistory, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(totalEmails / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEmails);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'sent':
        return {
          backgroundColor: '#d1fae5',
          color: '#065f46',
        };
      case 'failed':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
        };
      case 'pending':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
        };
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
            Email History
          </h1>
        </div>

        {/* Filters - First Row */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Recipient Email Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search recipient email..."
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
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

          {/* Template Name Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search template name..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
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
              minWidth: '150px',
            }}
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Filters - Second Row (Admin only) */}
        {isAdmin && (
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {/* Company Filter */}
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
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
                minWidth: '200px',
              }}
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            {/* User Filter */}
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
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
                minWidth: '200px',
              }}
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.username} ({user.email})
                </option>
              ))}
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                outline: 'none',
              }}
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.625rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                outline: 'none',
              }}
            />
          </div>
        )}

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
          ) : sortedEmailHistory.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              No email history found
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
                        onClick={() => handleSort('sent_at')}
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
                        Sent At {sortBy === 'sent_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('recipient_email')}
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
                        Recipient {sortBy === 'recipient_email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('subject')}
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
                        Subject {sortBy === 'subject' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                        Template
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
                      {isAdmin && (
                        <th style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Company
                        </th>
                      )}
                      <th style={{
                        padding: '0.875rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Sender
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
                    {sortedEmailHistory.map((email) => (
                      <tr
                        key={email.id}
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
                          color: 'var(--text-secondary)',
                        }}>
                          {formatDateTime(email.sent_at)}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                        }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              {email.recipient_email}
                            </div>
                            {email.recipient_name && (
                              <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                              }}>
                                {email.recipient_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {email.subject}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {email.template_name || '-'}
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
                            ...getStatusBadgeStyle(email.status),
                          }}>
                            {getStatusLabel(email.status)}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{
                            padding: '0.875rem 1rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                          }}>
                            {email.company_id ? (
                              companies.find((c) => c.id === email.company_id)?.name || '-'
                            ) : '-'}
                          </td>
                        )}
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                        }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              {email.sender_email}
                            </div>
                            {email.sender_name && (
                              <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                              }}>
                                {email.sender_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                        }}>
                          <button
                            onClick={() => {
                              // TODO: View details modal
                              alert('View details functionality will be implemented');
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
                            View Details
                          </button>
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
                    Showing {startIndex}-{endIndex} of {totalEmails} emails
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
