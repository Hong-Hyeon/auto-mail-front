/**
 * Profile Edit Form Component - For users to edit their own profile
 */

import { useState, useEffect } from 'react';
import type { User, UserUpdate } from '../../types/user';

interface ProfileEditFormProps {
  user: User;
  onSubmit: (userData: UserUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ProfileEditForm = ({ user, onSubmit, onCancel, loading = false }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<UserUpdate>({
    email: user.email,
    username: user.username,
    full_name: user.full_name || '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when user changes
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name || '',
      password: '',
    });
    setErrors({});
    setSubmitError(null);
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password is optional, but if provided, must be at least 8 characters
    if (formData.password && formData.password.length > 0 && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      // Prepare update data - only include fields that have changed or password if provided
      const updateData: UserUpdate = {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name?.trim() || null,
      };

      // Only include password if it's provided
      if (formData.password && formData.password.length > 0) {
        updateData.password = formData.password;
      }

      await onSubmit(updateData);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to update profile');
    }
  };

  const handleChange = (field: keyof UserUpdate, value: string) => {
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

      {/* Email */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="profile-email"
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
          id="profile-email"
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

      {/* Username */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="profile-username"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Username <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="profile-username"
          type="text"
          value={formData.username || ''}
          onChange={(e) => handleChange('username', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: `1px solid ${errors.username ? '#dc2626' : 'var(--border-color)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.username && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: '#dc2626',
          }}>
            {errors.username}
          </div>
        )}
      </div>

      {/* Full Name */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="profile-full_name"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Full Name
        </label>
        <input
          id="profile-full_name"
          type="text"
          value={formData.full_name || ''}
          onChange={(e) => handleChange('full_name', e.target.value)}
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

      {/* Password */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="profile-password"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-color)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Password
        </label>
        <input
          id="profile-password"
          type="password"
          value={formData.password || ''}
          onChange={(e) => handleChange('password', e.target.value)}
          disabled={loading}
          placeholder="Leave blank to keep current password"
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: `1px solid ${errors.password ? '#dc2626' : 'var(--border-color)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.password && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: '#dc2626',
          }}>
            {errors.password}
          </div>
        )}
        <div style={{
          marginTop: '0.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}>
          Leave blank to keep current password (min 8 characters if changing)
        </div>
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
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

