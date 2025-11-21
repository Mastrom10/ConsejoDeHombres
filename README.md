# 🧔⚔️ Consejo de Hombres

Aplicación web responsive (backend + frontend) para que los hombres soliciten ingreso al Consejo, creen peticiones y sean votadas por la comunidad. Incluye panel administrativo con dashboard y ABM completo.

## 🏗️ Arquitectura
- **Backend**: Node.js + TypeScript + Express + Prisma (PostgreSQL). Autenticación con JWT y OAuth2 (Google), validaciones con Zod, middlewares de seguridad (helmet, rate-limit).
- **Frontend**: Next.js (React) con Tailwind. Componentes reutilizables, layouts simples y navegación protegida por rol.
- **Base de datos**: PostgreSQL gestionado con Prisma (migraciones y seed). Índices en campos de estado/fechas.
- **Infraestructura**: Docker + docker-compose (servicios: db, backend, frontend). Variables en `.env`.

## 🗄️ Modelo de datos (Prisma)
- `Usuario`: datos básicos, género/edad opcionales, `estadoMiembro` (pendiente, aprobado, rechazado, baneado) y `rol` (miembro, admin, moderador).
- `SolicitudMiembro` + `SolicitudVoto`: texto y foto de solicitud; conteo de votos y estado (pendiente/aprobada/rechazada).
- `Peticion` + `PeticionVoto` + `PeticionLike`: título, descripción, imágenes/video, métricas de likes y votos, estado (en revisión/aprobada/no_aprobada/cerrada).
- `Configuracion`: parámetros globales de votación (mínimo de votos y % de aprobación) editables por admin.
- `Reporte`: reportes de contenido por usuarios (para moderación).

## 🔌 Endpoints principales
- **Auth** `/auth/register` (POST), `/auth/login` (POST), `/auth/google` (GET), `/auth/google/callback` (GET), `/auth/me` (GET), `/auth/me` (DELETE). Respuesta: token JWT + perfil.
- **Solicitudes** `/solicitudes` (GET, POST), `/solicitudes/:id/votar` (POST). Reglas: solo miembros aprobados votan; rechazos requieren mensaje.
- **Peticiones** `/peticiones` (GET, filtro por estado), `/peticiones/populares` (GET), `/peticiones` (POST), `/peticiones/:id/votar` (POST), `/peticiones/:id/like` (POST), `/peticiones/:peticionId/votos/:votoId/reaccion` (POST).
- **Admin** `/admin/dashboard` (GET métricas), `/admin/config` (GET/PUT), `/admin/usuarios` (GET/POST), `/admin/usuarios/:id` (GET/PUT/DELETE), `/admin/peticiones` (GET), `/admin/peticiones/:id` (PUT/DELETE), `/admin/solicitudes` (GET), `/admin/solicitudes/:id` (PUT/DELETE), `/admin/reportes` (GET/POST), `/admin/reportes/:id` (PUT/DELETE). Solo rol `admin`.

## ✅ Regla de aprobación
- **Solicitudes de miembro**: requieren mínimo `minVotosSolicitud` (default 10) y ≥ `porcentajeAprobacion` (default 70%) para aprobar; de lo contrario se rechaza. El estado del usuario se actualiza automáticamente.
- **Peticiones**: requieren mínimo `minVotosPeticion` (default 100) y ≥ `porcentajeAprobacion` para quedar aprobada; si no, quedan `no_aprobada`.

## 🖥️ Panel de administración
- Visible solo para usuarios con rol `admin`. El header muestra enlace **Admin** únicamente para ellos.
- Dashboard con conteos de usuarios (totales, aprobados, pendientes, baneados, admins), peticiones (por estado, votos, likes), solicitudes (por estado, votos) y reportes (pendientes/totales). Actualiza cada minuto y tiene botón de refresco manual.
- ABM de usuarios (crear/editar/eliminar, cambio de rol/estado y reseteo de contraseña), peticiones (editar estado, visibilidad, texto, eliminar con dependencias) y solicitudes (editar estado/texto o eliminar).

## 📂 Estructura
```
backend/
  src/ (routes, middlewares, services, dtos)
  prisma/schema.prisma
  prisma/seed.ts
frontend/
  pages/, components/, styles/
```

## 🚀 Puesta en marcha
1. **Variables**: copia `.env.example` → `.env` y ajusta credenciales (Google OAuth, JWT, admin inicial). Por defecto se crea `admin@elconsejodehombres.net` con contraseña `Merluza23!`.
2. **Docker compose** (recomendado):
   ```bash
   docker-compose up --build
   ```
   - Backend en `http://localhost:4000`
   - Frontend en `http://localhost:3000`
3. **Local sin Docker** (requiere Node 20+):
   ```bash
   cd backend && npm install && npx prisma migrate dev && npm run seed && npm run dev
   cd frontend && npm install && npm run dev
   ```

## 🧪 Tests
- Backend: reglas de aprobación en `src/tests/rules.test.ts` (Jest). Ejecuta con `npm test` dentro de `backend`.

## 🔑 Crear usuario admin inicial
- Variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env` controlan el usuario seed. Por defecto: `admin@elconsejodehombres.net` / `Merluza23!`. El seed lo crea/actualiza como admin y miembro aprobado.

## 🖥️ Frontend
- Feed de peticiones, vista de solicitudes pendientes, formulario de creación y detalle con voto sí/no.
- Panel admin con dashboard y ABM, protegido por rol.
- Utiliza `NEXT_PUBLIC_API_URL` para apuntar al backend.

## 📜 Seguridad y buenas prácticas
- JWT para todas las rutas privadas, middlewares de rol/estado, rate limiting y helmet.
- Validaciones con Zod para entradas críticas, mensajes obligatorios en rechazos.
- Separación por capas (rutas → servicios → Prisma) y DTOs.

## 🧭 Roadmap sugerido
- Integrar almacenamiento S3 para imágenes/videos.
- Mejorar UX (estado global de sesión, toasts, skeleton loaders).
- Documentar API con Swagger/OpenAPI.
