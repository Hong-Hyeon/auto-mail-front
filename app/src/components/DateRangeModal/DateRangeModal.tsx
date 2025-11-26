/**
 * Date Range Selection Modal
 */

import { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Calendar } from '../Calendar/Calendar';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null) => void;
  highlightedDates?: Set<string>;
}

export const DateRangeModal = ({
  isOpen,
  onClose,
  onApply,
  highlightedDates = new Set(),
}: DateRangeModalProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeCalendar, setActiveCalendar] = useState<'start' | 'end'>('start');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(null);
      setEndDate(null);
      setActiveCalendar('start');
    }
  }, [isOpen]);

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    // If end date is before start date, clear end date
    if (endDate && date > endDate) {
      setEndDate(null);
    }
    // Auto switch to end date selection
    setActiveCalendar('end');
  };

  const handleEndDateSelect = (date: Date) => {
    // End date must be after start date
    if (startDate && date < startDate) {
      alert('End date must be after start date');
      return;
    }
    setEndDate(date);
  };

  const handleApply = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    onApply(startDate, endDate);
    onClose();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not selected';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Date Range"
      size="large"
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* Date Selection Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center',
          }}>
            <label style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: '500',
            }}>
              Start Date
            </label>
            <button
              onClick={() => setActiveCalendar('start')}
              style={{
                padding: '0.75rem 1.5rem',
                border: `2px solid ${activeCalendar === 'start' ? '#2563eb' : 'var(--border-color)'}`,
                borderRadius: '6px',
                backgroundColor: activeCalendar === 'start' ? '#dbeafe' : 'var(--card-bg)',
                color: 'var(--text-color)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '150px',
              }}
            >
              {formatDate(startDate)}
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center',
          }}>
            <label style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: '500',
            }}>
              End Date
            </label>
            <button
              onClick={() => setActiveCalendar('end')}
              disabled={!startDate}
              style={{
                padding: '0.75rem 1.5rem',
                border: `2px solid ${activeCalendar === 'end' ? '#2563eb' : 'var(--border-color)'}`,
                borderRadius: '6px',
                backgroundColor: activeCalendar === 'end' ? '#dbeafe' : 'var(--card-bg)',
                color: !startDate ? 'var(--text-secondary)' : 'var(--text-color)',
                cursor: !startDate ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '150px',
                opacity: !startDate ? 0.6 : 1,
              }}
            >
              {formatDate(endDate)}
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Calendar
            selectedDate={activeCalendar === 'start' ? startDate : endDate}
            onDateSelect={
              activeCalendar === 'start' ? handleStartDateSelect : handleEndDateSelect
            }
            minDate={activeCalendar === 'end' && startDate ? startDate : undefined}
            highlightedDates={highlightedDates}
          />
        </div>

        {/* Info */}
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--hover-bg)',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}>
          💡 Dates with email history are highlighted in yellow
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1rem',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: (!startDate || !endDate) ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (!startDate || !endDate) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
};

