require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const crypto = require('crypto');

// --- NUEVO: persistencia en disco ---
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100kb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(['/login','/register'], authLimiter);

// --- NUEVO: rate limit específico para /weather ---
const weatherLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/weather', weatherLimiter);

// ===== Persistencia de usuarios en users.json =====
const USERS_FILE = path.join(__dirname, 'users.json');
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function writeUsers(list) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
}
let users = readUsers(); // { email (enc), passwordHash, additionalData(enc-map) }

// ===== ENV =====
const { PORT=3001, JWT_SECRET, JWT_EXPIRES='1h', OPENWEATHER_API_KEY, CRYPTO_SECRET_KEY } = process.env;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET in .env');
if (!CRYPTO_SECRET_KEY) throw new Error('Missing CRYPTO_SECRET_KEY in .env (32 bytes hex)');
if (!/^[0-9a-fA-F]{64}$/.test(CRYPTO_SECRET_KEY)) {
  throw new Error('CRYPTO_SECRET_KEY debe ser hex de 32 bytes (64 chars). Genera con: openssl rand -hex 32');
}
if (!OPENWEATHER_API_KEY) {
  console.warn('Falta OPENWEATHER_API_KEY en .env (solo afectará /weather)');
}

// ===== Funciones de cifrado =====
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(CRYPTO_SECRET_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(CRYPTO_SECRET_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = auth.slice(7);
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Descifra todos los campos sensibles en el token
    req.user = { email: decrypt(decoded.email), additionalData: decoded.additionalData || {} };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPassword = (p) => typeof p === 'string' && p.length >= 6;

// ===== Rutas públicas útiles (para healthchecks y pruebas) =====
app.get('/', (_req, res) => res.json({ ok: true, name: 'api-clima', version: '1.0.0' }));
app.get('/health', (_req, res) => res.status(200).send('OK'));

app.post('/register', async (req, res) => {
  try {
    const { email, password, additionalData={} } = req.body || {};
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'Email o contraseña inválidos' });
    }
    if (users.find(u => decrypt(u.email) === email)) {
      return res.status(409).json({ error: 'Usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const encryptedEmail = encrypt(email);

    // Cifrar todos los campos adicionales si existen
    const encryptedAdditionalData = {};
    for (const key in additionalData) {
      encryptedAdditionalData[key] = encrypt(String(additionalData[key]));
    }

    users.push({ email: encryptedEmail, passwordHash, additionalData: encryptedAdditionalData });
    writeUsers(users); // NUEVO: persistir
    return res.status(201).json({ message: 'Usuario creado' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error al registrar' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u => decrypt(u.email) === email);
  if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Credenciales inválidas' });

  // Crear token con email cifrado y datos adicionales cifrados
  const tokenPayload = { email: encrypt(email), additionalData: user.additionalData };
  const token = createToken(tokenPayload);

  // Descifrar los datos antes de enviarlos al cliente
  const decryptedData = {};
  for (const key in user.additionalData) {
    decryptedData[key] = decrypt(user.additionalData[key]);
  }

  return res.json({ token, user: { email, additionalData: decryptedData } });
});

app.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// ===== NUEVO: actualizar perfil (displayName) =====
app.patch('/profile', authMiddleware, (req, res) => {
  try {
    const { displayName } = req.body || {};
    if (typeof displayName !== 'string' || displayName.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre inválido (min 2 chars)' });
    }
    const emailPlain = req.user.email;
    const idx = users.findIndex(u => decrypt(u.email) === emailPlain);
    if (idx < 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    users[idx].additionalData = users[idx].additionalData || {};
    users[idx].additionalData.displayName = encrypt(displayName.trim());
    writeUsers(users);

    res.json({ ok: true, user: { email: emailPlain, additionalData: { displayName: displayName.trim() } } });
  } catch {
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

// ===== NUEVO: eliminar cuenta =====
app.delete('/account', authMiddleware, (req, res) => {
  try {
    const emailPlain = req.user.email;
    const before = users.length;
    users = users.filter(u => decrypt(u.email) !== emailPlain);
    if (users.length === before) return res.status(404).json({ error: 'Usuario no encontrado' });
    writeUsers(users);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'No se pudo eliminar la cuenta' });
  }
});

app.get('/weather', authMiddleware, async (req, res) => {
  try {
    const city = String(req.query.q || 'Tehuacan');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
    const { data } = await axios.get(url, { timeout: 8000 });
    res.json({
      name: data?.name,
      temp: data?.main?.temp,
      desc: data?.weather?.[0]?.description
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    res.status(status).json({ error: 'Fallo al consultar clima' });
  }
});

// ===== Manejo de errores y 404 =====
app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno' });
});

// ===== Listen condicional + export para tests =====
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
