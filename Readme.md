# 🌦️ Aplicación del Clima con Autenticación

Este proyecto es una **aplicación web en React** que permite a los usuarios consultar el clima actual y detalles adicionales, integrando autenticación y protección de rutas.  
El backend está implementado con **Express.js** y utiliza **JWT** para la autenticación, mientras que el frontend consume datos desde la **API de OpenWeather**.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** – Framework principal para construir la interfaz de usuario.  
- **React DOM** – Renderizado de componentes React en el navegador.  
- **React Router DOM** – Manejo de rutas y navegación (ej. `/login`, `/dashboard`).   
- **Axios** – Cliente HTTP para realizar peticiones a la API.  
- **CSS3** – Estilos y animaciones.  
- **React Scripts** – Scripts de `Create React App` para ejecutar y compilar la app.  
- **Testing Library (@testing-library/...)** – Herramientas para pruebas de componentes.  

### Backend
- **Express** – Framework para definir rutas y manejar peticiones.  
- **jsonwebtoken** – Generación y validación de tokens JWT.  
- **bcryptjs** – Encriptación de contraseñas.  
- **cors** – Habilita peticiones entre frontend y backend.  
- **helmet** – Cabeceras HTTP seguras.  
- **express-rate-limit** – Protección contra ataques de fuerza bruta.  
- **dotenv** – Manejo de variables de entorno.  
- **Axios** – También usado en el backend para consumir OpenWeather.  

### API Externa
- **OpenWeather API** – Fuente de datos climáticos.  
  - **Clave usada en pruebas:** `7b3b9c63037ddd97be0175dc1c71625e`

---

## ✨ Funcionalidades

- 🌍 **Clima actual** por ciudad.  
- 📍 **Ubicación automática** mediante geolocalización.  
- 📊 **Datos detallados**: temperatura, humedad, viento, presión.  
- 🔑 **Autenticación de usuarios** (   JWT).  
- 🛡 **Manejo de errores** para problemas de conexión o datos inválidos.  

---

## ⚙️ Instalación y ejecución
- **Clonar el repositorio**
    git clone https://github.com/tu_usuario/api_clima-master.git
    cd api_clima-master
- **Instalar dependencias**
    npm install
- **Configurar variables de entorno**
    Copia el archivo .env.example y crea uno real dentro de la carpeta api/:
    cp .env.example api/.env
- **Ejecutar la API**
    npm start
- **Ejecutar pruebas**
    npm test
    npm test -- --coverage
Las pruebas usan Jest + Supertest y verifican:
- Registro, login y rutas protegidas
- Perfil y eliminación de cuenta
- Endpoint /weather mockeado