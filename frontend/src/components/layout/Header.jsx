import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const { isOnline } = useOffline();

  return (
    <header className="header">
      <div className="header-title">Gear-Guard</div>
      <div className="header-actions">
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <NotificationPanel />
        <div className="user-profile">
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;