/**
 * __tests__/privacy.test.js
 * Valida GDPR/CCPA: policy, consent, preferences, export, delete.
 */

process.env.NODE_ENV = 'test';
process.env.PRIVACY_VERSION = '1.0';
process.env.SECRET_KEY_DB_ENCRYPTION = 'clave-secreta-aes-256-muy-larga-y-fuerte';

const request = require('supertest');

// --- Mocks ---
// Mock del middleware de auth: inyecta identidad en req.auth
jest.mock('../api/authMiddleware', () => ({
  checkJwt: (req, res, next) => {
    req.auth = { email: 'priv.test@example.com', sub: 'priv.test@example.com' };
    next();
  },
  checkScopes: () => (req, res, next) => next(),
  logAudit: (req, res, next) => next()
}));

// Mock de cifrado: reversible simple para pruebas
jest.mock('../api/encryptionUtils', () => {
  function enc(s, key) { return Buffer.from(`${s}::${key}`).toString('base64'); }
  function dec(t, key) {
    const raw = Buffer.from(t, 'base64').toString('utf8');
    return raw.replace(`::${key}`, '');
  }
  return { encrypt: enc, decrypt: dec };
});

// Carga la app (usa el export de server.js)
const app = require('../api/server');

describe('Privacidad y Cumplimiento', () => {
  test('GET /privacy/policy devuelve versión y resumen', async () => {
    const res = await request(app).get('/privacy/policy');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('version', '1.0');
    expect(res.body).toHaveProperty('summary');
  });

  test('POST /privacy/consent guarda consentimiento y flags', async () => {
    // Debe existir un usuario para poder guardar consentimiento.
    // Creamos datos (guardado en memoria con cifrado en /guardar-datos)
    await request(app)
      .post('/api/usuario/guardar-datos')
      .send({ email: 'priv.test@example.com', ubicacion_exacta: 'MX' })
      .set('Authorization', 'Bearer dummy');

    const res = await request(app)
      .post('/privacy/consent')
      .send({ consent: true, analytics: true, marketing: false })
      .set('Authorization', 'Bearer dummy');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body.privacy.consent).toMatchObject({ given: true, version: '1.0' });
    expect(res.body.privacy.analytics).toBe(true);
    expect(res.body.privacy.marketing).toBe(false);
  });

  test('PATCH /privacy/preferences actualiza analytics/marketing', async () => {
    const res = await request(app)
      .patch('/privacy/preferences')
      .send({ analytics: false, marketing: true })
      .set('Authorization', 'Bearer dummy');

    expect(res.statusCode).toBe(200);
    expect(res.body.privacy.analytics).toBe(false);
    expect(res.body.privacy.marketing).toBe(true);
  });

  test('GET /privacy/export genera JSON portable', async () => {
    const res = await request(app)
      .get('/privacy/export')
      .set('Authorization', 'Bearer dummy');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment; filename="export-priv.test@example.com.json"');
    expect(res.body).toHaveProperty('email', 'priv.test@example.com');
    expect(res.body).toHaveProperty('privacy');
    expect(res.body).toHaveProperty('additionalData');
  });

  test('DELETE /privacy/delete elimina la cuenta', async () => {
    const res = await request(app)
      .delete('/privacy/delete')
      .set('Authorization', 'Bearer dummy');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true });

    // Intentar exportar luego debe fallar
    const again = await request(app)
      .get('/privacy/export')
      .set('Authorization', 'Bearer dummy');
    expect(again.statusCode).toBe(404);
  });
});
