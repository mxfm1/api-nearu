# Requisitos Funcionales y No Funcionales — NearU API

> Extraídos del código fuente del backend. Cada requisito es verificable en el código.

---

## MÓDULO 0: INFRAESTRUCTURA

### Requisitos No Funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| NFR-INFRA-01 | Inyección de dependencias con Container DI | `di/container.ts` — Inversify-like container con Symbol-based keys |
| NFR-INFRA-02 | Arquitectura por dominios (DDD ligero) | Cada dominio tiene: entities, repositories, use-cases, controllers, validators |
| NFR-INFRA-03 | Manejo centralizado de errores | `src/shared/errors/` — AppError base class con HTTP status, errorCode, isOperational |
| NFR-INFRA-04 | Validación de entrada con Zod | Middleware `validate()` — schema Zod → 400 con errores detallados |
| NFR-INFRA-05 | Autenticación Better Auth | Cookie + Bearer token dual support |
| NFR-INFRA-06 | CORS configurable | `src/shared/config/` — ALLOWED_ORIGINS desde env |
| NFR-INFRA-07 | Helmet para headers de seguridad | `src/presentation/server.ts` |
| NFR-INFRA-08 | Email con Resend | `src/shared/email/` — Mock mode sin API key (dev), real en prod |
| NFR-INFRA-09 | Slugify con unicidad | `src/shared/utils/slugify.ts` — `slugifyUnique()` verifica contra DB |
| NFR-INFRA-10 | Base de datos PostgreSQL (Neon serverless) | Drizzle ORM, connection pooling |
| NFR-INFRA-11 | Variables de entorno tipadas | `src/shared/config/` — required/optional env vars |
| NFR-INFRA-12 | Health check endpoint | `GET /api/health` → `{ status: 'ok', timestamp }` |

### Tipos de Error

| Error Class | HTTP Status | ErrorCode |
|-------------|:-----------:|-----------|
| `InputParseError` | 400 | `INPUT_PARSE_ERROR` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `ApplicationAlreadyExistsError` | 409 | `APPLICATION_ALREADY_EXISTS` |
| `EmptyScoringRulesError` | 400 | `SCORING_RULES_EMPTY` |
| `UnauthenticatedError` | 401 | `UNAUTHENTICATED` |

---

## MÓDULO 1: AUTENTICACIÓN

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `POST` | `/api/auth/sign-up/email` | No | Registro con email |
| `POST` | `/api/auth/sign-in/email` | No | Login con email |
| `POST` | `/api/auth/sign-out` | Sí | Logout |
| `POST` | `/api/auth/reset-password` | No | Reset con token |
| `POST` | `/api/auth/send-verification-email` | No | Reenviar verificación |
| `GET` | `/api/auth/sign-in/google` | No | Google OAuth redirect |
| `GET` | `/api/auth/callback/google` | No | Google OAuth callback |
| `GET` | `/api/auth/me` | Sí | Obtener usuario actual |
| `POST` | `/api/auth/change-password` | Sí | Cambiar contraseña |
| `POST` | `/api/auth/change-email` | Sí | Cambiar email |
| `POST` | `/api/auth/forgot-password` | No | Solicitar reset de contraseña |
| `POST` | `/api/auth/verify-email` | No | Verificar email con token |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-AUTH-01 | El registro requiere name (2-100 chars), email (válido), password (mín. 8 chars) |
| FR-AUTH-02 | Forgot-password siempre retorna mensaje genérico (previene user enumeration) |
| FR-AUTH-03 | Change-password requiere currentPassword + newPassword (mín. 8 chars) |
| FR-AUTH-04 | Cambio de contraseña genera notificación in-app + email (fire-and-forget, bypass preference) |
| FR-AUTH-05 | Cambio de email genera notificación in-app + email a la NUEVA dirección |
| FR-AUTH-06 | Soporte OAuth con Google como provider externo |
| FR-AUTH-07 | Better Auth maneja sesiones con cookies + Bearer tokens |
| FR-AUTH-08 | El endpoint `/api/auth/me` retorna el usuario autenticado actual |

