# Política de Privacidad (resumen)

**Versión:** ${PRIVACY_VERSION:=1.0}  
**Última actualización:** 2025-01-01

## Qué datos recopilamos
- Correo electrónico (obligatorio para autenticación).
- Datos mínimos de perfil (opcional).
- Metadatos técnicos (IP, agente de usuario) para seguridad y auditoría.

## Para qué los usamos
- Proveer el servicio (autenticación, funcionalidades de la app).
- Seguridad (detección de fraude y abuso, auditoría).
- Analítica y marketing **solo si consientes**.

## Base legal
- GDPR: contrato (servicio) y/o consentimiento explícito (analítica/marketing).
- CCPA/CPRA: opción de **opt-out** de marketing/compartir datos.

## Tus derechos
- **Acceso y portabilidad**: `GET /privacy/export` (JSON portable).
- **Rectificación**: corrige datos de perfil desde la app.
- **Derecho al olvido (borrado)**: `DELETE /privacy/delete`.
- **Opt-in/out**: `POST /privacy/consent` y `PATCH /privacy/preferences`.

## Retención y minimización
Guardamos el mínimo necesario y durante el tiempo imprescindible para la prestación del servicio. Eliminamos o anonimizamos datos cuando ya no son necesarios.

## Subencargados
- OpenWeather (datos de clima). No enviamos datos personales a este proveedor.

## Contacto
Para ejercer tus derechos o resolver dudas, abre un issue en el repositorio o contacta al administrador del proyecto.