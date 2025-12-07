/**
 * Profile Page - For users to view and edit their own profile
 */

import { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Modal } from '../components/Modal/Modal';
import { ProfileEditForm } from '../components/UserForm/ProfileEditForm';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div style={{ padding: '2rem' }}>
          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            Loading user information...
          </div>
        </div>
      </Layout>
    );
  }

  const handleUpdateProfile = async (userData: any) => {
    setIsUpdating(true);
    try {
      await updateUser(userData);
      setIsEditModalOpen(false);
      alert('Profile updated successfully');
    } catch (err: any) {
      throw err; // Let the form handle the error
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
            My Profile
          </h1>
          <button
            onClick={() => setIsEditModalOpen(true)}
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
            Edit Profile
          </button>
        </div>

        {/* Profile Information */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {/* User Info */}
            <div>
              <h2 style={{
                color: 'var(--text-color)',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid var(--border-color)',
              }}>
                Personal Information
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Email
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-color)',
                    fontWeight: '500',
                  }}>
                    {user.email}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Username
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-color)',
                    fontWeight: '500',
                  }}>
                    {user.username}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Full Name
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-color)',
                    fontWeight: '500',
                  }}>
                    {user.full_name || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h2 style={{
                color: 'var(--text-color)',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid var(--border-color)',
              }}>
                Account Status
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Role
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: user.is_admin ? '#dbeafe' : '#f3f4f6',
                      color: user.is_admin ? '#1e40af' : '#6b7280',
                    }}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Status
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: user.is_active ? '#d1fae5' : '#fee2e2',
                      color: user.is_active ? '#065f46' : '#991b1b',
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Last Login
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-color)',
                    fontWeight: '500',
                  }}>
                    {formatDate(user.last_login_at)}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Member Since
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-color)',
                    fontWeight: '500',
                  }}>
                    {formatDate(user.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        title="Edit Profile"
      >
        <ProfileEditForm
          user={user}
          onSubmit={handleUpdateProfile}
          onCancel={() => {
            setIsEditModalOpen(false);
          }}
          loading={isUpdating}
        />
      </Modal>
    </Layout>
  );
};




