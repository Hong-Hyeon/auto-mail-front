/**
 * Calendar Component for date selection
 */

import { useState } from 'react';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  highlightedDates?: Set<string>; // Set of date strings in YYYY-MM-DD format
}

export const Calendar = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  highlightedDates = new Set(),
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Get previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  // Get next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Format date to YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  // Check if date is highlighted (has email history)
  const isHighlighted = (date: Date): boolean => {
    return highlightedDates.has(formatDateKey(date));
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
    }}>
      {/* Month Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--text-color)',
            fontSize: '1rem',
          }}
        >
          ◀
        </button>
        <h3 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--text-color)',
        }}>
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--text-color)',
            fontSize: '1rem',
          }}
        >
          ▶
        </button>
      </div>

      {/* Day Names */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        marginBottom: '0.5rem',
      }}>
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              padding: '0.5rem',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
      }}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} />;
          }

          const date = new Date(year, month, day);
          const disabled = isDateDisabled(date);
          const isSelectedDate = isSelected(date);
          const isTodayDate = isToday(date);
          const isHighlightedDate = isHighlighted(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              style={{
                aspectRatio: '1',
                padding: '0.5rem',
                border: isSelectedDate
                  ? '2px solid #2563eb'
                  : isTodayDate
                  ? '1px solid #2563eb'
                  : '1px solid var(--border-color)',
                borderRadius: '4px',
                backgroundColor: isSelectedDate
                  ? '#dbeafe'
                  : isHighlightedDate
                  ? '#fef3c7'
                  : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled
                  ? 'var(--text-secondary)'
                  : isSelectedDate
                  ? '#2563eb'
                  : 'var(--text-color)',
                fontSize: '0.875rem',
                fontWeight: isSelectedDate || isTodayDate ? '600' : '400',
                position: 'relative',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = isSelectedDate
                    ? '#dbeafe'
                    : 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = isSelectedDate
                    ? '#dbeafe'
                    : isHighlightedDate
                    ? '#fef3c7'
                    : 'transparent';
                }
              }}
            >
              {day}
              {isHighlightedDate && !isSelectedDate && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