### Requisitos No Funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| NFR-AUTH-01 | Cookies httpOnly + secure flags | Better Auth config |
| NFR-AUTH-02 | Headers de auth reenviados a Better Auth | `buildHeaders()` copia cookie + authorization |
| NFR-AUTH-03 | Notificaciones de cuenta bypass email preference | Tipos `password_changed`, `email_changed` |

---

## MÓDULO 2: USUARIOS

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/users/:id` | No | Obtener usuario por ID |
| `POST` | `/api/users` | No | Crear usuario |
| `DELETE` | `/api/users/:id` | Sí | Eliminar usuario |
| `PATCH` | `/api/users/me` | Sí | Actualizar perfil del usuario actual |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-USER-01 | Crear usuario requiere: name (2-100 chars), email (válido), password (mín. 8 chars) |
| FR-USER-02 | Eliminar usuario requiere autenticación |
| FR-USER-03 | Obtener usuario es público (para resolver nombres en la UI) |

---

## MÓDULO 3: PERFILES

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/profiles/:userId` | No | Obtener perfil por userId |
| `PATCH` | `/api/profiles/me` | Sí | Upsert del perfil del usuario actual |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-PROF-01 | Profile es un upsert: crea si no existe, actualiza si existe (por userId) |
| FR-PROF-02 | Campos del perfil: name (max 200), description (max 2000), regionId, bannerUrl, logoUrl, founded (max 20), employees (max 50), website (max 500), whatsapp (max 50) |
| FR-PROF-03 | Tags: array de strings (max 50 chars c/u, max 20 tags), se resuelven por nombre con `findOrCreateByName` |
| FR-PROF-04 | Social Links: array de { platform, url, orden } (max 20 links) — se reemplazan completamente en cada update |
| FR-PROF-05 | Slug se auto-genera desde el nombre con unicidad |
| FR-PROF-06 | Completeness check: name, description, bannerUrl, regionId — todos requeridos para perfil completo |
| FR-PROF-07 | Respuesta incluye `missingFields[]` e `isComplete: boolean` |
| FR-PROF-08 | Respuesta incluye `region: { id, name }` resuelta desde `regions` table |

### Requisitos No Funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| NFR-PROF-01 | Perfil incompleto bloquea creación de servicios y events | `getProfileCheck()` en controllers de services y events |
| NFR-PROF-02 | Social links se reemplazan (no append) | `deleteByProfileId` + `createMany` en cada upsert |

---

