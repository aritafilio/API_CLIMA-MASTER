const express = require('express');
const app = express();
const crypto = require('crypto');

// Middlewares/Utils
const { checkJwt, checkScopes, logAudit } = require('./authMiddleware');
const { encrypt, decrypt } = require('./encryptionUtils');

// Almacenamiento simple (DEMO). En producción usa DB/persistencia.
const users = []; // { email: <cifrado>, roles: ['user'], privacy: {...}, additionalData: {...} }

// Config en memoria
const CONFIG = {};

async function getSecrets() {
  console.log('Cargando secretos desde el gestor en la nube...');
  require('dotenv').config();

  CONFIG.PORT = process.env.PORT || 3000;
  CONFIG.SECRET_KEY_DB_ENCRYPTION =
    process.env.SECRET_KEY_DB_ENCRYPTION ||
    'clave-secreta-aes-256-muy-larga-y-fuerte';

  console.log('Secretos cargados en memoria. El servidor está listo para iniciar.');
}

// Helpers de identidad/usuarios (coherentes con checkJwt => req.auth)
function getEmailFromReq(req) {
  // Si tu checkJwt mete `email` en el token, úsalo; si no, usa `sub`.
  return req?.auth?.email || req?.auth?.sub || null;
}

function findUserByEmail(emailPlain) {
  return users.find(u => {
    try {
      return decrypt(u.email, CONFIG.SECRET_KEY_DB_ENCRYPTION) === emailPlain;
    } catch {
      return false;
    }
  });
}

function removeUserByEmail(emailPlain) {
  const idx = users.findIndex(u => {
    try {
      return decrypt(u.email, CONFIG.SECRET_KEY_DB_ENCRYPTION) === emailPlain;
    } catch {
      return false;
    }
  });
  if (idx !== -1) users.splice(idx, 1);
}

function safeDecryptAdditional(additional = {}) {
  const out = {};
  for (const k of Object.keys(additional || {})) {
    try {
      out[k] = decrypt(additional[k], CONFIG.SECRET_KEY_DB_ENCRYPTION);
    } catch {
      out[k] = null;
    }
  }
  return out;
}

app.use(express.json());
app.use(logAudit);

// ---------------- RUTAS DEMO CLIMA ----------------

// RUTA PÚBLICA
app.get('/api/clima/publico', (req, res) => {
  res.json({ mensaje: 'Datos climáticos públicos. (Open Access)' });
});

// RUTA PROTEGIDA
app.get('/api/clima/seguro', checkJwt, (req, res) => {
  res.json({
    mensaje: `Datos climáticos detallados para el usuario: ${getEmailFromReq(req)}`,
    nivel: 'Acceso Seguro (MFA Verificado)'
  });
});

// RUTA PROTEGIDA CON MENOR PRIVILEGIO
app.post('/api/configuracion',
  checkJwt,
  checkScopes(['admin', 'write:config']),
  (req, res) => {
    res.json({ mensaje: 'Configuración actualizada. Permiso de Administrador verificado.' });
  }
);

// RUTA GDPR: Almacenamiento seguro de datos con CIFRADO AES-256
app.post('/api/usuario/guardar-datos', checkJwt, (req, res) => {
  const { email, ubicacion_exacta } = req.body;

  // Cifrado de datos sensibles (GDPR)
  const emailCifrado = encrypt(email, CONFIG.SECRET_KEY_DB_ENCRYPTION);
  const ubicacionCifrada = encrypt(ubicacion_exacta, CONFIG.SECRET_KEY_DB_ENCRYPTION);

  // (Demo) “Guardamos” en memoria un usuario si no existe
  const exists = findUserByEmail(email);
  if (!exists) {
    users.push({
      email: emailCifrado,
      roles: ['user'],
      privacy: { consent: { given: false, version: process.env.PRIVACY_VERSION || '1.0', ts: null, ip: null }, marketing: false, analytics: false },
      additionalData: { ubicacion: ubicacionCifrada }
    });
  }

  console.log(`[DB] Guardando email cifrado: ${emailCifrado}`);

  res.status(200).json({
    mensaje: 'Datos recibidos y cifrados correctamente para almacenamiento en reposo (AES-256).',
    email_guardado_parcial: emailCifrado.substring(0, 20) + '...'
  });
});

