import React from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css'

const AuthPage = () => {
  return (
    <div>
      <h1>Bienvenido</h1>
      <p>Por favor, inicia sesión o regístrate.</p>
      <Register />
      <hr />
      <Login />
    </div>
  );
};

export default AuthPage;