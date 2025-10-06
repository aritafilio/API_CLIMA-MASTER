// src/components/Dashboard.js
import React, { useState } from 'react';
import Weather from './Weather';
import Users from './users';
import { logoutUser } from '../firebase/auth';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('clima'); // 'clima' | 'usuarios'

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) onLogout();
    else console.error('Error al cerrar sesión:', result.error);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="user-info">
          <h2>🌤️ Clima App</h2>
          <p>Usuario: {user?.email}</p>
        </div>

        {/* Acciones a la derecha: Tabs + Logout */}
        <div className="header-actions">
          <nav className="dashboard-tabs in-header" aria-label="Tabs de Dashboard">
            <button
              className={tab === 'clima' ? 'active' : ''}
              onClick={() => setTab('clima')}
              type="button"
            >
              ☁️ Clima
            </button>
            <button
              className={tab === 'usuarios' ? 'active' : ''}
              onClick={() => setTab('usuarios')}
              type="button"
            >
              👥 Usuarios
            </button>
          </nav>

          <button onClick={handleLogout} className="btn btn-primary" type="button">
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido dinámico */}
      <main className="dashboard-main">
        {tab === 'clima' && <Weather user={user} />}
        {tab === 'usuarios' && <Users />}
      </main>
    </div>
  );
};

export default Dashboard;
