/**
 * __tests__/api.test.js
 * Pruebas end-to-end para API_CLIMA-MASTER
 * - Define ENV antes de requerir la app
 * - Resetea api/users.json para un estado limpio
 * - Mock de axios para /weather
 */

const path = require('path');
const fs = require('fs');

process.env.PORT = '3002';
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES = '1h';
process.env.OPENWEATHER_API_KEY = 'fake_key_for_tests';
process.env.CRYPTO_SECRET_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

const USERS_FILE = path.join(__dirname, '..', 'api', 'users.json');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
else fs.writeFileSync(USERS_FILE, '[]');

jest.mock('axios', () => ({ get: jest.fn() }));
const axios = require('axios');

const request = require('supertest');
const app = require('../api/index');

// ===== 4) Helpers =====
const resetUsersFile = () => fs.writeFileSync(USERS_FILE, '[]');

const testUser = {
  email: `test_${Date.now()}@mail.com`,
  password: 'hola123',
};

async function register(email = testUser.email, password = testUser.password) {
  return request(app).post('/register').send({ email, password });
}

async function login(email = testUser.email, password = testUser.password) {
  return request(app).post('/login').send({ email, password });
}

async function authGet(url, token) {
  return request(app).get(url).set('Authorization', `Bearer ${token}`);
}

async function authPatch(url, body, token) {
  return request(app)
    .patch(url)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

async function authDelete(url, token) {
  return request(app).delete(url).set('Authorization', `Bearer ${token}`);
}

// ===== 5) Ciclo de vida de tests =====
beforeAll(() => {
  // Asegura que exista el archivo y esté limpio
  resetUsersFile();
});

afterAll(() => {
  // Limpia al finalizar
  resetUsersFile();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== 6) TESTS =====
describe('API básica', () => {
  test('GET / debe responder 200 y ok:true', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  test('GET /health responde 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });
});

describe('Auth y protección de rutas', () => {
  test('POST /register -> 201 y crea usuario', async () => {
    const res = await register();
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message', 'Usuario creado');
  });

  test('POST /register (duplicado) -> 409', async () => {
    await register(); // primera vez
    const res = await register(); // duplicado
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error', 'Usuario ya existe');
  });

  test('POST /login -> 200 y devuelve token', async () => {
    await register();
    const res = await login();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  test('GET /me sin token -> 401', async () => {
    const res = await request(app).get('/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /me con token -> 200 y email', async () => {
    await register();
    const { body } = await login();
    const token = body.token;

    const res = await authGet('/me', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testUser.email);
  });
});

describe('Perfil (PATCH /profile) y eliminación (DELETE /account)', () => {
  test('PATCH /profile actualiza displayName (200)', async () => {
    await register();
    const { body } = await login();
    const token = body.token;

    const res = await authPatch('/profile', { displayName: 'Daniel Test' }, token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('user.additionalData.displayName', 'Daniel Test');

    // /me refleja el cambio (el endpoint devuelve el email y additionalData del token, aquí
    // verificamos que el endpoint de perfil no rompa el acceso a recursos protegidos)
    const me = await authGet('/me', token);
    expect(me.statusCode).toBe(200);
    expect(me.body).toHaveProperty('email', testUser.email);
  });

  test('DELETE /account elimina usuario y ya no puede loguear', async () => {
    await register();
    const loginRes = await login();
    const token = loginRes.body.token;

    const del = await authDelete('/account', token);
    expect(del.statusCode).toBe(200);
    expect(del.body).toHaveProperty('ok', true);

    const relog = await login();
    expect(relog.statusCode).toBe(400); // credenciales inválidas (usuario ya no existe)
  });
});

describe('Clima (GET /weather) con axios mockeado', () => {
  test('GET /weather -> 200 y estructura esperada', async () => {
    // Mock de la respuesta de OpenWeather
    axios.get.mockResolvedValueOnce({
      data: {
        name: 'Tehuacan',
        main: { temp: 23 },
        weather: [{ description: 'nubes' }],
      },
    });

    await register();
    const { body } = await login();
    const token = body.token;

    const res = await authGet('/weather?q=Tehuacan', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Tehuacan',
      temp: 23,
      desc: 'nubes',
    });

    // Asegura que llamamos al endpoint externo con la ciudad codificada
    expect(axios.get).toHaveBeenCalledTimes(1);
    const calledUrl = axios.get.mock.calls[0][0];
    expect(calledUrl).toContain('api.openweathermap.org');
    expect(calledUrl).toContain('Tehuacan');
  });

  test('GET /weather maneja error de la API externa -> 500/4xx', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500 } });

    await register();
    const { body } = await login();
    const token = body.token;

    const res = await authGet('/weather?q=CiudadInvalida', token);
    expect([500, 404]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });
});
