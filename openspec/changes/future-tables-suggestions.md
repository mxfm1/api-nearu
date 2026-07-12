# Sugerencias de Tablas Futuras — nearU

## Contexto

Implementación por branching del dominio de applications. Estas tablas son necesarias para completar el flujo de eventos y scoring.

**Fecha:** 2026-07-11

---

## 1. Extender `inboxMessages` — Chat post-aceptación

**Urgencia:** 🔴 Alta

**Problema:** `inboxMessages` solo soporta `contact_request_id`. No hay canal de comunicación para applications aceptadas.

**Solución:** Migrar `inboxMessages` para soporte dual:

```sql
inbox_messages
├── id
├── contact_request_id  FK (nullable)  -- servicios
├── application_id      FK (nullable)  -- eventos ← NUEVO
├── sender_id
├── content
├── attachments
├── created_at
└── updated_at
```

**Constraint:**
```sql
CHECK (contact_request_id IS NOT NULL OR application_id IS NOT NULL)
```

**Reglas de scoring afectadas:**
- `HAS_RESPONSE_HISTORY`
- `FAST_RESPONSE_TIME`

---

## 2. `verification_requests` — Validación de perfiles

**Urgencia:** 🔴 Alta

**Problema:** La regla `VERIFIED_PROFILE` no tiene fuente de datos para verificar si una empresa está validada.

**Solución:**

```sql
verification_requests
├── id                TEXT PK
├── profile_id        FK → profiles.id
├── status            ENUM: 'pending' | 'approved' | 'rejected'
├── documents         JSONB  -- URLs de documentos, RUT, etc.
├── reviewed_by       FK → users.id (nullable)
├── reviewed_at       TIMESTAMP (nullable)
├── rejection_reason  TEXT (nullable)
├── created_at        TIMESTAMP
└── updated_at        TIMESTAMP

CONSTRAINT: UNIQUE(profile_id) -- solo 1 verificación activa
```

**Reglas de scoring afectadas:**
- `VERIFIED_PROFILE`

---

## 3. `reviews` — Feedback post-colaboración

**Urgencia:** 🟡 Media

**Problema:** Las reglas `AVERAGE_RATING`, `HAS_PREVIOUS_FEEDBACK`, `NUMBER_OF_COMPLETED_JOBS` y `NUMBER_OF_COMPLETED_EVENTS` no tienen fuente de datos.

**Solución:**

```sql
reviews
├── id                  TEXT PK
├── application_id      FK → applications.id
├── reviewer_profile_id FK → profiles.id
├── reviewed_profile_id FK → profiles.id
├── rating              INTEGER (1-5)
├── comment             TEXT (nullable)
├── created_at          TIMESTAMP

CONSTRAINT: UNIQUE(application_id, reviewer_profile_id)
```

**Reglas de scoring afectadas:**
- `AVERAGE_RATING`
- `HAS_PREVIOUS_FEEDBACK`
- `NUMBER_OF_COMPLETED_JOBS`
- `NUMBER_OF_COMPLETED_EVENTS`

---

## 4. `service_postings` — Custom fields (Futuro)

**Urgencia:** 🟢 Baja/Futuro

**Problema:** Si se necesitan campos personalizados en servicios (similar a CUSTOM_FIELD_MATCH en eventos).

**Solución:** Evaluar si es necesario antes de implementar.

---

## Mapa de dependencias de Scoring

| Regla | Tabla necesaria | Estado actual |
|-------|-----------------|---------------|
| `VERIFIED_PROFILE` | `verification_requests` | ❌ No existe |
| `SAME_REGION` | `profiles.locationId` + `events.locationId` | ✅ Existe |
| `HAS_PORTFOLIO` | `service_portfolio` | ✅ Existe |
| `YEARS_EXPERIENCE` | `services.yearsExperience` | ✅ Existe |
| `HAS_WEBSITE` | `profiles.website` | ✅ Existe |
| `HAS_SOCIAL_LINKS` | `profile_social_links` | ✅ Existe |
| `HAS_COMPANY_DESCRIPTION` | `profiles.description` | ✅ Existe |
| `HAS_LOGO` | `profiles.logoUrl` | ✅ Existe |
| `HAS_BANNER` | `profiles.bannerUrl` | ✅ Existe |
| `HAS_PREVIOUS_FEEDBACK` | `reviews` | ❌ No existe |
| `AVERAGE_RATING` | `reviews` | ❌ No existe |
| `NUMBER_OF_COMPLETED_JOBS` | `reviews` | ❌ No existe |
| `NUMBER_OF_COMPLETED_EVENTS` | `reviews` + `applications` | ⚠️ Parcial |
| `HAS_RESPONSE_HISTORY` | `inboxMessages` | ⚠️ Solo servicios |
| `FAST_RESPONSE_TIME` | `inboxMessages` + `contactRequests` | ⚠️ Solo servicios |
| `IS_PREMIUM_COMPANY` | `profiles` (campo futuro) | ❌ No existe |
| `CUSTOM_FIELD_MATCH` | Configuración por evento | ⚠️ Parcial (config JSONB) |

---

## Prioridad de implementación sugerida

1. **`verification_requests`** — Sin esto VERIFIED_PROFILE no funciona
2. **Extender `inboxMessages`** — Sin esto no hay chat post-aceptación
3. **`reviews`** — Sin esto 4 reglas de scoring no funcionan
4. **`service_postings`** — Solo si se necesita en futuro
