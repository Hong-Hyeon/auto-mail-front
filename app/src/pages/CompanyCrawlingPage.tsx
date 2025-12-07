/**
 * Company Crawling Page
 */

import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout/Layout';
import { AdminOnly } from '../components/AdminOnly';
import { crawlerService } from '../services/crawlerService';
import type {
  CategoryStructure,
  CrawlStatus,
  CompanyListResponse,
  CrawlJobStatus,
  CrawlResultFile,
} from '../types/crawler';

type TabType = 'health' | 'categories' | 'all-crawling' | 'results';

export const CompanyCrawlingPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('health');

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
          Company Crawling
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--border-color)',
        }}>
          <button
            onClick={() => setActiveTab('health')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'health' ? 'var(--active-bg)' : 'transparent',
              color: activeTab === 'health' ? 'var(--active-color)' : 'var(--text-color)',
              border: 'none',
              borderBottom: activeTab === 'health' ? '3px solid var(--active-color)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'health' ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            Health Check
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'categories' ? 'var(--active-bg)' : 'transparent',
              color: activeTab === 'categories' ? 'var(--active-color)' : 'var(--text-color)',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '3px solid var(--active-color)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'categories' ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('all-crawling')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'all-crawling' ? 'var(--active-bg)' : 'transparent',
              color: activeTab === 'all-crawling' ? 'var(--active-color)' : 'var(--text-color)',
              border: 'none',
              borderBottom: activeTab === 'all-crawling' ? '3px solid var(--active-color)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'all-crawling' ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            All Categories Crawling
          </button>
          <button
            onClick={() => setActiveTab('results')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'results' ? 'var(--active-bg)' : 'transparent',
              color: activeTab === 'results' ? 'var(--active-color)' : 'var(--text-color)',
              border: 'none',
              borderBottom: activeTab === 'results' ? '3px solid var(--active-color)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'results' ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            Results
          </button>
        </div>

        {/* Tab Content */}
        <AdminOnly>
          {activeTab === 'health' && <HealthCheckTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'all-crawling' && <AllCrawlingTab />}
          {activeTab === 'results' && <ResultsTab />}
        </AdminOnly>
      </div>
    </Layout>
  );
};

// Health Check Tab
const HealthCheckTab = () => {
  const [status, setStatus] = useState<CrawlStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await crawlerService.getHealth();
      setStatus(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to check health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
    }}>
      <h2 style={{
        color: 'var(--text-color)',
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
      }}>
        Crawler Service Status
      </h2>

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

      {status && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: status.status === 'success' ? '#d1fae5' : '#fee2e2',
          borderRadius: '6px',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {status.status === 'success' ? '🟢' : '🔴'}
            </span>
            <span style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: status.status === 'success' ? '#065f46' : '#991b1b',
            }}>
              {status.status === 'success' ? 'Success' : 'Error'}
            </span>
          </div>
          <div style={{
            fontSize: '0.9375rem',
            color: status.status === 'success' ? '#065f46' : '#991b1b',
            marginBottom: '0.5rem',
          }}>
            {status.message}
          </div>
          {status.data?.base_url && (
            <div style={{
              fontSize: '0.875rem',
              color: status.status === 'success' ? '#047857' : '#b91c1c',
            }}>
              Base URL: {status.data.base_url}
            </div>
          )}
        </div>
      )}

      <button
        onClick={checkHealth}
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
        {loading ? 'Checking...' : 'Check Status'}
      </button>
    </div>
  );
};

