// src/components/userForm.js
import React, { useEffect, useState } from 'react';
import './Users.css';

export default function UserForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });

  useEffect(() => {
    setForm(initial
      ? { name: initial.name || '', email: initial.email || '', role: initial.role || 'user' }
      : { name: '', email: '', role: 'user' }
    );
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="backdrop">
      <div className="modal glass">
        <div className="modal-header">
          <h3>{initial ? 'Editar usuario' : 'Nuevo usuario'}</h3>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Nombre
            <input
              className="input"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e)=>setForm({...form, name:e.target.value})}
              required
            />
          </label>

          <label className="label">
            Correo
            <input
              className="input"
              type="email"
              placeholder="jane@correo.com"
              value={form.email}
              onChange={(e)=>setForm({...form, email:e.target.value})}
              required
            />
          </label>

          <label className="label">
            Rol
            <select
              className="input"
              value={form.role}
              onChange={(e)=>setForm({...form, role:e.target.value})}
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
