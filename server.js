require('dotenv').config(); 
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Importa los middlewares de seguridad que acabas de crear
const { checkJwt, checkScopes, logAudit } = require('./authMiddleware'); 


// MIDDLEWARES GLOBALES
app.use(express.json()); 
app.use(logAudit); // Aplica el log de auditoría a todas las solicitudes (Zero-Trust/Monitoreo)

// --------------------------------------------------------------------------
// RUTAS DE LA API
// --------------------------------------------------------------------------

// 1. RUTA PÚBLICA (No necesita autenticación)
app.get('/api/clima/publico', (req, res) => {
  res.json({ mensaje: "Datos climáticos públicos. (Open Access)" });
});


// 2. RUTA PROTEGIDA (ZERO-TRUST: Requiere token válido)
app.get('/api/clima/seguro', checkJwt, (req, res) => {
  // Si llega aquí, el token es válido. req.auth contiene los datos del usuario.
  res.json({ 
    mensaje: `Datos climáticos detallados para el usuario: ${req.auth.sub}`,
    nivel: "Acceso Seguro (MFA Verificado)"
  });
});


// 3. RUTA PROTEGIDA CON MENOR PRIVILEGIO (Requiere rol 'admin')
app.post('/api/configuracion', checkJwt, checkScopes(['admin', 'write:config']), (req, res) => {
  // Solo se ejecuta si el token es válido Y tiene los permisos 'admin' O 'write:config'
  res.json({ mensaje: "Configuración actualizada. Permiso de Administrador verificado." });
});


// --------------------------------------------------------------------------
// MANEJO DE ERRORES DE SEGURIDAD (Manejo de Sesiones/Tokens expirados)
// --------------------------------------------------------------------------

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // Registra el intento fallido (Monitoreo)
    console.error(`[SEGURIDAD-ERROR] Intento fallido en: ${req.originalUrl} - ${err.message}`);
    // Envía la respuesta 401: Sesión Revocada/Token Inválido
    res.status(401).send({ message: 'Fallo de Autenticación. Token inválido o expirado. (Sesión Revocada)' });
  } else {
    next(err);
  }
});


// 5. INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor de Clima ejecutándose en http://localhost:${PORT}`);
});