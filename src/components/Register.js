import React, { useState } from 'react';
import { registerUser } from '../firebase/auth';
import { createUserProfile } from '../firebase/userService';
import './Login.css';


const Register = () => {
  const [nombre, setNombre] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre) {
        alert("Por favor, introduce tu nombre.");
        return;
    }
    const result = await registerUser(email, password);
    if (result.success) {
     
      await createUserProfile(result.user.uid, nombre, email);
      alert('¡Usuario registrado con éxito!');
    } else {
      alert('Error al registrar: ' + result.error);
    }
  };

  return (
  
    <form onSubmit={handleRegister} className="login-form">
      <h3>Crear una cuenta</h3>
      {}
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre completo"
        required
      />
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
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Register;