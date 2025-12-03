/**
 * Email Template Page
 */

import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Modal } from '../components/Modal/Modal';
import { AdminOnly } from '../components/AdminOnly';
import { emailTemplateService } from '../services/emailTemplateService';
import type { EmailTemplate, EmailTemplateCreate, EmailTemplateUpdate } from '../types/emailTemplate';
import { TemplateForm } from '../components/TemplateForm/TemplateForm';
import { TemplatePreview } from '../components/TemplatePreview/TemplatePreview';

type StatusFilter = 'all' | 'active' | 'inactive';

export const EmailTemplatePage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch templates
  const fetchTemplates = async () => {
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

      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await emailTemplateService.getTemplates(params);
      setTemplates(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTemplates();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle create
  const handleCreate = () => {
    setEditingTemplate(null);
    setIsCreateModalOpen(true);
  };

  // Handle edit
  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditModalOpen(true);
  };

  // Handle preview
  const handlePreview = async (template: EmailTemplate) => {
    try {
      const fullTemplate = await emailTemplateService.getTemplateById(template.id);
      setPreviewTemplate(fullTemplate);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to load template');
    }
  };

  // Handle delete
  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}" template?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await emailTemplateService.deleteTemplate(template.id);
      await fetchTemplates();
      alert('Template deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete template');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      await emailTemplateService.updateTemplate(template.id, { is_active: !template.is_active });
      await fetchTemplates();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to update template status');
    }
  };

  // Handle save
  const handleSave = async (data: EmailTemplateCreate | EmailTemplateUpdate) => {
    try {
      setIsSaving(true);
      if (editingTemplate) {
        await emailTemplateService.updateTemplate(editingTemplate.id, data as EmailTemplateUpdate);
        alert('Template updated successfully');
      } else {
        await emailTemplateService.createTemplate(data as EmailTemplateCreate);
        alert('Template created successfully');
      }
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save template';
      if (typeof errorMessage === 'string') {
        alert(errorMessage);
      } else {
        alert(JSON.stringify(errorMessage));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            color: 'var(--text-color)',
            fontSize: '1.875rem',
            fontWeight: '600',
            margin: 0,
          }}>
            Email Template
          </h1>
          <AdminOnly>
            <button
              onClick={handleCreate}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              Add Template
            </button>
          </AdminOnly>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              maxWidth: '400px',
              padding: '0.625rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
            }}
          />
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
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)',
          }}>
            Loading templates...
          </div>
        )}

        {/* Templates table */}
        {!loading && (
          <>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
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
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Name
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Subject
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Description
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Created At
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-color)',
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}>
                        No templates found
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <tr
                        key={template.id}
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
                          padding: '1rem',
                          fontSize: '0.9375rem',
                          color: 'var(--text-color)',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleEdit(template)}
                        >
                          {template.name}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-color)',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {template.subject}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {template.description || '-'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleToggleActive(template)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: template.is_active ? '#d1fae5' : '#fee2e2',
                              color: template.is_active ? '#065f46' : '#991b1b',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                          >
                            {template.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {new Date(template.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'right',
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'flex-end',
                          }}>
                            <button
                              onClick={() => handlePreview(template)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#6b7280',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Preview
                            </button>
                            <AdminOnly>
                              <button
                                onClick={() => handleEdit(template)}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  backgroundColor: 'transparent',
                                  color: '#2563eb',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(template)}
                                disabled={!template.is_active}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  backgroundColor: template.is_active ? '#dc2626' : '#9ca3af',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: template.is_active ? 'pointer' : 'not-allowed',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  opacity: template.is_active ? 1 : 0.6,
                                }}
                                onMouseEnter={(e) => {
                                  if (template.is_active) {
                                    e.currentTarget.style.opacity = '0.8';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (template.is_active) {
                                    e.currentTarget.style.opacity = '1';
                                  }
                                }}
                              >
                                Inactive
                              </button>
                            </AdminOnly>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2rem',
              }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === 1 ? 'var(--hover-bg)' : 'var(--card-bg)',
                    color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: currentPage === page ? '#2563eb' : 'var(--card-bg)',
                      color: currentPage === page ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: currentPage === page ? '600' : '400',
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === totalPages ? 'var(--hover-bg)' : 'var(--card-bg)',
                    color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingTemplate(null);
          }}
          title="Create Email Template"
          size="large"
        >
          <TemplateForm
            template={null}
            onSave={handleSave}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setEditingTemplate(null);
            }}
            isSaving={isSaving}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTemplate(null);
          }}
          title="Edit Email Template"
          size="large"
        >
          {editingTemplate && (
            <TemplateForm
              template={editingTemplate}
              onSave={handleSave}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingTemplate(null);
              }}
              isSaving={isSaving}
            />
          )}
        </Modal>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewTemplate(null);
          }}
          title="Template Preview"
          size="large"
        >
          {previewTemplate && (
            <TemplatePreview template={previewTemplate} />
          )}
        </Modal>
      </div>
    </Layout>
  );
};
