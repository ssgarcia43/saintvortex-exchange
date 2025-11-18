# SaintVortex Exchange Server

Servidor HTTP simple para intercambiar códigos de invitación entre peers.

## ¿Qué hace?

- Guarda códigos temporalmente (30 minutos)
- Permite a los peers encontrarse sin saber IPs
- Solo HTTP, no reenvía tráfico

## Desplegar en Render.com (GRATIS)

1. Sube a GitHub
2. Conecta con Render.com
3. Crea Web Service
4. Configuración:
   - Environment: Node
   - Build: `npm install`
   - Start: `node server.js`
   - Plan: Free

## API

### POST /register
Registrar código:
```json
{
  "code": "VORTEX-ABC123",
  "virtualIP": "10.147.1.100",
  "publicIP": "203.0.113.45"
}
```

### GET /lookup?code=VORTEX-ABC123
Buscar código:
```json
{
  "virtualIP": "10.147.1.100",
  "publicIP": "203.0.113.45"
}
```

### GET /stats
Estadísticas del servidor

## Local

```bash
node server.js
```
