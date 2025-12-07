import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { parseISO, isSameDay } from 'date-fns';

// Custom styles override for the calendar to match dark theme
const calendarStyles = `
  .react-calendar {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: none;
    border-radius: var(--radius-md);
    width: 100%;
    font-family: inherit;
  }
  .react-calendar__navigation button {
    color: var(--text-primary);
    min-width: 44px;
    background: none;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: var(--bg-tertiary);
  }
  .react-calendar__month-view__days__day {
    color: var(--text-primary);
  }
  .react-calendar__month-view__days__day--weekend {
    color: var(--text-secondary);
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: var(--bg-tertiary);
  }
  .react-calendar__tile--now {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  .react-calendar__tile--active {
    background: var(--accent-primary) !important;
    color: white !important;
  }
  .highlight-workout {
    position: relative;
  }
  .highlight-workout::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: var(--success);
    border-radius: 50%;
  }
`;

const AttendanceCalendar = ({ workouts = [] }) => {
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasWorkout = workouts.some(w => isSameDay(parseISO(w.date), date));
            if (hasWorkout) {
                return 'highlight-workout';
            }
        }
        return null;
    };

    return (
        <div className="card h-full flex flex-col items-center justify-center p-0 overflow-hidden">
            <style>{calendarStyles}</style>
            <div className="p-4 w-full">
                <h3 className="text-lg font-semibold mb-4 text-center">Attendance</h3>
                <Calendar
                    tileClassName={tileClassName}
                    className="mx-auto"
                />
            </div>
        </div>
    );
};

export default AttendanceCalendar;
