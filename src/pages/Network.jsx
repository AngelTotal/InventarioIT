import React, { useEffect, useState } from 'react';
import { Network as NetworkIcon, Server, Wifi, Trash, Edit } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Network = () => {
    const { user } = useAuth();
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        loadNetwork();
    }, []);

    const loadNetwork = () => {
        api.getNetwork().then(setDevices).catch(console.error);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este dispositivo de red?')) {
            await api.delete('network', id);
            loadNetwork();
        }
    };

    const handleEdit = async (item) => {
        const newName = window.prompt('Editar nombre del dispositivo:', item.name);
        if (newName) {
            await api.update('network', item.id, { ...item, name: newName });
            loadNetwork();
        }
    };


    const getIcon = (type) => {
        if (type === 'Server') return <Server size={20} />;
        if (type === 'AP' || type === 'Router') return <Wifi size={20} />;
        return <NetworkIcon size={20} />;
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Red e Infraestructura</h1>
                <p className="text-secondary">Mapa de dispositivos de red y servidores.</p>
            </div>

            <div className="network-grid">
                {devices.map((device) => (
                    <div key={device.id} className="glass-panel device-card relative">
                        {user?.role === 'admin' && (
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button className="action-btn" onClick={() => handleEdit(device)}><Edit size={14} /></button>
                                <button className="action-btn delete" onClick={() => handleDelete(device.id)}><Trash size={14} /></button>
                            </div>
                        )}
                        <div className="device-icon" data-type={device.type}>
                            {getIcon(device.type)}
                        </div>
                        <div className="device-info">
                            <h3>{device.name}</h3>
                            <p className="ip font-mono">{device.ip_address}</p>
                            <div className="device-meta">
                                <span className="badge">{device.type}</span>
                                <span className={`status-dot ${device.status === 'Online' ? 'online' : 'offline'}`}></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .network-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .device-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .device-icon {
          width: 50px; height: 50px; background: rgba(255,255,255,0.05);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          color: var(--accent-primary);
        }
        .device-info h3 { font-size: 1rem; margin-bottom: 0.25rem; }
        .ip { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .device-meta { display: flex; align-items: center; justify-content: space-between; }
        .badge { font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: var(--success); box-shadow: 0 0 8px var(--success); }
        .status-dot.offline { background: var(--danger); }
        .action-btn { background: transparent; color: var(--text-secondary); padding: 0.25rem; border-radius: 4px; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
        </div>
    );
};

export default Network;
