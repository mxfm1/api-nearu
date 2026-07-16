# Requisitos Funcionales — NearU API

> Los 5 módulos principales, ordenados por prioridad.

---

## 1. AUTENTICACIÓN

### 1.1 Registro

| ID | Req | Detalle |
|----|-----|---------|
| FR-AUTH-01 | Registro con email | name (2-100), email (válido), password (mín. 8 chars) |
| FR-AUTH-02 | Creación de profile automática | Al registrarse, se crea un profile vacío asociado al userId |

### 1.2 Login

| ID | Req | Detalle |
|----|-----|---------|
| FR-AUTH-03 | Login con email/password | Retorna cookie de sesión |
| FR-AUTH-04 | Login con Google OAuth | Redirect a `/api/auth/sign-in/google` |
| FR-AUTH-05 | Logout | Invalida la sesión actual |

### 1.3 Recuperación

| ID | Req | Detalle |
|----|-----|---------|
| FR-AUTH-06 | Forgot password | Siempre retorna mensaje genérico (previene user enumeration) |
| FR-AUTH-07 | Reset password | Token válido + nueva password (mín. 8 chars) |

### 1.4 Cambio de credenciales

| ID | Req | Detalle |
|----|-----|---------|
| FR-AUTH-08 | Cambiar password | Requiere currentPassword + newPassword |
| FR-AUTH-09 | Cambiar email | Se envía verificación a la NUEVA dirección |
| FR-AUTH-10 | Verificar email | Token de verificación |

### 1.5 Sesión

| ID | Req | Detalle |
|----|-----|---------|
| FR-AUTH-11 | Obtener usuario actual | `GET /api/auth/me` retorna user autenticado |
| FR-AUTH-12 | Cookies httpOnly + secure | Better Auth maneja sesión via cookies |

---

## 2. PERFILES

### 2.1 CRUD

| ID | Req | Detalle |
|----|-----|---------|
| FR-PROF-01 | Upsert | Crea si no existe, actualiza si existe (por userId) |
| FR-PROF-02 | Campos obligatorios | name, description, bannerUrl, regionId |
| FR-PROF-03 | Campos opcionales | logoUrl, founded, employees, website, whatsapp |
| FR-PROF-04 | Slug | Se auto-genera desde el nombre con unicidad |

### 2.2 Tags

| ID | Req | Detalle |
|----|-----|---------|
| FR-PROF-05 | Tags | Array de strings (max 50 chars c/u, max 20 tags) |
| FR-PROF-06 | Resolución por nombre | `findOrCreateByName` — crea tag si no existe |

### 2.3 Social Links

| ID | Req | Detalle |
|----|-----|---------|
| FR-PROF-07 | Social Links | Array de { platform, url, orden } (max 20 links) |
| FR-PROF-08 | Reemplazo completo | Se eliminan y recrean en cada update (replace semantics) |

### 2.4 Completitud

| ID | Req | Detalle |
|----|-----|---------|
| FR-PROF-09 | Completeness check | name, description, bannerUrl, regionId deben estar presentes |
| FR-PROF-10 | Perfil incompleto bloquea | No se puede crear servicio ni evento sin perfil completo |
| FR-PROF-11 | Respuesta incluye `missingFields[]` | `isComplete: boolean` + campos faltantes |

---

## 3. SERVICIOS

### 3.1 CRUD

| ID | Req | Detalle |
|----|-----|---------|
| FR-SERV-01 | Crear servicio | slug (regex `^[a-z0-9-]+$`), title (1-200 chars) |
| FR-SERV-02 | Campos opcionales | marca, description, yearsExperience, priceMin/priceMax, availability, bannerUrl/logoUrl/thumbnailUrl, locationId, categoryId |
| FR-SERV-03 | Status | `draft`, `published`, `paused`, `archived` — default: `draft` |
| FR-SERV-04 | Slug duplicado | Lanza error genérico (no revela que ya existe) |
| FR-SERV-05 | Prerequisito | Perfil completo requerido |

### 3.2 Listado

| ID | Req | Detalle |
|----|-----|---------|
| FR-SERV-06 | Filtros públicos | profileId, categoryId, locationId, status, search |
| FR-SERV-07 | Solo publicados | Por defecto solo muestra `published` |
| FR-SERV-08 | GET por slugOrId | Soporta ambos (fallback chain) |

