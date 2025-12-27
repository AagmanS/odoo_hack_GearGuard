import React, { useState, useEffect, useRef } from 'react';

const NotificationPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const panelRef = useRef(null);

    useEffect(() => {
        // Mock notifications data
        setNotifications([
            {
                id: 1,
                type: 'warning',
                title: 'Maintenance Due',
                message: 'CNC Machine 3 requires scheduled maintenance in 2 days',
                time: '2 hours ago',
                read: false
            },
            {
                id: 2,
                type: 'success',
                title: 'Request Completed',
                message: 'Hydraulic Press repair has been completed successfully',
                time: '5 hours ago',
                read: false
            },
            {
                id: 3,
                type: 'info',
                title: 'New Equipment Added',
                message: 'Assembly Line B has been added to the inventory',
                time: '1 day ago',
                read: true
            },
            {
                id: 4,
                type: 'error',
                title: 'Critical Alert',
                message: 'Conveyor Belt 2 has exceeded downtime threshold',
                time: '2 days ago',
                read: true
            },
            {
                id: 5,
                type: 'info',
                title: 'Safety Protocol Update',
                message: 'New safety guidelines have been published',
                time: '3 days ago',
                read: true
            }
        ]);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIconForType = (type) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'success': return '✅';
            case 'error': return '🚨';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    return (
        <div className="notification-container" ref={panelRef}>
            <button
                className="notification-trigger btn btn-primary"
                onClick={() => setIsOpen(!isOpen)}
            >
                Notifications
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="notification-actions">
                            <button
                                onClick={markAllAsRead}
                                className="notification-action-btn"
                            >
                                Mark all read
                            </button>
                            <button
                                onClick={clearAll}
                                className="notification-action-btn"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="notification-icon">
                                        {getIconForType(notif.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notif.title}</div>
                                        <div className="notification-message">{notif.message}</div>
                                        <div className="notification-time">{notif.time}</div>
                                    </div>
                                    {!notif.read && <div className="notification-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
