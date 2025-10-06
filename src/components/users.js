// src/components/users.js
import React, { useEffect, useState } from 'react';
import UserForm from './userForm';
import { listUsers, createUser, updateUser, deleteUser } from '../services/usersService';

const Users = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setRows(listUsers());
  useEffect(refresh, []);

  const onSubmit = (data) => {
    if (editing) updateUser(editing.id, data);
    else createUser(data);
    setOpen(false);
    refresh();
  };

  const onDelete = (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      deleteUser(id);
      refresh();
    }
  };

  return (
    <section className="users-wrap">
      {/* Encabezado */}
      <div className="users-header">
        <h2 className="users-title">Gestión de Usuarios</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setOpen(true); }}
        >
          + Nuevo
        </button>
      </div>

      {/* Tarjeta + tabla */}
      <div className="users-card">
        {rows.length === 0 ? (
          <p style={{ margin: 0, color: '#0b2a5e', opacity: .8 }}>
            No hay usuarios registrados.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => { setEditing(u); setOpen(true); }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(u.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
        initial={editing}
      />
    </section>
  );
};

export default Users;