## MÓDULO 4: SERVICIOS

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/servicios` | No | Listar servicios (filtros públicos) |
| `GET` | `/api/servicios/:slugOrId` | No | Obtener servicio por slug o ID |
| `POST` | `/api/servicios` | Sí | Crear servicio |
| `PATCH` | `/api/servicios/:id` | Sí | Actualizar servicio |
| `DELETE` | `/api/servicios/:id` | Sí | Eliminar servicio |
| `GET` | `/api/mis-servicios` | Sí | Listar servicios del usuario actual |
| `POST` | `/api/servicios/:id/portfolio` | Sí | Agregar item de portfolio |
| `DELETE` | `/api/servicios/:id/portfolio/:portfolioId` | Sí | Eliminar item de portfolio |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-SERV-01 | Crear servicio requiere: slug (regex `^[a-z0-9-]+$`), title (1-200 chars) |
| FR-SERV-02 | Campos opcionales: marca (max 200), description (max 5000), yearsExperience (int ≥ 0), priceMin/priceMax (int ≥ 0), availability (max 500), bannerUrl/logoUrl/thumbnailUrl (URLs), locationId, categoryId |
| FR-SERV-03 | Status permitidos: `draft`, `published`, `paused`, `archived` — default: `draft` |
| FR-SERV-04 | Contacts: array de { type, value } — se reemplazan completamente |
| FR-SERV-05 | Portfolio: array de { url (URL válida), title (max 200), description (max 2000) } — se crean secuencialmente |
| FR-SERV-06 | Slug duplicado lanza error genérico |
| FR-SERV-07 | Filtros de listado: profileId, categoryId, locationId, status, search |
| FR-SERV-08 | Perfil completo es prerequisito para crear servicio |
| FR-SERV-09 | GET por slugOrId soporta ambos (fallback chain) |

### Requisitos No Funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| NFR-SERV-01 | Contacts se reemplazan en cada update (replace semantics) | `contactsRepository.replaceByServiceId()` |
| NFR-SERV-02 | Status se resuelve por slug a statusId via `statusesRepository.findBySlug()` | Resolución en use-case |
| NFR-SERV-03 | Servicios solo se listan con status `published` por defecto | Controller fuerza `status: 'published'` |

---

## MÓDULO 5: EVENTOS

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/eventos` | No | Listar eventos (filtros públicos) |
| `GET` | `/api/eventos/:slugOrId` | No | Obtener evento por slug o ID |
| `POST` | `/api/eventos` | Sí | Crear evento |
| `PATCH` | `/api/eventos/:id` | Sí | Actualizar evento |
| `DELETE` | `/api/eventos/:id` | Sí | Eliminar evento |
| `GET` | `/api/mis-eventos` | Sí | Listar eventos del usuario actual |
| `GET` | `/api/mis-eventos/:id` | Sí | Obtener evento propio por ID |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-EVT-01 | Crear evento requiere: title (1-200 chars), description (10-10000 chars, opcional) |
| FR-EVT-02 | Slug se auto-genera desde título con unicidad si no se provee |
| FR-EVT-03 | description y requirements: mín. 10 chars, máx. 10000 chars |
| FR-EVT-04 | Dates: startAt y applicationDeadline aceptan string ISO o Date — transformados a Date |
| FR-EVT-05 | locationId (region requerida si se especifica), categoryId |
| FR-EVT-06 | thumbnailUrl y bannerUrl deben ser URLs válidas |
| FR-EVT-07 | requiredCandidates: int, min 1, max 1000 — default 1 |
| FR-EVT-08 | requiresVerifiedProfile: boolean — default true |
| FR-EVT-09 | autoCloseWhenFilled: boolean — default true |
| FR-EVT-010 | Status: `draft`, `published`, `paused`, `archived` — default `draft`. Acepta `status` o `eventStatus` (legacy) |
| FR-EVT-011 | Contadores: `applicationCount` y `selectedCandidates` se inicializan en 0 |
| FR-EVT-012 | Filtros de listado: profileId, categoryId, locationId, status, search, upcoming (boolean) |
| FR-EVT-013 | Perfil completo es prerequisito para crear evento |
| FR-EVT-014 | GET por slugOrId soporta ambos |
| FR-EVT-015 | Validación: `applicationDeadline` debe ser fecha futura si se provee |

### Requisitos No Funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| NFR-EVT-01 | Contadores atómicos para concurrencia | `sql\`greatest(..., 0)\`` en updates |
| NFR-EVT-02 | Transform `eventStatus` → `status` (compatibilidad legacy) | Zod transform en schema |
| NFR-EVT-03 | Eventos solo se listan con status `published` por defecto | Controller fuerza `status: 'published'` |

---

## MÓDULO 6: APLICACIONES (POSTULACIONES)

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `POST` | `/api/applications` | Sí | Crear postulación |
| `GET` | `/api/applications/:id` | Sí | Obtener postulación por ID |
| `GET` | `/api/events/:eventId/applications` | Sí | Listar postulaciones de un evento |
| `GET` | `/api/events/:eventId/applications/score-details` | Sí | Listar con detalle de scoring |
| `GET` | `/api/mis-aplicaciones` | Sí | Listar postulaciones del usuario |
| `GET` | `/api/events/:eventId/my-application` | Sí | Mi postulación para un evento |
| `PATCH` | `/api/applications/:id/status` | Sí | Cambiar estado de postulación |
| `GET` | `/api/events/:eventId/scoring-rules` | Sí | Listar reglas de scoring del evento |
| `POST` | `/api/events/:eventId/scoring-rules` | Sí | Crear reglas de scoring |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-APP-01 | Crear postulación requiere: eventId (min 1 char) |
| FR-APP-02 | coverLetter: string, max 5000 chars, nullable |
| FR-APP-03 | portfolioUrls: array de URLs válidas, max 10 |
| FR-APP-04 | **No se puede postular al propio evento** — `profile.userId === event.profileId` → error |
| FR-APP-05 | **Duplicados bloqueados** — una postulación activa por evento+perfil → `ApplicationAlreadyExistsError` |
| FR-APP-06 | Status default: `pending` (UUID `10000000-...0001`) |
| FR-APP-07 | Transiciones de status: `pending` → `reviewing` → `accepted`/`rejected` (sin enforcement de state machine) |
| FR-APP-08 | **Solo el owner del evento puede cambiar status** → `ForbiddenError` |
| FR-APP-09 | Al cambiar a `accepted`: incrementa `selectedCandidates` + crea thread de chat |
| FR-APP-010 | Al cambiar de `accepted` a `rejected`: decrementa `selectedCandidates` |
| FR-APP-011 | Al cambiar a `accepted`/`rejected`: notifica al applicant (in-app + email) |
| FR-APP-012 | Filtros de listado por evento: `status` enum (`pending`, `reviewing`, `accepted`, `rejected`) |
| FR-APP-013 | Score computation se ejecuta fire-and-forget solo si existen scoring rules |

