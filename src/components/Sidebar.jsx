import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Box,
    Monitor,
    Key,
    Network,
    BookOpen,
    Users,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/inventory', label: 'Inventario', icon: Box },
        { path: '/assigned', label: 'En Uso', icon: Monitor },
        { path: '/licenses', label: 'Licencias', icon: Key },
        { path: '/network', label: 'Red & Infra', icon: Network },
        { path: '/tutorials', label: 'Tutoriales', icon: BookOpen },
        { path: '/users', label: 'Usuarios', icon: Users },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="logo-container">
                <div className="logo-icon">IT</div>
                <span className="logo-text">TechControl</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={logout}>
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>

            <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          z-index: 50;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          padding: 0 0.75rem;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--accent-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.5px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: var(--text-secondary);
          transition: all 0.2s;
          font-weight: 500;
          text-decoration: none;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 4px 6px -1px var(--accent-glow);
        }

        .sidebar-footer {
          margin-top: auto;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .logout-btn {
          width: 100%;
          background: transparent;
          text-align: left;
        }
        .logout-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
        </aside>
    );
};

export default Sidebar;
