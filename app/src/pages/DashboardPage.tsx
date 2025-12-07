/**
 * Dashboard Page
 */

import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Modal } from '../components/Modal/Modal';
import { useAuth } from '../contexts/AuthContext';
import { statisticsService } from '../services/statisticsService';
import { emailHistoryService } from '../services/emailHistoryService';
import { companyService } from '../services/companyService';
import type { EmailStatistics, CompanyStatistics } from '../types/statistics';
import type { EmailHistory } from '../types/emailHistory';
import type { Company } from '../types/company';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type PeriodOption = '7days' | '30days' | '90days' | 'all' | 'custom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Email Statistics
  const [emailStats, setEmailStats] = useState<EmailStatistics | null>(null);
  const [myEmailStats, setMyEmailStats] = useState<EmailStatistics | null>(null);
  const [period, setPeriod] = useState<PeriodOption>('30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isEmailDetailOpen, setIsEmailDetailOpen] = useState(false);
  const [myEmails, setMyEmails] = useState<EmailHistory[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Company Statistics
  const [companyStats, setCompanyStats] = useState<CompanyStatistics | null>(null);
  const [myCompanyStats, setMyCompanyStats] = useState<CompanyStatistics | null>(null);
  const [isCompanyDetailOpen, setIsCompanyDetailOpen] = useState(false);
  const [myCompanies, setMyCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Calculate date range
  const getDateRange = (periodOption: PeriodOption): { start: string | null; end: string | null } => {
    if (periodOption === 'custom') {
      return {
        start: startDate || null,
        end: endDate || null,
      };
    }

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();

    switch (periodOption) {
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      case 'all':
        return { start: null, end: null };
      default:
        start.setDate(start.getDate() - 30);
    }

    start.setHours(0, 0, 0, 0);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  // Fetch email statistics
  const fetchEmailStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getDateRange(period);
      const params = {
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined,
      };

      if (user) {
        // For admin: fetch all statistics (without user_email) and my statistics (with user_email)
        // For non-admin: both calls will return the same (their own statistics)
        if (user.is_admin) {
          // Admin: Fetch all emails statistics
          const allStats = await statisticsService.getEmailStatistics(params);
          setEmailStats(allStats);

          // Admin: Fetch my emails statistics
          const myStats = await statisticsService.getEmailStatistics({
            ...params,
            user_email: user.email,
          });
          setMyEmailStats(myStats);
        } else {
          // Non-admin: Both calls return the same (their own statistics)
          // But we still call both to get consistent data structure
          const myStats = await statisticsService.getEmailStatistics(params);
          setEmailStats(myStats); // For non-admin, "all" is the same as "my"
          setMyEmailStats(myStats);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch email statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch company statistics
  const fetchCompanyStatistics = async () => {
    try {
      setError(null);

      if (user) {
        if (user.is_admin) {
          // Admin: Fetch all companies statistics
          const allStats = await statisticsService.getCompanyStatistics();
          setCompanyStats(allStats);

          // Admin: Fetch my companies statistics
          const myStats = await statisticsService.getCompanyStatistics({
            user_email: user.email,
          });
          setMyCompanyStats(myStats);
        } else {
          // Non-admin: Both calls return the same (their own statistics)
          const myStats = await statisticsService.getCompanyStatistics();
          setCompanyStats(myStats); // For non-admin, "all" is the same as "my"
          setMyCompanyStats(myStats);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch company statistics');
    }
  };

  // Fetch my emails for detail modal
  const fetchMyEmails = async () => {
    try {
      setLoadingEmails(true);
      const dateRange = getDateRange(period);
      const params: any = {
        limit: 1000,
      };

      if (dateRange.start) {
        params.start_date = dateRange.start;
      }
      if (dateRange.end) {
        params.end_date = dateRange.end;
      }

      // For non-admin, this will automatically filter to their own emails
      // For admin, we need to filter by user_id on client side
      const response = await emailHistoryService.getEmailHistory(params);
      
      // Filter to only show current user's emails
      if (user) {
        const filteredEmails = response.items.filter((email) => email.user_id === user.id);
        setMyEmails(filteredEmails);
      } else {
        setMyEmails(response.items);
      }
    } catch (err: any) {
      console.error('Failed to fetch my emails:', err);
    } finally {
      setLoadingEmails(false);
    }
  };

  // Fetch my companies for detail modal
  const fetchMyCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await companyService.getCompanies({ limit: 1000 });
      // Filter by created_by (client-side filtering)
      if (user) {
        const myCompaniesList = response.items.filter(
          (company) => company.created_by === user.id
        );
        setMyCompanies(myCompaniesList);
      }
    } catch (err: any) {
      console.error('Failed to fetch my companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmailStatistics();
      fetchCompanyStatistics();
    }
  }, [user, period, startDate, endDate]);

  const handleEmailDetailClick = () => {
    setIsEmailDetailOpen(true);
    fetchMyEmails();
  };

  const handleCompanyDetailClick = () => {
    setIsCompanyDetailOpen(true);
    fetchMyCompanies();
  };

  // Calculate percentages
  const emailPercentage = emailStats && myEmailStats && emailStats.total_count > 0
    ? ((myEmailStats.total_count / emailStats.total_count) * 100).toFixed(1)
    : '0';

  const companyPercentage = companyStats && myCompanyStats && companyStats.total_count > 0
    ? ((myCompanyStats.total_count / companyStats.total_count) * 100).toFixed(1)
    : '0';

  // Prepare chart data
  const emailChartData = emailStats
    ? [
        { name: 'My Emails', value: myEmailStats?.total_count || 0, color: '#2563eb' },
        { name: 'Others', value: (emailStats.total_count - (myEmailStats?.total_count || 0)), color: '#e5e7eb' },
      ]
    : [];

  const companyChartData = companyStats
    ? [
        { name: 'My Companies', value: myCompanyStats?.total_count || 0, color: '#10b981' },
        { name: 'Others', value: (companyStats.total_count - (myCompanyStats?.total_count || 0)), color: '#e5e7eb' },
      ]
    : [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
        }}>
          <h1 style={{
            color: 'var(--text-color)',
            fontSize: '1.875rem',
            fontWeight: '600',
            margin: 0,
            marginBottom: '0.5rem',
          }}>
            Dashboard
          </h1>
          {user && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              margin: 0,
            }}>
              Welcome back, {user.full_name || user.username}!
            </p>
          )}
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

        {/* Email History Statistics */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              📧 Email History Statistics
            </h2>
          </div>

          {/* Period Selection */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as PeriodOption);
                if (e.target.value !== 'custom') {
                  setStartDate('');
                  setEndDate('');
                }
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
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
              <option value="custom">Custom range</option>
            </select>

            {period === 'custom' && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
              </>
            )}
          </div>

          {loading ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              Loading...
            </div>
          ) : emailStats && myEmailStats ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {/* Total Emails Card */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}>
                  Total Emails Sent
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'var(--text-color)',
                  marginBottom: '0.25rem',
                }}>
                  {emailStats.total_count.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  {period === 'all' ? 'All time' : `Period: ${formatDate(getDateRange(period).start)} - ${formatDate(getDateRange(period).end)}`}
                </div>
              </div>

              {/* My Emails Card */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}>
                  My Emails Sent
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#2563eb',
                  marginBottom: '0.25rem',
                }}>
                  {myEmailStats.total_count.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}>
                  {emailPercentage}% of total
                </div>
              </div>

              {/* Donut Chart */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}>
                  My Contribution
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={emailChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {emailChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        fill: 'var(--text-color)',
                      }}
                    >
                      {emailPercentage}%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {/* View Details Button */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleEmailDetailClick}
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
              View Details →
            </button>
          </div>
        </div>

        {/* Company Statistics */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              🏢 Company Statistics
            </h2>
          </div>

          {loading ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              Loading...
            </div>
          ) : companyStats && myCompanyStats ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {/* Total Companies Card */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}>
                  Total Companies
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'var(--text-color)',
                }}>
                  {companyStats.total_count.toLocaleString()}
                </div>
              </div>

              {/* My Companies Card */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}>
                  My Companies Created
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '0.25rem',
                }}>
                  {myCompanyStats.total_count.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}>
                  {companyPercentage}% of total
                </div>
              </div>

              {/* Donut Chart */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}>
                  My Contribution
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={companyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {companyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        fill: 'var(--text-color)',
                      }}
                    >
                      {companyPercentage}%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {/* View Details Button */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleCompanyDetailClick}
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
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      <Modal
        isOpen={isEmailDetailOpen}
        onClose={() => setIsEmailDetailOpen(false)}
        title="My Email History"
        size="large"
      >
        {loadingEmails ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            Loading...
          </div>
        ) : (
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}>
              Total: {myEmails.length} emails
            </div>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--hover-bg)',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Sent At
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Recipient
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Subject
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {myEmails.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                    }}>
                      No emails found
                    </td>
                  </tr>
                ) : (
                  myEmails.map((email) => (
                    <tr
                      key={email.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
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
                        {email.recipient_email}
                      </td>
                      <td style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-color)',
                      }}>
                        {email.subject}
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
                          backgroundColor: email.status === 'sent' ? '#d1fae5' : email.status === 'failed' ? '#fee2e2' : '#fef3c7',
                          color: email.status === 'sent' ? '#065f46' : email.status === 'failed' ? '#991b1b' : '#92400e',
                        }}>
                          {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Company Detail Modal */}
      <Modal
        isOpen={isCompanyDetailOpen}
        onClose={() => setIsCompanyDetailOpen(false)}
        title="My Companies"
        size="large"
      >
        {loadingCompanies ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            Loading...
          </div>
        ) : (
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}>
              Total: {myCompanies.length} companies
            </div>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--hover-bg)',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
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
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}>
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {myCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                    }}>
                      No companies found
                    </td>
                  </tr>
                ) : (
                  myCompanies.map((company) => (
                    <tr
                      key={company.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
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
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: company.is_active ? '#d1fae5' : '#fee2e2',
                          color: company.is_active ? '#065f46' : '#991b1b',
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