### Sistema de Scoring

| ID | Requisito |
|----|-----------|
| FR-SCORE-01 | 4 tipos de regla: `VERIFIED_PROFILE`, `SAME_REGION`, `HAS_WEBSITE`, `ACCOUNT_AGE` |
| FR-SCORE-02 | Cada regla tiene `weight` (int 1-100) — puntos posibles = weight |
| FR-SCORE-03 | `VERIFIED_PROFILE`: peso completo si `profile.isVerified === true` |
| FR-SCORE-04 | `SAME_REGION`: peso completo si `profile.regionId === event.location.regionId` |
| FR-SCORE-05 | `HAS_WEBSITE`: peso completo si `profile.website` es truthy |
| FR-SCORE-06 | `ACCOUNT_AGE`: peso completo si `user.createdAt` es anterior a 6 meses |
| FR-SCORE-07 | Score se almacena como `totalScore`/`maxPossible` + `breakdown[]` con razón por regla |
| FR-SCORE-08 | Crear scoring rules requiere al menos 1 regla — `EmptyScoringRulesError` |
| FR-SCORE-09 | Score se upsert (no insert) — recalcula si ya existía |

---

## MÓDULO 7: CATÁLOGO

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/categorias` | No | Listar categorías (filtro por type) |
| `GET` | `/api/regiones` | No | Listar regiones con ubicaciones anidadas |
| `GET` | `/api/ubicaciones` | No | Listar ubicaciones con región padre |
| `GET` | `/api/scoring-rules/catalog` | No | Catálogo de tipos de scoring rules |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-CAT-01 | Categorías se filtran por `type`: `service` o `event` |
| FR-CAT-02 | Regiones retornan ubicaciones nested (one-to-many) |
| FR-CAT-03 | Ubicaciones retornan región padre (many-to-one) |
| FR-CAT-04 | Catálogo de scoring rules retorna tipos disponibles con descripciones |

---

## MÓDULO 8: SOLICITUDES DE CONTACTO

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/contactos/intenciones` | No | Listar intenciones disponibles |
| `GET` | `/api/contactos/inbox` | Sí | Inbox del usuario (recibidos/enviados) |
| `GET` | `/api/contactos/:id` | Sí | Detalle de solicitud |
| `POST` | `/api/contactos` | Sí | Crear solicitud de contacto |
| `PATCH` | `/api/contactos/:id/estado` | Sí | Actualizar estado |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-CONTACT-01 | Crear solicitud requiere: slug (resuelve a servicio o evento), intencion (enum predefinido) |
| FR-CONTACT-02 | Intenciones permitidas: "Solicitar una cotización", "Solicitar una propuesta comercial", "Consultar disponibilidad", "Realizar una consulta sobre el servicio" |
| FR-CONTACT-03 | Slug resolution: intenta servicio primero, luego evento (fallback) |
| FR-CONTACT-04 | **No se puede contactar a uno mismo** — `remitenteId === propietarioId` → error |
| FR-CONTACT-05 | Estado: `pendiente` (default), `en_curso`, `cerrada` — free-text, no FK |
| FR-CONTACT-06 | Mensaje inicial se crea si hay contenido no vacío o attachments |
| FR-CONTACT-07 | Attachments: array de URLs válidas, max 6 |
| FR-CONTACT-08 | Notificación in-app al propietario (awaited, errors swallowed) |
| FR-CONTACT-09 | Email al propietario si `isEmailEnabled('new_contact_request')` es true |
| FR-CONTACT-010 | Filtros de inbox: `tipo` = `recibidos` | `enviados` |

