# TrueBA Tours MVP

Landing React + Vite con API en Cloudflare Pages Functions y persistencia en D1.

## Desarrollo

Requisitos: Node.js 22 y npm 10.

```powershell
npm.cmd install
npm.cmd run install:all
npm.cmd run build
```

El build productivo queda en `src/`. Para ejecutar Pages Functions localmente se necesita un binding D1 local llamado `DB` y una variable local `ADMIN_PASSWORD`; los secretos locales deben guardarse en `.dev.vars`, que está ignorado por Git.

## API

- `GET /api/health`
- `POST /api/bookings`
- `POST /api/providers`
- `GET /api/admin/summary` con header `x-admin-password`

El esquema idempotente está en `schema.sql`. En producción el binding D1 debe llamarse exactamente `DB` y `ADMIN_PASSWORD` debe configurarse como secret de Pages, nunca como variable pública de Vite.

## Configuración pública pendiente

El WhatsApp real TODAVÍA NO ESTÁ IDENTIFICADO. La landing no publica un número ficticio; el botón usa `VITE_WHATSAPP_URL` solo cuando se configura una URL pública válida durante el build.

## Backend anterior

`backend/server.js` se conserva como referencia del MVP original, pero no forma parte del despliegue de Cloudflare Pages ni es el almacenamiento productivo.
