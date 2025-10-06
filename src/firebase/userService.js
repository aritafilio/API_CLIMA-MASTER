import { db, auth } from './config';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export const createUserProfile = async (uid, nombre, email) => {
  try {
    await setDoc(doc(db, "usuarios", uid), {
      nombre: nombre,
      email: email,
      fechaCreacion: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "usuarios", uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "No se encontró el perfil del usuario." };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserName = async (newName) => {
  const user = auth.currentUser;
  if (user) {
    try {
      await updateDoc(doc(db, "usuarios", user.uid), { nombre: newName });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: "Usuario no autenticado." };
};

export const deleteUserAccount = async (password) => {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "No hay usuario para eliminar." };

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteDoc(doc(db, "usuarios", user.uid));
    await user.delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: "La contraseña es incorrecta o ha ocurrido un error." };
  }
};