// Categories Tab
const CategoriesTab = () => {
  const [categories, setCategories] = useState<CategoryStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'simple'>('tree');

  // Single category crawling
  const [categoryUrl, setCategoryUrl] = useState('');
  const [maxCompanies, setMaxCompanies] = useState(50);
  const [extractDetails, setExtractDetails] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlResults, setCrawlResults] = useState<CompanyListResponse | null>(null);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await crawlerService.getCategories();
      setCategories(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleCrawl = async () => {
    if (!categoryUrl.trim()) {
      alert('Please enter a category URL');
      return;
    }

    try {
      setCrawling(true);
      setCrawlError(null);
      setCrawlResults(null);
      const result = await crawlerService.getCompanies({
        category_url: categoryUrl,
        max_companies: maxCompanies,
        extract_details: extractDetails,
      });
      setCrawlResults(result);
    } catch (err: any) {
      setCrawlError(err.response?.data?.detail || err.message || 'Failed to crawl companies');
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div>
      {/* Category Structure Section */}
      <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
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
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0,
          }}>
            Category Structure
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('tree')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: viewMode === 'tree' ? '#2563eb' : 'transparent',
                color: viewMode === 'tree' ? 'white' : 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('simple')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: viewMode === 'simple' ? '#2563eb' : 'transparent',
                color: viewMode === 'simple' ? 'white' : 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Simple View
            </button>
            <button
              onClick={loadCategories}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              {loading ? 'Loading...' : 'Load Categories'}
            </button>
          </div>
        </div>

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

        {categories && (
          <div>
            <div style={{
              marginBottom: '1rem',
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
            }}>
              Total: <strong style={{ color: 'var(--text-color)' }}>{categories.total}</strong> categories
            </div>

            {viewMode === 'tree' ? (
              <div>
                {Object.entries(categories.by_level).map(([level, cats]) => (
                  <div key={level} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                      marginBottom: '0.75rem',
                    }}>
                      Level {level} {level === '1' ? '(대분류)' : level === '2' ? '(중분류)' : '(소분류)'}
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}>
                      {cats.map((cat, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: 'var(--hover-bg)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                          onClick={() => setCategoryUrl(cat.url)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--border-color)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                          }}
                        >
                          <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {cat.url}
                          </div>
                          {cat.count !== undefined && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                              Items: {cat.count}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.5rem',
              }}>
                {categories.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    onClick={() => setCategoryUrl(cat.url)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                      [{cat.level}] {cat.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {cat.url}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Single Category Crawling Section */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
      }}>
        <h2 style={{
          color: 'var(--text-color)',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
        }}>
          Single Category Crawling
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}>
              Category URL
            </label>
            <input
              type="text"
              value={categoryUrl}
              onChange={(e) => setCategoryUrl(e.target.value)}
              placeholder="https://mc.daara.co.kr/category/cate2.html?bc=01&mc=14"
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

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-color)',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}>
                Max Companies (1-100)
              </label>
              <input
                type="number"
                value={maxCompanies}
                onChange={(e) => setMaxCompanies(Number(e.target.value))}
                min={1}
                max={100}
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

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '2rem',
            }}>
              <input
                type="checkbox"
                checked={extractDetails}
                onChange={(e) => setExtractDetails(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <label style={{
                color: 'var(--text-color)',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}>
                Extract Details (Email, Phone, Address)
              </label>
            </div>
          </div>

          <button
            onClick={handleSingleCrawl}
            disabled={crawling || !categoryUrl.trim()}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: (crawling || !categoryUrl.trim()) ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (crawling || !categoryUrl.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              alignSelf: 'flex-start',
            }}
          >
            {crawling ? 'Crawling...' : 'Start Crawling'}
          </button>
        </div>

        {crawlError && (
          <div style={{
            padding: '0.875rem 1rem',
            marginTop: '1.5rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}>
            {crawlError}
          </div>
        )}

        {crawlResults && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              color: 'var(--text-color)',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              Results: {crawlResults.total} companies
            </h3>
            <div style={{
              maxHeight: '500px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'var(--hover-bg)',
                    borderBottom: '2px solid var(--border-color)',
                    position: 'sticky',
                    top: 0,
                  }}>
                    <th style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Name
                    </th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Phone
                    </th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {crawlResults.companies.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{
                        padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    crawlResults.companies.map((company, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
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
                        }}>
                          {company.name || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                        }}>
                          {company.email || '-'}
                        </td>
                        <td style={{
                          padding: '0.875rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                        }}>
                          {company.phone || '-'}
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
                          {company.address || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
        </div>
      </div>
        )}
      </div>
    </div>
  );
};

// All Categories Crawling Tab
const AllCrawlingTab = () => {
  const [maxCompaniesPerCategory, setMaxCompaniesPerCategory] = useState(0);
  const [extractDetails, setExtractDetails] = useState(true);
  const [categoryLevel, setCategoryLevel] = useState(3);
  const [maxCategories, setMaxCategories] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<CrawlJobStatus[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<CrawlJobStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshIntervalRef = useRef<number | null>(null);

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const result = await crawlerService.listJobs({ limit: 50 });
      setJobs(result);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (autoRefresh && selectedJob) {
      refreshIntervalRef.current = setInterval(async () => {
        try {
          const status = await crawlerService.getJobStatus(selectedJob);
          setJobStatus(status);
          if (status.status === 'completed' || status.status === 'failed') {
            setAutoRefresh(false);
            loadJobs();
          }
        } catch (err) {
          console.error('Failed to refresh job status:', err);
        }
      }, 5000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, selectedJob]);

  const handleStartJob = async () => {
    try {
      setCreating(true);
      setError(null);
      const job = await crawlerService.crawlAllCompanies({
        max_companies_per_category: maxCompaniesPerCategory,
        extract_details: extractDetails,
        category_level: categoryLevel,
        max_categories: maxCategories,
      });
      setSelectedJob(job.job_id);
      setAutoRefresh(true);
      await loadJobs();
      const status = await crawlerService.getJobStatus(job.job_id);
      setJobStatus(status);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to start crawling job');
    } finally {
      setCreating(false);
    }
  };

  const handleViewJob = async (jobId: string) => {
    try {
      const status = await crawlerService.getJobStatus(jobId);
      setSelectedJob(jobId);
      setJobStatus(status);
      if (status.status === 'running' || status.status === 'pending') {
        setAutoRefresh(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to load job status');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await crawlerService.deleteJob(jobId);
      if (selectedJob === jobId) {
        setSelectedJob(null);
        setJobStatus(null);
        setAutoRefresh(false);
      }
      await loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete job');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { emoji: string; color: string; bg: string }> = {
      pending: { emoji: '⏸', color: '#6b7280', bg: '#f3f4f6' },
      running: { emoji: '🟡', color: '#f59e0b', bg: '#fef3c7' },
      completed: { emoji: '✅', color: '#10b981', bg: '#d1fae5' },
      failed: { emoji: '❌', color: '#ef4444', bg: '#fee2e2' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: badge.bg,
        color: badge.color,
      }}>
        <span>{badge.emoji}</span>
        <span style={{ textTransform: 'capitalize' }}>{status}</span>
      </span>
    );
  };

  return (
    <div>
      {/* Start New Job Section */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{
          color: 'var(--text-color)',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
        }}>
          Start New Crawling Job
        </h2>

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}>
              Max Companies per Category (0 = unlimited)
            </label>
            <input
              type="number"
              value={maxCompaniesPerCategory}
              onChange={(e) => setMaxCompaniesPerCategory(Number(e.target.value))}
              min={0}
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

          <div>
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
                checked={extractDetails}
                onChange={(e) => setExtractDetails(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              Extract Details (Email, Phone, Address)
            </label>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}>
              Category Level
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[1, 2, 3].map((level) => (
                <label key={level} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-color)',
                  fontSize: '0.875rem',
                }}>
                  <input
                    type="radio"
                    name="categoryLevel"
                    value={level}
                    checked={categoryLevel === level}
                    onChange={(e) => setCategoryLevel(Number(e.target.value))}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  Level {level} {level === 1 ? '(대분류)' : level === 2 ? '(중분류)' : '(소분류)'}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}>
              Max Categories (0 = all, 1-500 for testing)
            </label>
            <input
              type="number"
              value={maxCategories}
              onChange={(e) => setMaxCategories(Number(e.target.value))}
              min={0}
              max={500}
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

          <button
            onClick={handleStartJob}
            disabled={creating}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: creating ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              alignSelf: 'flex-start',
            }}
          >
            {creating ? 'Creating Job...' : 'Start Crawling Job'}
          </button>
        </div>
      </div>

      {/* Active Job Monitoring */}
      {jobStatus && (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
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
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: 0,
            }}>
              Active Job: {jobStatus.job_id}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {getStatusBadge(jobStatus.status)}
              {(jobStatus.status === 'running' || jobStatus.status === 'pending') && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--text-color)',
                }}>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  Auto Refresh
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
              }}>
                Progress
              </div>
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: 'var(--hover-bg)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  width: `${jobStatus.progress.total_categories > 0 
                    ? (jobStatus.progress.processed_categories / jobStatus.progress.total_categories) * 100 
                    : 0}%`,
                  height: '100%',
                  backgroundColor: jobStatus.status === 'failed' ? '#ef4444' : '#2563eb',
                  transition: 'width 0.3s ease',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  {jobStatus.progress.total_categories > 0
                    ? `${Math.round((jobStatus.progress.processed_categories / jobStatus.progress.total_categories) * 100)}%`
                    : '0%'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.25rem',
                }}>
                  Total Categories
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  {jobStatus.progress.total_categories}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.25rem',
                }}>
                  Processed
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  {jobStatus.progress.processed_categories}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.25rem',
                }}>
                  Companies Extracted
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  {jobStatus.progress.total_companies.toLocaleString()}
                </div>
              </div>
            </div>

            {jobStatus.progress.current_category && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.25rem',
                }}>
                  Current Category
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-color)',
                  fontWeight: '500',
                }}>
                  {jobStatus.progress.current_category}
                </div>
              </div>
            )}

            {jobStatus.error && (
              <div style={{
                padding: '0.875rem 1rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}>
                Error: {jobStatus.error}
              </div>
            )}

            {jobStatus.result && (
              <div style={{
                padding: '0.875rem 1rem',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}>
                Completed! Total: {jobStatus.result.total_companies.toLocaleString()} companies from {jobStatus.result.total_categories} categories
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleViewJob(jobStatus.job_id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setJobStatus(null);
                  setAutoRefresh(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
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
          </div>
        </div>
      )}

      {/* Job History */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            color: 'var(--text-color)',
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0,
          }}>
            Job History
          </h2>
          <button
            onClick={loadJobs}
            disabled={loadingJobs}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loadingJobs ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loadingJobs ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            {loadingJobs ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {jobs.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            No jobs found
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--hover-bg)',
                  borderBottom: '2px solid var(--border-color)',
                }}>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                  }}>
                    Job ID
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                  }}>
                    Progress
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                  }}>
                    Created
                  </th>
                  <th style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'right',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.job_id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
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
                      fontFamily: 'monospace',
                    }}>
                      {job.job_id}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {getStatusBadge(job.status)}
                    </td>
                    <td style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-color)',
                    }}>
                      {job.progress.total_categories > 0
                        ? `${Math.round((job.progress.processed_categories / job.progress.total_categories) * 100)}%`
                        : '0%'} ({job.progress.processed_categories}/{job.progress.total_categories})
                    </td>
                    <td style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}>
                      {new Date(job.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'right',
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleViewJob(job.job_id)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: 'transparent',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.job_id)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: 'transparent',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
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
        )}
      </div>
    </div>
  );
};

// Results Tab
const ResultsTab = () => {
  const [files, setFiles] = useState<CrawlResultFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await crawlerService.listResultFiles();
      setFiles(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load result files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDownload = async (filename: string) => {
    try {
      const blob = await crawlerService.downloadResultFile(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{
          color: 'var(--text-color)',
          fontSize: '1.5rem',
          fontWeight: '600',
          margin: 0,
        }}>
          Crawling Results
        </h2>
        <button
          onClick={loadFiles}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

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

      {files.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          No result files found
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--hover-bg)',
                borderBottom: '2px solid var(--border-color)',
              }}>
                <th style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  Filename
                </th>
                <th style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  Size
                </th>
                <th style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  Created
                </th>
                <th style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  Job ID
                </th>
                <th style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
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
                    fontFamily: 'monospace',
                  }}>
                    {file.filename}
                  </td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-color)',
                  }}>
                    {formatFileSize(file.size)}
                  </td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {new Date(file.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'monospace',
                  }}>
                    {file.job_id || '-'}
                  </td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'right',
                  }}>
                    <button
                      onClick={() => handleDownload(file.filename)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
