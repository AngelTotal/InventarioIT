import React, { useEffect, useState } from 'react';
import { User, Monitor, Calendar, Trash, Edit } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Assigned = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = () => {
        api.getAssignments().then(setAssignments).catch(console.error);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Liberar esta asignación?')) {
            await api.delete('assignments', id);
            loadAssignments();
        }
    };

    const handleEdit = async (item) => {
        const newAssignee = window.prompt('Editar asignado a:', item.assigned_to);
        if (newAssignee) {
            await api.update('assignments', item.id, { ...item, assigned_to: newAssignee });
            loadAssignments();
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Equipos En Uso</h1>
                <p className="text-secondary">Registro de asignaciones de hardware a personal.</p>
            </div>

            <div className="grid-container">
                {assignments.map((assign) => (
                    <div key={assign.id} className="card glass-panel assignment-card">
                        <div className="card-header">
                            <div className="user-avatar text-xl font-bold bg-accent text-white">
                                {assign.assigned_to.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium">{assign.assigned_to}</h3>
                                <p className="text-sm text-secondary">{assign.department}</p>
                            </div>
                            {user?.role === 'admin' && (
                                <div className="flex gap-2">
                                    <button className="action-btn" onClick={() => handleEdit(assign)}><Edit size={16} /></button>
                                    <button className="action-btn delete" onClick={() => handleDelete(assign.id)}><Trash size={16} /></button>
                                </div>
                            )}
                        </div>

                        <div className="card-body">
                            <div className="info-row">
                                <Monitor size={16} className="text-accent" />
                                <span>{assign.item_name} <span className="text-secondary text-sm">({assign.item_code})</span></span>
                            </div>
                            <div className="info-row">
                                <Calendar size={16} className="text-secondary" />
                                <span className="text-sm">Asignado: {assign.date_assigned}</span>
                            </div>
                            {assign.notes && (
                                <div className="notes mt-2 text-sm text-secondary bg-dark p-2 rounded">
                                    "{assign.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {assignments.length === 0 && <p>No hay asignaciones registradas.</p>}
            </div>

            <style>{`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .assignment-card {
          border-left: 4px solid var(--accent-primary);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .user-avatar {
          width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: var(--accent-primary);
        }
        .info-row {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;
        }
        .bg-dark { background: rgba(0,0,0,0.2); }
        .action-btn { background: transparent; color: var(--text-secondary); padding: 0.25rem; border-radius: 4px; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
        </div>
    );
};

export default Assigned;
