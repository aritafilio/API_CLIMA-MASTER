// src/services/usersService.js
const KEY = 'clima.usuarios';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

export function listUsers() {
  return read().sort((a,b)=> (a.name||'').localeCompare(b.name||''));
}

export function createUser({ name, email, role = 'user' }) {
  const users = read();
  const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  const user = { id, name, email, role, createdAt: Date.now() };
  write([user, ...users]);
  return user;
}

export function updateUser(id, patch) {
  const users = read();
  const i = users.findIndex(u => u.id === id);
  if (i === -1) return null;
  users[i] = { ...users[i], ...patch, updatedAt: Date.now() };
  write(users);
  return users[i];
}

export function deleteUser(id) {
  write(read().filter(u => u.id !== id));
}
