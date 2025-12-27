import React, { useState, useEffect } from 'react';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    // Mock events data
    setEvents([
      {
        id: 1,
        date: '2025-12-27',
        title: 'CNC Machine 1 - Scheduled Maintenance',
        type: 'maintenance',
        technician: 'John Doe',
        time: '09:00 AM'
      },
      {
        id: 2,
        date: '2025-12-29',
        title: 'CNC Machine 3 - Critical Maintenance',
        type: 'critical',
        technician: 'Sarah Smith',
        time: '10:00 AM'
      },
      {
        id: 3,
        date: '2025-12-30',
        title: 'Lathe Machine 2 - Routine Check',
        type: 'maintenance',
        technician: 'Mike Johnson',
        time: '02:00 PM'
      },
      {
        id: 4,
        date: '2026-01-02',
        title: 'Milling Machine 1 - Annual Service',
        type: 'service',
        technician: 'Emily Brown',
        time: '11:00 AM'
      },
      {
        id: 5,
        date: '2026-01-05',
        title: 'Drill Press 5 - Parts Replacement',
        type: 'maintenance',
        technician: 'David Wilson',
        time: '01:00 PM'
      },
      {
        id: 6,
        date: '2026-01-08',
        title: 'Assembly Line B - Safety Inspection',
        type: 'inspection',
        technician: 'Lisa Anderson',
        time: '03:00 PM'
      }
    ]);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const dateString = formatDateToString(date);
    return events.filter(event => event.date === dateString);
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    const dayEvents = getEventsForDate(selected);
    if (dayEvents.length > 0) {
      setShowEventModal(true);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'critical': return '#ef4444';
      case 'maintenance': return '#f59e0b';
      case 'service': return '#3b82f6';
      case 'inspection': return '#10b981';
      default: return '#6b7280';
    }
  };

  const today = new Date();
  const isToday = (day) => {
    return today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= sevenDaysLater;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="calendar-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Maintenance Calendar</h1>
          <p className="dashboard-subtitle">Schedule and track maintenance activities</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary">New Schedule</button>
        </div>
      </div>

      <div className="calendar-container">
        {/* Calendar Section */}
        <div className="calendar-main">
          <div className="dashboard-card">
            <div className="calendar-header">
              <button onClick={previousMonth} className="calendar-nav-btn">←</button>
              <h2 className="calendar-month">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="calendar-nav-btn">→</button>
            </div>

            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-name">{day}</div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="calendar-day calendar-day-empty"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayEvents = getEventsForDate(date);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isCurrentDay ? 'calendar-day-today' : ''} ${dayEvents.length > 0 ? 'calendar-day-has-events' : ''}`}
                    onClick={() => selectDate(day)}
                  >
                    <span className="calendar-day-number">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="calendar-day-events">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="calendar-event-dot"
                            style={{ backgroundColor: getEventTypeColor(event.type) }}
                            title={event.title}
                          ></div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="calendar-event-more">+{dayEvents.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="calendar-sidebar">
          <div className="dashboard-card">
            <h3 className="card-title">Upcoming This Week</h3>
            <div className="upcoming-events-list">
              {upcomingEvents.length === 0 ? (
                <p className="no-events">No upcoming events</p>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="upcoming-event-item">
                    <div
                      className="event-indicator"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    ></div>
                    <div className="event-details">
                      <div className="event-title">{event.title}</div>
                      <div className="event-meta">
                        <span>📅 {event.date}</span>
                        <span>🕐 {event.time}</span>
                      </div>
                      <div className="event-technician">👤 {event.technician}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Event Legend</h3>
            <div className="event-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Critical Maintenance</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Scheduled Maintenance</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>Service</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div>
                <span>Inspection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Events for {selectedDate.toLocaleDateString()}</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="modal-event-item">
                  <div
                    className="modal-event-indicator"
                    style={{ backgroundColor: getEventTypeColor(event.type) }}
                  ></div>
                  <div className="modal-event-details">
                    <h4>{event.title}</h4>
                    <p>🕐 {event.time}</p>
                    <p>👤 {event.technician}</p>
                    <span
                      className="event-type-badge"
                      style={{
                        backgroundColor: `${getEventTypeColor(event.type)}20`,
                        color: getEventTypeColor(event.type)
                      }}
                    >
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;