import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserName, deleteUserAccount } from '../firebase/userService';

const Profile = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState({ nombre: '' });
    const [editNombre, setEditNombre] = useState('');

    useEffect(() => {
        if (currentUser) {
            getUserProfile(currentUser.uid).then(res => {
                if (res.success) {
                    setProfile(res.data);
                    setEditNombre(res.data.nombre);
                }
            });
          
        }
    }, [currentUser]);

    const handleUpdate = async () => {
        const res = await updateUserName(editNombre);
        if (res.success) {
            alert('Nombre actualizado.');
            setProfile(prev => ({ ...prev, nombre: editNombre }));
        } else {
            alert('Error: ' + res.error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás SEGURO de eliminar tu cuenta? Es irreversible.')) {
            const pass = prompt('Confirma tu contraseña para continuar:');
            if (pass) {
                const res = await deleteUserAccount(pass);
                if (res.success) {
                    alert('Cuenta eliminada.');
                } else {
                    alert('Error: ' + res.error);
                }
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Perfil de {profile.nombre}</h2>
            <p>Email: {currentUser.email}</p>
            
            <hr />

            <h3>Gestionar Mi Perfil</h3>
            <div>
                <input 
                    type="text" 
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)} 
                    placeholder="Tu nombre"
                />
                <button onClick={handleUpdate}>Actualizar Nombre</button>
            </div>
            <br/>
            <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>
                Eliminar Mi Cuenta
            </button>

            {}
        </div>
    );
};

export default Profile;