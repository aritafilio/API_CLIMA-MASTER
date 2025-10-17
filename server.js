const express = require('express');
const app = express();
const crypto = require('crypto');

// se Importa los middlewares de seguridad y utilidades de cifrado
const { checkJwt, checkScopes, logAudit } = require('./authMiddleware'); 
const { encrypt, decrypt } = require('./encryptionUtils'); 

// Objeto global para almacenar los secretos de forma segura en memoria
const CONFIG = {}; 


async function getSecrets() {
    console.log("Cargando secretos desde el gestor en la nube...");
    
    // Simulación: Carga temporal de .env para desarrollo. 
    require('dotenv').config(); 
    
    CONFIG.PORT = process.env.PORT || 3000;
    // Clave para cifrado AES-256 en reposo (debe ser muy fuerte y única)
    CONFIG.SECRET_KEY_DB_ENCRYPTION = process.env.SECRET_KEY_DB_ENCRYPTION || 'clave-secreta-aes-256-muy-larga-y-fuerte';
    
    console.log("Secretos cargados en memoria. El servidor está listo para iniciar.");
}



app.use(express.json()); 
app.use(logAudit); 



// RUTA PÚBLICA 
app.get('/api/clima/publico', (req, res) => {
  res.json({ mensaje: "Datos climáticos públicos. (Open Access)" });
});


// RUTA PROTEGIDA 
app.get('/api/clima/seguro', checkJwt, (req, res) => {
  res.json({ 
    mensaje: `Datos climáticos detallados para el usuario: ${req.auth.sub}`,
    nivel: "Acceso Seguro (MFA Verificado)"
  });
});


// RUTA PROTEGIDA CON MENOR PRIVILEGIO 
app.post('/api/configuracion', checkJwt, checkScopes(['admin', 'write:config']), (req, res) => {
  res.json({ mensaje: "Configuración actualizada. Permiso de Administrador verificado." });
});


// RUTA GDPR: Almacenamiento seguro de datos con CIFRADO AES-256
app.post('/api/usuario/guardar-datos', checkJwt, (req, res) => {
    const { email, ubicacion_exacta } = req.body;
    
    // Cifrado de datos sensibles (GDPR)
    const emailCifrado = encrypt(email, CONFIG.SECRET_KEY_DB_ENCRYPTION);
    const ubicacionCifrada = encrypt(ubicacion_exacta, CONFIG.SECRET_KEY_DB_ENCRYPTION);
    
    console.log(`[DB] Guardando email cifrado: ${emailCifrado}`);
    
    res.status(200).json({ 
        mensaje: "Datos recibidos y cifrados correctamente para almacenamiento en reposo (AES-256).",
        email_guardado_parcial: emailCifrado.substring(0, 20) + '...'
    });
});


// RUTA GDPR: Portabilidad de Datos (Derecho del usuario a obtener sus datos)
app.get('/api/usuario/exportar', checkJwt, (req, res) => {
    // 1. Simula obtener datos cifrados de la DB
    const dataCifradaSimulada = 'a6280459c25f6b0f15c12002f2323e0a:d40447334f59048a141a0e5b7c7a33994595232d326f68565b9e0f3d9b4b0e51';

    // 2. Descifra la información usando la clave de CONFIG
    const emailDescifrado = decrypt(dataCifradaSimulada, CONFIG.SECRET_KEY_DB_ENCRYPTION);
    
    // 3. Envía los datos al usuario en formato JSON (Portabilidad de Datos)
    res.status(200).json({
        mensaje: "Exportación de datos personales (GDPR) completada.",
        datos: {
            user_id: req.auth.sub,
            email: emailDescifrado,
            fecha_exportacion: new Date().toISOString()
        }
    });
});


// Manejo de errores de JWT (ej. Token expirado/Sesión revocada)
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
        console.error("ERROR CRÍTICO: No se pudieron cargar los secretos. Apagando servidor.", error);
        process.exit(1);
    }
}

startServer();