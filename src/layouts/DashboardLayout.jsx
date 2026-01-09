import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Search, Bell } from 'lucide-react';

const DashboardLayout = () => {
    const { user } = useAuth();

    return (
        <div className="layout">
            <Sidebar />

            <main className="main-content">
                <header className="topbar glass-panel">
                    <div className="search-bar">
                        <Search size={18} className="text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar por serie, usuario o IP..."
                            className="search-input"
                        />
                    </div>

                    <div className="user-actions">
                        <button className="icon-btn">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>

                        <div className="user-profile">
                            <img src={user?.avatar} alt={user?.name} className="avatar" />
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>

            <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .topbar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 40;
          border-bottom: 1px solid var(--border-color);
          border-left: none;
          background: rgba(15, 23, 42, 0.8); /* Slightly more opaque for readability */
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          width: 400px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .search-bar:focus-within {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .search-input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          font-size: 0.9rem;
        }
        .search-input:focus { outline: none; }

        .user-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          background: transparent;
          color: var(--text-secondary);
          position: relative;
          padding: 0.5rem;
          border-radius: 50%;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid var(--bg-card);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--border-color);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--accent-primary);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .content-area {
          padding: 2rem;
          flex: 1;
        }
      `}</style>
        </div>
    );
};

export default DashboardLayout;
