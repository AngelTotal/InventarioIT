import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Shield, Trash } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        api.getUsers().then(setUsers).catch(console.error);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            await api.delete('users', id);
            loadUsers();
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Usuarios del Sistema</h1>
                <p className="text-secondary">Gestión de roles y accesos al panel.</p>
            </div>

            <div className="users-list glass-panel">
                {users.map((u) => (
                    <div key={u.id} className="user-item">
                        <img src={u.avatar} alt={u.username} className="user-avatar" />
                        <div className="user-details">
                            <h3>{u.fullname}</h3>
                            <p className="text-secondary text-sm">@{u.username}</p>
                        </div>

                        <div className="user-actions flex items-center gap-4">
                            <div className="user-role">
                                {u.role === 'admin' && <Shield size={14} />}
                                <span>{u.role}</span>
                            </div>
                            {user?.role === 'admin' && u.username !== 'admin' && ( // Prevent deleting main admin
                                <button className="action-btn delete" onClick={() => handleDelete(u.id)}><Trash size={16} /></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .users-list { display: flex; flex-direction: column; gap: 1px; }
        .user-item {
          display: flex; align-items: center; gap: 1rem; padding: 1rem;
          background: rgba(255,255,255,0.02);
          transition: background 0.2s;
        }
        .user-item:hover { background: rgba(255,255,255,0.05); }
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; }
        .user-details { flex: 1; }
        .user-details h3 { font-size: 0.95rem; font-weight: 500; }
        .user-role {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.25rem 0.75rem; background: rgba(0,0,0,0.2);
          border-radius: 99px; font-size: 0.8rem; text-transform: capitalize;
        }
         .action-btn { background: transparent; color: var(--text-secondary); padding: 0.25rem; border-radius: 4px; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
        </div>
    );
};

export default Users;
