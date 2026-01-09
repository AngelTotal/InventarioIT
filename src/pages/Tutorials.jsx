import React, { useEffect, useState } from 'react';
import { FileText, Eye, Download, Users as UsersIcon, Trash, Edit } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Tutorials = () => {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState([]);

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = () => {
    api.getTutorials().then(setTutorials).catch(console.error);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este tutorial?')) {
      await api.delete('tutorials', id);
      loadTutorials();
    }
  };

  const handleEdit = async (item) => {
    const newTitle = window.prompt('Editar título del tutorial:', item.title);
    if (newTitle) {
      await api.update('tutorials', item.id, { ...item, title: newTitle });
      loadTutorials();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Documentación y Tutoriales</h1>
        <p className="text-secondary">Base de conocimiento interna de TI.</p>
      </div>

      <div className="tutorials-grid">
        {tutorials.map((tuto) => (
          <div key={tuto.id} className="glass-panel tuto-card relative">
            {user?.role === 'admin' && (
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                <button className="action-btn" onClick={() => handleEdit(tuto)}><Edit size={14} /></button>
                <button className="action-btn delete" onClick={() => handleDelete(tuto.id)}><Trash size={14} /></button>
              </div>
            )}
            <div className="tuto-header">
              <div className="tuto-icon">
                <FileText size={28} />
              </div>
              <span className="category-badge">{tuto.category}</span>
            </div>

            <div className="tuto-body">
              <h3>{tuto.title}</h3>
              <p>{tuto.description}</p>
            </div>

            <div className="tuto-actions">
              <a
                href={tuto.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action primary"
                title="Ver Online"
              >
                <Eye size={18} />
                <span>Leer</span>
              </a>

              <a
                href={tuto.file_url}
                download
                className="btn-action secondary"
                title="Descargar Archivo"
              >
                <Download size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .tutorials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .tuto-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .tuto-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
        }

        .tuto-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .tuto-icon {
          width: 48px;
          height: 48px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .tuto-body {
          flex: 1;
        }

        .tuto-body h3 {
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .tuto-body p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tuto-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
        }

        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-action.primary {
          background: var(--accent-primary);
          color: white;
          flex: 1;
        }
        .btn-action.primary:hover {
          background: var(--accent-hover);
        }

        .btn-action.secondary {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
          width: 42px;
        }
        .btn-action.secondary:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .action-btn { background: transparent; color: var(--text-secondary); padding: 0.25rem; border-radius: 4px; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
    </div>
  );
};

export default Tutorials;
