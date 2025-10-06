import React, { useState } from 'react';
import { loginUser } from '../firebase/auth'; 
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await loginUser(email, password);
    if (!result.success) {
      alert('Error al iniciar sesión: ' + result.error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h3>Iniciar Sesión</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

export default Login;