---

## MÓDULO 9: MENSAJES (INBOX LEGACY)

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `POST` | `/api/mensajes` | Sí | Enviar mensaje en inbox |
| `GET` | `/api/mensajes/:contactRequestId` | Sí | Obtener thread de mensajes |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-MSG-01 | Enviar mensaje requiere: contactRequestId |
| FR-MSG-02 | content: string, max 5000 chars, nullable |
| FR-MSG-03 | Attachments: array de URLs válidas, max 6 |

---

## MÓDULO 10: THREADS (CHAT POST-ACEPTACIÓN)

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/threads` | Sí | Listar threads del usuario |
| `GET` | `/api/threads/application/:applicationId` | Sí | Thread por applicationId |
| `GET` | `/api/threads/:threadId` | Sí | Obtener thread |
| `GET` | `/api/threads/:threadId/messages` | Sí | Obtener mensajes del thread |
| `POST` | `/api/threads/:threadId/messages` | Sí | Enviar mensaje |
| `PATCH` | `/api/threads/:threadId/close` | Sí | Cerrar thread |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-THREAD-01 | Thread se crea automáticamente al aceptar postulación (fire-and-forget) |
| FR-THREAD-02 | Un thread por postulación — duplicado lanza `ConflictError` |
| FR-THREAD-03 | Status del thread: `OPEN`, `CLOSED`, `ARCHIVED` |
| FR-THREAD-04 | Enviar mensaje requiere content O tipo FILE/IMAGE/MIXED — no vacío |
| FR-THREAD-05 | Content max 255 chars |
| FR-THREAD-06 | Solo participantes del thread pueden enviar mensajes (applicant u organizer) |
| FR-THREAD-07 | `senderId` es un **userId** — se resuelve a profileId via `findByUserId()` |
| FR-THREAD-08 | Thread cerrado no acepta mensajes |
| FR-THREAD-09 | Notificación al destinatario (fire-and-forget) con idempotencia por `entityId` |
| FR-THREAD-010 | Thread incluye `applicantUserId` y `organizerUserId` resueltos desde profiles |

### Requisitos No Funcionales

| ID | Requisito | Implementación |
|----|-----------|----------------|
| NFR-THREAD-01 | Prevención de notification bombing | `findByEntityId(message.id)` antes de crear notificación |
| NFR-THREAD-02 | Thread se crea con status `OPEN` siempre | `createThreadUseCase` |

---

## MÓDULO 11: NOTIFICACIONES

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| `GET` | `/api/notificaciones` | Sí | Listar notificaciones del usuario |
| `PATCH` | `/api/notificaciones/:id/read` | Sí | Marcar como leída |
| `PATCH` | `/api/notificaciones/read-all` | Sí | Marcar todas como leídas |
| `GET` | `/api/notificaciones/config` | Sí | Obtener configuración |
| `PATCH` | `/api/notificaciones/config` | Sí | Actualizar configuración |

### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| FR-NOTIF-01 | 15 tipos de notificación: `new_application`, `application_reviewing`, `application_accepted`, `application_rejected`, `email_changed`, `password_changed`, `profile_updated`, `account_change`, `profile_verified`, `profile_revalidation_required`, `event_closed`, `event_filled`, `new_message`, `system`, `new_contact_request` |
| FR-NOTIF-02 | Cada notificación tiene: type, title, body, entityType, entityId, actionUrl, metadata, isRead, readAt |
| FR-NOTIF-03 | Configuración: `emailNotificationsEnabled: boolean` |
| FR-NOTIF-04 | Tipos de entidad: `application`, `event`, `message`, `conversation`, `profile`, `account`, `system`, `service` |
| FR-NOTIF-05 | Notificaciones de cuenta (password_changed, email_changed) bypass email preference |
| FR-NOTIF-06 | `body` defaulta a `title` si no se provee |

---

## MÓDULO 12: BASE DE DATOS

### Tablas Principales

| Tabla | Descripción | Seed Requerido |
|-------|-------------|:--------------:|
| `users` | Usuarios de auth | No (Better Auth) |
| `profiles` | Perfiles de empresa/usuario | No (user-created) |
| `services` | Servicios publicados | No (user-created) |
| `events` | Eventos publicados | No (user-created) |
| `applications` | Postulaciones a eventos | No (user-created) |
| `statuses` | Estados compartidos (8 filas) | **SÍ** |
| `categories` | Categorías (39 filas) | **SÍ** |
| `regions` | Regiones (16 filas) | **SÍ** |
| `locations` | Ubicaciones (59 filas) | **SÍ** |
| `threads` | Threads de chat | No (auto-created) |
| `messages` | Mensajes en threads | No (user-created) |
| `notifications` | Notificaciones in-app | No (auto-created) |
| `publication_scoring_rules` | Reglas de scoring por evento | No (user-created) |

### Constraints Críticos

| Tabla | Constraint | Tipo |
|-------|-----------|------|
| `applications` | `statusId` default: `10000000-...0001` | FK → statuses |
| `applications` | `eventId` + `applicantProfileId` | Unique (enforced en código) |
| `profiles` | `userId` unique | One profile per user |
| `profiles` | `slug` unique | Slug uniqueness |
| `services` | `slug` unique | Slug uniqueness |
| `events` | `slug` unique | Slug uniqueness |
| `categories` | `slug` unique | Slug uniqueness |
| `locations` | `slug` unique | Slug uniqueness |

### Índices

| Tabla | Columnas | Propósito |
|-------|----------|-----------|
| `applications` | `eventId`, `applicantProfileId`, `statusId`, `createdAt` | Queries de listado |
| `publication_scoring_rules` | `eventId` | Lookup por evento |
| `service_contacts` | `serviceId` | Lookup por servicio |
| `services` | `profileId` | Mis servicios |
| `events` | `profileId` | Mis eventos |
| `notifications` | `userId`, `entityId` | Inbox + idempotencia |

---

## MAPA COMPLETO DE ENDPOINTS (55+)

### Públicos (sin auth)
```
GET  /api/health
GET  /api/categorias
GET  /api/regiones
GET  /api/ubicaciones
GET  /api/scoring-rules/catalog
GET  /api/users/:id
POST /api/users
GET  /api/servicios
GET  /api/servicios/:slugOrId
GET  /api/eventos
GET  /api/eventos/:slugOrId
GET  /api/contactos/intenciones
POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
POST /api/auth/sign-out
POST /api/auth/reset-password
POST /api/auth/send-verification-email
GET  /api/auth/sign-in/google
GET  /api/auth/callback/google
POST /api/auth/forgot-password
POST /api/auth/verify-email
```

### Protegidas (requieren auth)
```
GET    /api/auth/me
POST   /api/auth/change-password
POST   /api/auth/change-email
PATCH  /api/users/me
DELETE /api/users/:id
GET    /api/profiles/:userId
PATCH  /api/profiles/me
POST   /api/servicios
PATCH  /api/servicios/:id
DELETE /api/servicios/:id
GET    /api/mis-servicios
POST   /api/servicios/:id/portfolio
DELETE /api/servicios/:id/portfolio/:portfolioId
POST   /api/eventos
PATCH  /api/eventos/:id
DELETE /api/eventos/:id
GET    /api/mis-eventos
GET    /api/mis-eventos/:id
POST   /api/applications
GET    /api/applications/:id
GET    /api/events/:eventId/applications
GET    /api/events/:eventId/applications/score-details
GET    /api/mis-aplicaciones
GET    /api/events/:eventId/my-application
PATCH  /api/applications/:id/status
GET    /api/events/:eventId/scoring-rules
POST   /api/events/:eventId/scoring-rules
GET    /api/contactos/inbox
GET    /api/contactos/:id
POST   /api/contactos
PATCH  /api/contactos/:id/estado
POST   /api/mensajes
GET    /api/mensajes/:contactRequestId
GET    /api/threads
GET    /api/threads/application/:applicationId
GET    /api/threads/:threadId
GET    /api/threads/:threadId/messages
POST   /api/threads/:threadId/messages
PATCH  /api/threads/:threadId/close
GET    /api/notificaciones
PATCH  /api/notificaciones/:id/read
PATCH  /api/notificaciones/read-all
GET    /api/notificaciones/config
PATCH  /api/notificaciones/config
```
