const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const dotenv = require('dotenv');

dotenv.config();

// 1. CONFIGURACIÓN DE TOKEN ROBUSTO (MFA/Zero Trust)
const checkJwt = jwt({
  // Obtiene la clave pública de manera dinámica desde el dominio de tu IdP
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH_DOMAIN}.well-known/jwks.json`
  }),

  // 2. PARÁMETROS DE SESIÓN SEGURA
  audience: process.env.AUTH_AUDIENCE,
  issuer: process.env.AUTH_DOMAIN,
  algorithms: ['RS256'] // Algoritmos criptográficos robustos
});

// 3. MIDDLEWARE PARA APLICAR PRINCIPIO DE MENOR PRIVILEGIO (ROLES)
function checkScopes(requiredScopes) {
  return function(req, res, next) {
    // Asume que los roles/permisos vienen en el claim 'scope' del token
    const userScopes = req.auth && req.auth.scope ? req.auth.scope.split(' ') : []; 
    const hasRequiredScopes = requiredScopes.every(scope => userScopes.includes(scope));
    
    if (hasRequiredScopes) {
      next();
    } else {
      console.warn(`[SEGURIDAD] Bloqueo 403. Usuario ${req.auth.sub || 'N/A'} sin permisos suficientes.`);
      res.status(403).send({ message: 'Acceso Denegado. Permisos insuficientes.' });
    }
  };
}


// 4. MIDDLEWARE DE LOG DE AUDITORÍA (MONITOREO)
function logAudit(req, res, next) {
    const userId = req.auth ? req.auth.sub : 'ANONIMO';
    console.log(`[AUDIT LOG] Usuario: ${userId} | Método: ${req.method} | Ruta: ${req.originalUrl}`);
    next();
}


module.exports = { checkJwt, checkScopes, logAudit };