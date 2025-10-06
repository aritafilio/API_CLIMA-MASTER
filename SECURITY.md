1. Principios de Seguridad Aplicados
* *Autenticación Basada en Tokens (JWT):* No se almacenan sesiones en el servidor. Cada petición segura es validada con un token firmado.
* *Cifrado de Datos Locales:* El token de autenticación se guarda en el dispositivo usando la librería react-native-keychain, que utiliza los mecanismos seguros nativos de iOS (Keychain) y Android (Keystore).
* *Comunicación Segura:* Todas las peticiones a la API se deben hacer sobre HTTPS.
* *Contraseñas Seguras:* Las contraseñas de los usuarios se almacenan en el backend usando el algoritmo de hashing bcrypt.

2. Amenazas Identificadas y Mitigación 
* *Amenaza:* Fuga de tokens si el dispositivo es comprometido.
    * *Mitigación:* Usamos react-native-keychain para que el token no sea accesible por otras apps. Además, los tokens tienen una caducidad corta (1 hora).
* *Amenaza:* Subir claves o secrets (API Keys) al repositorio de código.
    * *Mitigación:* Se utiliza un sistema de variables de entorno para gestionar las API Keys, y el archivo .env está incluido en .gitignore.

3. Lineamientos para el Equipo
* *NO* subir claves, tokens o contraseñas al repositorio de Git.
* Utilizar siempre variables de entorno para información sensible.
* Validar y limpiar todos los datos que provengan del usuario antes de procesarlos.