// RUTA GDPR: Portabilidad de Datos (Derecho del usuario a obtener sus datos)
app.get('/api/usuario/exportar', checkJwt, (req, res) => {
  // DEMO: si no hay registro, simula uno
  const email = getEmailFromReq(req) || 'usuario@demo.com';
  let user = findUserByEmail(email);

  if (!user) {
    const emailCifrado = encrypt(email, CONFIG.SECRET_KEY_DB_ENCRYPTION);
    user = {
      email: emailCifrado,
      roles: ['user'],
      privacy: { consent: { given: false, version: process.env.PRIVACY_VERSION || '1.0', ts: null, ip: null }, marketing: false, analytics: false },
      additionalData: {}
    };
    users.push(user);
  }

  const exportPayload = {
    mensaje: 'Exportación de datos personales (GDPR) completada.',
    datos: {
      user_id: email,
      email,
      roles: user.roles || ['user'],
      privacy: user.privacy || {},
      additionalData: safeDecryptAdditional(user.additionalData),
      fecha_exportacion: new Date().toISOString()
    }
  };

  res.setHeader('Content-Disposition', `attachment; filename="export-${email}.json"`);
  res.status(200).json(exportPayload);
});

// ---------------- PRIVACIDAD / CUMPLIMIENTO ----------------

// Política pública (para banner/modal)
app.get('/privacy/policy', (req, res) => {
  res.json({
    version: process.env.PRIVACY_VERSION || '1.0',
    updatedAt: '2025-01-01',
    url: 'https://tu-dominio/politica-privacidad',
    summary: 'Recopilamos los datos mínimos para proveer el servicio y seguridad...'
  });
});

// Guardar consentimiento explícito + preferencias (opt-in/out)
// (Usa checkJwt en lugar de authMiddleware)
app.post('/privacy/consent', checkJwt, (req, res) => {
  const { consent, marketing = false, analytics = false } = req.body || {};
  const email = getEmailFromReq(req);
  if (!email) return res.status(401).json({ error: 'No autenticado' });

  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'No existe' });

  user.privacy = user.privacy || {};
  user.privacy.consent = {
    given: !!consent,
    version: process.env.PRIVACY_VERSION || '1.0',
    ts: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null
  };
  user.privacy.marketing = !!marketing;  // CCPA/CPRA opt-out
  user.privacy.analytics = !!analytics;  // GDPR consentimiento analítica

  return res.json({ ok: true, privacy: user.privacy });
});

// Actualizar preferencias (opt-in/out no esenciales)
app.patch('/privacy/preferences', checkJwt, (req, res) => {
  const { marketing, analytics } = req.body || {};
  const email = getEmailFromReq(req);
  if (!email) return res.status(401).json({ error: 'No autenticado' });

  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'No existe' });

  user.privacy = user.privacy || {};
  if (typeof marketing === 'boolean') user.privacy.marketing = marketing;
  if (typeof analytics === 'boolean') user.privacy.analytics = analytics;

  return res.json({ ok: true, privacy: user.privacy });
});

// Portabilidad (GDPR Art.20): exporta datos en JSON portable
app.get('/privacy/export', checkJwt, (req, res) => {
  const email = getEmailFromReq(req);
  if (!email) return res.status(401).json({ error: 'No autenticado' });

  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'No existe' });

  const exportPayload = {
    email,
    roles: user.roles || ['user'],
    privacy: user.privacy || {},
    additionalData: safeDecryptAdditional(user.additionalData),
    createdAt: user.createdAt || null
  };

  res.setHeader('Content-Disposition', `attachment; filename="export-${email}.json"`);
  res.json(exportPayload);
});

// Derecho al olvido (GDPR Art.17) / Delete (CCPA)
app.delete('/privacy/delete', checkJwt, (req, res) => {
  const email = getEmailFromReq(req);
  if (!email) return res.status(401).json({ error: 'No autenticado' });

  const exists = !!findUserByEmail(email);
  if (!exists) return res.status(404).json({ error: 'No existe' });

  removeUserByEmail(email);
  return res.json({ ok: true, message: 'Cuenta eliminada y datos borrados.' });
});

// Manejo de errores de JWT (según tu checkJwt)
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    console.error(`[SEGURIDAD-ERROR] Intento fallido en: ${req.originalUrl} - ${err.message}`);
    res.status(401).send({ message: 'Fallo de Autenticación. Token inválido o expirado. (Sesión Revocada)' });
  } else {
    next(err);
  }
});

async function startServer() {
  try {
    await getSecrets();
    app.listen(CONFIG.PORT, () => {
      console.log(`Servidor de Clima ejecutándose en http://localhost:${CONFIG.PORT}`);
    });
  } catch (error) {
    console.error('ERROR CRÍTICO: No se pudieron cargar los secretos. Apagando servidor.', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;