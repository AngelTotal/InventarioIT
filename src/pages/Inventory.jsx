import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'Computadoras', label: 'Computadoras' },
    { id: 'Componentes', label: 'Componentes' },
    { id: 'Periféricos', label: 'Periféricos' },
    { id: 'Redes', label: 'Redes' },
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await api.getInventory();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter(item => item.category === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponible': return 'var(--success)';
      case 'En Uso': return 'var(--accent-primary)';
      case 'Mantenimiento': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este activo?')) {
      try {
        await api.delete('inventory', id);
        loadInventory();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar');
      }
    }
  };

  const handleEdit = async (item) => {
    const newName = window.prompt('Editar nombre del activo:', item.name);
    if (newName && newName !== item.name) {
      try {
        await api.update('inventory', item.id, { ...item, name: newName });
        loadInventory();
      } catch (error) {
        console.error(error);
        alert('Error al actualizar');
      }
    }
  };

  return (
    <div className="inventory-page animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Inventario General</h1>
          <p className="text-secondary">Gestión centralizada de activos de hardware.</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary">
            <Plus size={20} />
            <span>Agregar Activo</span>
          </button>
        )}
      </div>

      <div className="controls-bar glass-panel">
        <div className="tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar..." />
          </div>
          <button className="btn-icon">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading ? (
          <div className="p-8 text-center text-secondary">Cargando inventario...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>No. Serie</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-sm text-secondary">{item.code}</td>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.brand}</td>
                  <td className="font-mono text-sm">{item.serial}</td>
                  <td>
                    <span className="status-badge" style={{ borderColor: getStatusColor(item.status), color: getStatusColor(item.status) }}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    {user?.role === 'admin' ? (
                      <div className="actions-cell">
                        <button className="action-btn" title="Editar" onClick={() => handleEdit(item)}><Edit size={16} /></button>
                        <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(item.id)}><Trash size={16} /></button>
                      </div>
                    ) : (
                      <span className="text-sm text-secondary">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-secondary">No se encontraron activos.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Same styles as before */}
      <style>{`
        .controls-bar { padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .tabs { display: flex; gap: 0.5rem; }
        .tab-btn { background: transparent; color: var(--text-secondary); padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid transparent; }
        .tab-btn:hover { background: rgba(255, 255, 255, 0.05); color: var(--text-primary); }
        .tab-btn.active { background: rgba(59, 130, 246, 0.1); color: var(--accent-primary); border-color: rgba(59, 130, 246, 0.2); }
        .filters { display: flex; gap: 1rem; }
        .search-box { position: relative; }
        .search-box input { background: var(--bg-dark); border: 1px solid var(--border-color); padding: 0.5rem 1rem 0.5rem 2.2rem; border-radius: 6px; color: white; width: 200px; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
        .btn-icon { background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 6px; color: var(--text-secondary); }
        .table-container { overflow-x: auto; padding: 0; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid var(--border-color); }
        .data-table th { background: rgba(0, 0, 0, 0.2); font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; white-space: nowrap; }
        .data-table tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
        .data-table tbody tr:last-child td { border: none; }
        .font-mono { font-family: monospace; }
        .font-medium { font-weight: 500; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; border: 1px solid; background: rgba(0,0,0,0.1); }
        .actions-cell { display: flex; gap: 0.5rem; }
        .action-btn { background: transparent; color: var(--text-secondary); padding: 0.25rem; border-radius: 4px; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
    </div>
  );
};

export default Inventory;
