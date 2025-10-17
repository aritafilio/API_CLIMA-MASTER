/**
 * __tests__/api-secure.test.js
 * Rutas públicas/seguras, scopes y guardado cifrado de datos.
 */

process.env.NODE_ENV = 'test';
process.env.SECRET_KEY_DB_ENCRYPTION = 'clave-secreta-aes-256-muy-larga-y-fuerte';

const request = require('supertest');

// Mock de middlewares de seguridad
jest.mock('../api/authMiddleware', () => ({
  checkJwt: (req, res, next) => {
    req.auth = { email: 'secure.test@example.com', sub: 'secure.test@example.com', scope: ['admin', 'write:config'] };
    next();
  },
  checkScopes: () => (req, res, next) => next(),
  logAudit: (req, res, next) => next()
}));

// Mock cifrado simple
jest.mock('../api/encryptionUtils', () => {
  function enc(s, key) { return Buffer.from(`${s}::${key}`).toString('base64'); }
  function dec(t, key) {
    const raw = Buffer.from(t, 'base64').toString('utf8');
    return raw.replace(`::${key}`, '');
  }
  return { encrypt: enc, decrypt: dec };
});

const app = require('../api/server');

describe('Clima API segura', () => {
  test('GET /api/clima/publico responde 200', async () => {
    const res = await request(app).get('/api/clima/publico');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
  });

  test('GET /api/clima/seguro requiere JWT y retorna datos del usuario', async () => {
    const res = await request(app)
      .get('/api/clima/seguro')
      .set('Authorization', 'Bearer dummy');
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toContain('secure.test@example.com');
  });

  test('POST /api/configuracion con scopes válidos', async () => {
    const res = await request(app)
      .post('/api/configuracion')
      .set('Authorization', 'Bearer dummy')
      .send({ featureFlag: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/Configuración actualizada/);
  });

  test('POST /api/usuario/guardar-datos cifra email en reposo', async () => {
    const res = await request(app)
      .post('/api/usuario/guardar-datos')
      .set('Authorization', 'Bearer dummy')
      .send({ email: 'secure.test@example.com', ubicacion_exacta: 'MX' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email_guardado_parcial');
    // el parcial debe ser base64 recortado (por el mock de cifrado)
    expect(typeof res.body.email_guardado_parcial).toBe('string');
  });
});
