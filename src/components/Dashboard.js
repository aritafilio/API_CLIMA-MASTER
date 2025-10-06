// RUTA: src/components/Dashboard.js

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase/auth';
import Weather from './Weather';
import Profile from './Profile'; 

const Dashboard = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div>
      <div style={{ padding: '20px', background: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      
      {}
      <Profile />
      <Weather user={currentUser} />
    </div>
  );
};

export default Dashboard;