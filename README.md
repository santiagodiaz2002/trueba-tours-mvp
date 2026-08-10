# TrueBA Tours MVP

Landing + backend funcional para validar reservas de tours privados en Buenos Aires.

## Qué incluye

- Frontend React con Vite.
- Backend Node.js + Express.
- Formulario de reserva funcional.
- Formulario para guías/choferes funcional.
- Panel admin básico.
- Base de datos simple en JSON local.

## Instalación

```bash
npm run install:all
```

## Correr en desarrollo

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:4000/api/health
```

## Compilar frontend

```bash
npm run build
```

El build queda en:

```text
frontend/dist
```

## Correr backend

```bash
npm run start
```

## Panel admin

Dentro de la landing hay una sección `Admin`.

Password por defecto:

```text
admin123
```

Cambiar en:

```text
backend/.env
```

Podés copiar `backend/.env.example` a `backend/.env`.

## Datos guardados

Las reservas se guardan en:

```text
backend/data/bookings.json
```

Las postulaciones de guías/choferes se guardan en:

```text
backend/data/providers.json
```

## Próximos pasos recomendados

1. Reemplazar el teléfono de WhatsApp en `frontend/src/App.jsx`.
2. Conectar Mercado Pago / Stripe.
3. Conectar email automático con Brevo, Resend o Gmail SMTP.
4. Pasar la base de datos de JSON a Supabase/PostgreSQL.
5. Agregar login real para admin, guías y choferes.
