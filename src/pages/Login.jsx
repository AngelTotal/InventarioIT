import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(username, password)) {
            navigate('/');
        } else {
            setError('Credenciales inválidas. Intente con admin / admin');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <div className="icon-wrapper">
                        <ShieldCheck size={40} className="text-accent" />
                    </div>
                    <h1>Bienvenido</h1>
                    <p className="subtitle">Sistema de Control TI - Enterprise</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Usuario</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Ingrese su usuario..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn-primary btn-block">
                        Ingresar al Sistema
                    </button>
                </form>

                <div className="login-footer">
                    <p>¿Olvidó su contraseña? <a href="#">Contacte a Soporte</a></p>
                </div>
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%);
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: var(--accent-primary);
          filter: blur(150px);
          opacity: 0.1;
          border-radius: 50%;
          top: -100px;
          right: -100px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem 2rem;
          position: relative;
          z-index: 10;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--accent-primary);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .subtitle {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: var(--accent-primary);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .btn-block {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
          font-size: 1rem;
          padding: 0.875rem;
        }

        .error-message {
          color: var(--danger);
          font-size: 0.875rem;
          text-align: center;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 6px;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .login-footer a {
          color: var(--accent-primary);
          font-weight: 500;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
};

export default Login;
