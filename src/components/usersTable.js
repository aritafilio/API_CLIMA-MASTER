import React, { useEffect, useState } from 'react';
import UserForm from '../components/userFormserForm';
import { listUsers, createUser, updateUser, deleteUser } from '../services/users';

export default function UsersTab() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setRows(listUsers());
  useEffect(refresh, []);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit   = (u) => { setEditing(u);   setOpen(true); };
  const onClose    = () => setOpen(false);

  const onSubmit = (data) => {
    if (editing) updateUser(editing.id, data);
    else createUser(data);
    setOpen(false);
    refresh();
  };

  const onDelete = (id) => {
    if (confirm('¿Eliminar usuario?')) {
      deleteUser(id);
      refresh();
    }
  };

  return (
    <div style={{maxWidth:900, margin:'20px auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <h3>Usuarios</h3>
        <button onClick={openCreate}>+ Nuevo usuario</button>
      </div>

      {rows.length === 0 ? (
        <p style={{opacity:.7}}>No hay usuarios. Crea el primero con “+ Nuevo usuario”.</p>
      ) : (
        <div style={{overflow:'auto', borderRadius:12, background:'#fff'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead style={{background:'#f3f4f6'}}>
              <tr>
                <th style={th}>Nombre</th>
                <th style={th}>Correo</th>
                <th style={th}>Rol</th>
                <th style={{...th, width:170}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(u=>(
                <tr key={u.id} style={{borderTop:'1px solid #eee'}}>
                  <td style={td}>{u.name}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.role}</td>
                  <td style={{...td, textAlign:'center'}}>
                    <button onClick={()=>openEdit(u)} style={{marginRight:6}}>Editar</button>
                    <button onClick={()=>onDelete(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserForm open={open} onClose={onClose} onSubmit={onSubmit} initial={editing}/>
    </div>
  );
}

const th = { textAlign:'left', padding:'10px 12px', fontWeight:600, fontSize:14, color:'#374151' };
const td = { padding:'10px 12px', fontSize:14, color:'#111827' };
