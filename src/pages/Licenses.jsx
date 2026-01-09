import React, { useEffect, useState } from 'react';
import { Key, Shield, AlertCircle, Trash, Edit } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Licenses = () => {
    const { user } = useAuth();
    const [licenses, setLicenses] = useState([]);

    useEffect(() => {
        loadLicenses();
    }, []);

    const loadLicenses = () => {
        api.getLicenses().then(setLicenses).catch(console.error);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta licencia/credencial?')) {
            await api.delete('licenses', id);
            loadLicenses();
        }
    };

    const handleEdit = async (item) => {
        const newName = window.prompt('Editar nombre:', item.name);
        if (newName) {
            await api.update('licenses', item.id, { ...item, name: newName });
            loadLicenses();
        }
    };


    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Licencias y Credenciales</h1>
                <p className="text-secondary">Gestión de software, claves y accesos.</p>
            </div>

            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Proveedor</th>
                            <th>Expiración</th>
                            <th>Detalles</th>
                            <th>Estado</th>
                            {user?.role === 'admin' && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.map((lic) => (
                            <tr key={lic.id}>
                                <td className="font-medium flex items-center gap-2">
                                    {lic.type === 'Licencia' ? <Shield size={16} className="text-success" /> : <Key size={16} className="text-warning" />}
                                    {lic.name}
                                </td>
                                <td>{lic.type}</td>
                                <td>{lic.vendor}</td>
                                <td className="font-mono">{lic.expiration_date || 'N/A'}</td>
                                <td className="text-sm text-secondary">{lic.details}</td>
                                <td>
                                    <span className="status-badge success">Activo</span>
                                </td>
                                {user?.role === 'admin' && (
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="action-btn" onClick={() => handleEdit(lic)}><Edit size={16} /></button>
                                            <button className="action-btn delete" onClick={() => handleDelete(lic.id)}><Trash size={16} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`
        .action-btn { background: transparent; color: var(--text-secondary); padding: 0.25rem; border-radius: 4px; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
        </div>
    );
};

export default Licenses;
