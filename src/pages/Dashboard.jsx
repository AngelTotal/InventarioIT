import React, { useEffect, useState } from 'react';
import { Box, Monitor, AlertTriangle, Users } from 'lucide-react';
import { api } from '../services/api';

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getStats();
        setStatsData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Cargando dashboard...</div>;

  const stats = [
    { label: 'Total Activos', value: statsData?.active_assets || 0, icon: Box, color: '#3b82f6', trend: 'Actualizado hoy' },
    { label: 'Equipos Asignados', value: statsData?.assigned_items || 0, icon: Monitor, color: '#10b981', trend: 'En uso activo' },
    { label: 'Licencias por Vencer', value: statsData?.licenses_expiring || 0, icon: AlertTriangle, color: '#f59e0b', trend: 'Próximos 30 días' },
    { label: 'Usuarios TI', value: statsData?.it_users || 0, icon: Users, color: '#8b5cf6', trend: 'Total usuarios' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="page-header">
        <h1>Dashboard General</h1>
        <p className="text-secondary">Visión general del estado del inventario y sistemas.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card glass-panel" style={{ '--accent-color': stat.color }}>
            <div className="stat-header">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <span className="stat-value">{stat.value}</span>
            </div>
            <span className="stat-label">{stat.label}</span>
            <div className="stat-footer">
              <span className="stat-trend">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="section-card glass-panel" style={{ gridColumn: 'span 2' }}>
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            {statsData?.recent_activity?.length > 0 ? (
              statsData.recent_activity.map((act, i) => (
                <div key={i} className="activity-item">
                  <div className="dot"></div>
                  <div>
                    <p className="activity-text">
                      Asignado <strong>{act.item_name}</strong> a <em>{act.assigned_to}</em>
                    </p>
                    <span className="activity-time">{act.date_assigned}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary">No hay actividad reciente.</p>
            )}
          </div>
        </div>

        <div className="section-card glass-panel">
          <h2>Estado del Sistema</h2>
          <div className="system-status">
            <div className="status-item">
              <span>Base de Datos</span>
              <span className="status-badge success">Online</span>
            </div>
            <div className="status-item">
              <span>API Gateway</span>
              <span className="status-badge success">Online</span>
            </div>
            <div className="status-item">
              <span>Backups</span>
              <span className="status-badge warning">Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card::after {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--accent-color);
        }

        .stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 2rem; font-weight: 700; }
        .stat-label { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }
        .stat-trend { font-size: 0.8rem; opacity: 0.7; }

        .dashboard-content { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }

        .section-card { padding: 1.5rem; }
        .section-card h2 { font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }

        .activity-item { display: flex; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .activity-item:last-child { border: none; }
        .dot { width: 10px; height: 10px; background: var(--accent-primary); border-radius: 50%; margin-top: 6px; }
        .activity-text { font-size: 0.95rem; }
        .activity-time { font-size: 0.8rem; color: var(--text-secondary); }

        .system-status { display: flex; flex-direction: column; gap: 1rem; }
        .status-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.success { background: rgba(16, 185, 129, 0.2); color: var(--success); }
        .status-badge.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
      `}</style>
    </div>
  );
};

export default Dashboard;