### 3.3 Portfolio

| ID | Req | Detalle |
|----|-----|---------|
| FR-SERV-09 | Agregar item | url (URL válida), title (max 200), description (max 2000) |
| FR-SERV-10 | Eliminar item | Solo items propios |

### 3.4 Contactos

| ID | Req | Detalle |
|----|-----|---------|
| FR-SERV-11 | Contactos | Array de { type, value } — reemplazo completo en cada update |

---

## 4. EVENTOS

### 4.1 CRUD

| ID | Req | Detalle |
|----|-----|---------|
| FR-EVT-01 | Crear evento | title (1-200), description (10-10000 chars) |
| FR-EVT-02 | Slug | Se auto-genera desde título con unicidad si no se provee |
| FR-EVT-03 | Dates | startAt y applicationDeadline — string ISO o Date |
| FR-EVT-04 | locationId | Región requerida si se especifica |
| FR-EVT-05 | categoryId | Opcional |
| FR-EVT-06 | Imágenes | thumbnailUrl y bannerUrl — URLs válidas |
| FR-EVT-07 | requiredCandidates | int, min 1, max 1000 — default 1 |
| FR-EVT-08 | requiresVerifiedProfile | boolean — default true |
| FR-EVT-09 | autoCloseWhenFilled | boolean — default true |
| FR-EVT-10 | Status | `draft`, `published`, `paused`, `archived` — default `draft` |
| FR-EVT-11 | Contadores | applicationCount y selectedCandidates se inicializan en 0 |
| FR-EVT-12 | Prerequisito | Perfil completo requerido |

### 4.2 Listado

| ID | Req | Detalle |
|----|-----|---------|
| FR-EVT-13 | Filtros públicos | profileId, categoryId, locationId, status, search, upcoming |
| FR-EVT-14 | Solo publicados | Por defecto solo muestra `published` |
| FR-EVT-15 | GET por slugOrId | Soporta ambos |

---

## 5. APLICACIONES

### 5.1 Crear postulación

| ID | Req | Detalle |
|----|-----|---------|
| FR-APP-01 | Crear postulación | eventId requerido |
| FR-APP-02 | coverLetter | string, max 5000 chars, nullable |
| FR-APP-03 | portfolioUrls | Array de URLs válidas, max 10 |
| FR-APP-04 | No postularse al propio evento | `profile.userId === event.profileId` → error |
| FR-APP-05 | Duplicados bloqueados | Una postulación activa por evento+perfil |
| FR-APP-06 | Status default | `pending` (UUID fijo `10000000-...0001`) |

### 5.2 Cambio de estado

| ID | Req | Detalle |
|----|-----|---------|
| FR-APP-07 | Transiciones | `pending` → `reviewing` → `accepted`/`rejected` |
| FR-APP-08 | Solo el owner del evento | Puede cambiar status — `ForbiddenError` si no |
| FR-APP-09 | Al aceptar | Incrementa `selectedCandidates` + crea thread de chat |
| FR-APP-10 | Al rechazar | Si estaba aceptado, decrementa `selectedCandidates` |
| FR-APP-11 | Notificación | Al aceptar/rechazar: notifica al applicant (in-app + email) |

### 5.3 Listado

| ID | Req | Detalle |
|----|-----|---------|
| FR-APP-12 | Listar por evento | Solo owner del evento puede ver |
| FR-APP-13 | Filtrar por status | `pending`, `reviewing`, `accepted`, `rejected` |
| FR-APP-14 | Mis postulaciones | `GET /api/mis-aplicaciones` — todas las del usuario |

### 5.4 Sistema de Scoring

| ID | Req | Detalle |
|----|-----|---------|
| FR-APP-15 | 4 tipos de regla | `VERIFIED_PROFILE`, `SAME_REGION`, `HAS_WEBSITE`, `ACCOUNT_AGE` |
| FR-APP-16 | Weight | int 1-100 — puntos posibles = weight |
| FR-APP-17 | Cálculo | peso completo si cumple la condición, 0 si no |
| FR-APP-18 | Score se upsert | Recalcula si ya existía |
| FR-APP-19 | Fire-and-forget | Se ejecuta solo si existen scoring rules |
| FR-APP-20 | Mínimo 1 regla | `EmptyScoringRulesError` si se envía array vacío |
