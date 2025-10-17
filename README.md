# 🌦️ API_CLIMA-MASTER
### 👩‍💻 Integrantes
- Mirian Carrillo Panzo  
- Joel Abdias Itehua Sánchez  
- Sugeiri Daniela Castillo Reyes  
- Rocío García Pacheco  
- Araceli Filio Reyes  
- Jonathan Iván Rojas Alta  

---

## 📘 Descripción del Proyecto
**API_CLIMA-MASTER** es una aplicación móvil desarrollada con **React Native** que integra **API’s de terceros** y servicios en la nube, enfocándose en **seguridad, pruebas unitarias y buenas prácticas OWASP Mobile Top 10**.  
El proyecto consume datos del clima desde **OpenWeatherMap API**, implementando **autenticación JWT**, **cifrado de datos**, y un backend seguro en **Firebase** con reglas de acceso controladas.  

El objetivo es demostrar la **integración segura de API’s** en entornos móviles y la correcta implementación de pruebas unitarias automatizadas con Jest y Supertest.

---

## 🧰 Dependencias Instaladas

### Dependencias principales
- **React Native** — Base de la aplicación móvil.  
- **Axios** — Cliente HTTP para consumir la API de OpenWeather.  
- **Firebase** — Servicio backend para autenticación y base de datos en la nube.  
- **JWT (jsonwebtoken)** — Autenticación basada en tokens seguros.  
- **bcrypt** — Cifrado de contraseñas.  
- **Helmet.js** — Cabeceras de seguridad HTTP.  
- **Express.js** — Framework backend para manejo de rutas y middlewares.  

### Dependencias de desarrollo
- **Jest** — Framework de testing para pruebas unitarias.  
- **Supertest** — Pruebas HTTP simuladas para endpoints.  
- **Axios Mock Adapter** — Simulación de respuestas de APIs externas.  

---

## 🔐 Configuración de Entorno

El proyecto utiliza variables de entorno almacenadas en un archivo `.env`.

Ejemplo:

```env
JWT_SECRET=tu_clave_jwt
CRYPTO_SECRET_KEY=tu_clave_cifrado
OPENWEATHER_API_KEY=tu_api_key
FIREBASE_API_KEY=clave_firebase
FIREBASE_AUTH_DOMAIN=proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=proyecto
FIREBASE_STORAGE_BUCKET=proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## 🚀 Pasos para Ejecutar la Aplicación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/usuario/API_CLIMA-MASTER.git
   cd API_CLIMA-MASTER
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el entorno**
   - Crear un archivo `.env` con las claves necesarias.
   - Asegurarse de tener configurado Firebase y OpenWeather.

4. **Ejecutar el servidor**
   ```bash
   npm run start
   ```

5. **Ejecutar en dispositivo/emulador**
   ```bash
   npx react-native run-android
   ```
   o  
   ```bash
   npx react-native run-ios
   ```

---

## 🧪 Pasos para Correr Pruebas Unitarias

1. Instalar dependencias de testing:
   ```bash
   npm i -D jest supertest
   ```

2. Ejecutar las pruebas:
   ```bash
   npm test
   ```

3. Para generar un reporte de cobertura:
   ```bash
   npm test -- --coverage
   ```

> Las pruebas cubren los módulos de autenticación, rutas protegidas, perfiles de usuario y consumo de API externa mockeada.

**Resultados esperados:**
```
Test Suites: 1 passed
Tests:       11 passed
Time:        ~2.7 s
```

---

## 🧱 Arquitectura y Seguridad

- **Autenticación JWT**: Protección de rutas sensibles (/me, /profile, /account).  
- **Cifrado AES-256-CBC**: Seguridad de datos en tránsito y reposo.  
- **Helmet y Rate Limiting**: Prevención de ataques XSS y fuerza bruta.  
- **Firebase Rules**: Control de acceso a datos en Firestore.  
- **OWASP Compliance**:  
  - API1: Broken Object Level Authorization → mitigado con middleware JWT.  
  - API2: Broken Authentication → mitigado con bcrypt + rate limiting.  
  - API3: Excessive Data Exposure → datos filtrados antes de enviarse.  
  - API4: Rate Limiting → protección ante ataques DoS.  
  - API7: Security Misconfiguration → Helmet.js y control de cabeceras activas.

---

## ☁️ Servicios en la Nube

### Firebase
- **Firestore Database**: almacenamiento seguro de datos.  
- **Firebase Auth**: autenticación con correo o Google.  
- **Cloud Storage**: manejo de archivos multimedia.  

### OpenWeatherMap API
- Consulta de condiciones climáticas por ciudad.  
- Peticiones gestionadas por el backend para ocultar la API Key.  

### AWS Amplify / Supabase (explorados)
- Alternativas analizadas para escalabilidad y autoalojamiento.

---

## 🔒 Buenas Prácticas OWASP Mobile Top 10

1. **Uso adecuado de la plataforma:** permisos mínimos y WebView seguro.  
2. **Almacenamiento seguro:** uso de SecureStore en lugar de AsyncStorage.  
3. **Comunicación segura:** HTTPS + certificados TLS válidos.  
4. **Principio de mínimo privilegio:** permisos limitados en base de datos.  
5. **Cifrado en tránsito y reposo:** TLS + AES-256.  

---

## ✅ Conclusión Técnica

El sistema demuestra **madurez de seguridad media-alta**, cubriendo las principales vulnerabilidades OWASP.  
Las pruebas automatizadas con Jest y Supertest validan la **confiabilidad, seguridad y resiliencia** de la API.  

> 🔹 Se cumple el objetivo de integrar servicios externos y backend seguro en React Native.  
> 🔹 Se garantiza un flujo autenticado, cifrado y probado de extremo a extremo.  
> 🔹 El proyecto es base sólida para futuras integraciones móviles empresariales.

---

## ✨ Funcionalidades

**Manejo de errores** para problemas de conexión o datos inválidos.  
 
---

## 🔏 Privacidad y Cumplimiento (GDPR / CCPA-CPRA)

- **Consentimiento explícito**: Banner/modal en la app para aceptar el tratamiento esencial y dar opt-in a analítica/marketing.  
- **Portabilidad de datos**: `GET /privacy/export` descarga tus datos en JSON portable.  
- **Derecho al olvido**: `DELETE /privacy/delete` elimina tu cuenta y datos personales.  
- **Preferencias (opt-in/out)**: `POST /privacy/consent` y `PATCH /privacy/preferences`.  
- **Política de privacidad**: `GET /privacy/policy` (versionada por `PRIVACY_VERSION` en `.env`).  

> Consulta **PRIVACY.md** para detalles y fundamentos legales.

