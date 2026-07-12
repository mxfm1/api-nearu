# API Endpoint Changes — v2 Schema Refactor

## Summary

Unified `statuses` table (replaces per-domain `serviceStatus`/`eventStatus` string fields), added `slug` to catalog/profiles endpoints, normalized contact request relations, and extracted profile tags + service contacts to dedicated tables.

> **Migration required:** `npm run db:migrate` after running `npx tsx scripts/backfill-v2.ts`.

---

## 1. Statuses — unified status object

**Affected endpoints:** All services & events responses.

### Before
```json
{
  "serviceStatus": "published",
  "eventStatus": "published"
}
```

### After
```json
{
  "status": {
    "id": "uuid",
    "name": "Publicado",
    "slug": "published"
  }
}
```

Valid slugs: `draft`, `published`, `paused`, `archived`.

---

## 2. Categories & Locations — slug field added

**Affected endpoints:** `GET /api/categorias`, `GET /api/ubicaciones`, `GET /api/regiones`.

### Categories
```diff
 {
   "id": "uuid",
   "name": "Producción de Eventos",
+  "slug": "produccion-de-eventos",
   "type": "service"
 }
```

### Locations (flat `/api/ubicaciones`)
```diff
 {
   "id": "uuid",
   "name": "Santiago Centro",
+  "slug": "santiago-centro",
   "region": { "id": "uuid", "name": "Metropolitana", "slug": "metropolitana" }
 }
```

### Locations (nested under `/api/regiones`)
```diff
 {
   "id": "uuid",
   "name": "Metropolitana",
   "slug": "metropolitana",
   "locations": [
-    { "id": "uuid", "name": "Santiago Centro" }
+    { "id": "uuid", "name": "Santiago Centro", "slug": "santiago-centro" }
   ]
 }
```

---

## 3. Profiles — slug, tags as objects, location as object

**Affected endpoints:** `GET /api/profiles/:userId`, `POST /api/profiles`.

### Request — `POST /api/profiles`
```diff
 {
   "name": "Mi Empresa",
   "industry": "Technology",
-  "tags": ["eventos", "producción"],
+  "tags": ["eventos", "produccíon"],       // same format — names, not IDs
-  "location": "Santiago, Chile",            // REMOVED — was a free-text string
+  "locationId": "uuid",                     // FK to locations table
   // ... rest unchanged
 }
```

### Response
```diff
 {
   "id": "uuid",
   "name": "Mi Empresa",
+  "slug": "mi-empresa",
-  "tags": ["eventos", "producción"],
+  "tags": [
+    { "id": "uuid", "name": "eventos", "slug": "eventos" },
+    { "id": "uuid", "name": "producción", "slug": "produccion" }
+  ],
-  "location": "Santiago, Chile",
+  "location": {
+    "id": "uuid",
+    "name": "Santiago Centro"
+  },
   // ... rest unchanged
 }
```

> **Note:** `slug` is auto-generated from `name` on the backend. Do not send it from the frontend.

---

## 4. Services — contacts as array, status object

**Affected endpoints:** `GET /api/servicios`, `GET /api/servicios/:slugOrId`, `POST /api/servicios`, `PATCH /api/servicios/:id`.

### Request — `POST /api/servicios` / `PATCH /api/servicios/:id`
```diff
 {
-  "serviceStatus": "published",
+  "status": "published",                    // slug, not ID
-  "contactInfo": [
-    { "type": "email", "value": "a@b.com" }
-  ],
+  "contacts": [
+    { "type": "email", "value": "a@b.com" }
+  ],
   // ... rest unchanged
 }
```

### Response
```diff
 {
-  "serviceStatus": "published",
+  "status": {
+    "id": "uuid",
+    "name": "Publicado",
+    "slug": "published"
+  },
   "contacts": [
     {
       "id": "uuid",
       "type": "email",
       "value": "a@b.com",
       "readAt": null,                       // timestamp when owner reads
       "respondedAt": null                    // timestamp when owner responds
     }
   ],
   // ... rest unchanged
 }
```

---

## 5. Events — status object

**Affected endpoints:** `GET /api/eventos`, `GET /api/eventos/:slugOrId`, `POST /api/eventos`, `PATCH /api/eventos/:id`.

### Request
```diff
 {
-  "eventStatus": "published",
+  "status": "published",                    // slug, not ID
   // ... rest unchanged
 }
```

### Response
```diff
 {
-  "eventStatus": "published",
+  "status": {
+    "id": "uuid",
+    "name": "Publicado",
+    "slug": "published"
+  },
   // ... rest unchanged
 }
```

---

## 6. Contact Requests — supports both services & events

**Affected endpoints:** `POST /api/contactos`.

### Request
```diff
 {
-  "servicioId": "uuid",                     // previously required
+  // Provide EXACTLY ONE of:
+  "servicioId": "uuid",                     // for service inquiries
+  // OR
+  "eventoId": "uuid",                       // for event inquiries
   "propietarioId": "uuid",
   "mensaje": "Hola..."
 }
```

> **XOR validation:** Exactly one of `servicioId` or `eventoId` must be provided. Sending both or neither returns `INPUT_PARSE_ERROR`.

---

## 7. My Content Endpoints (no changes)

- `GET /api/mis-servicios` — unchanged
- `GET /api/mis-eventos` — unchanged
- `GET /api/mis-eventos/:id` — unchanged

---

## Frontend Migration Checklist

- [ ] Replace `serviceStatus` reads with `status.slug` / `status.name`
- [ ] Replace `eventStatus` reads with `status.slug` / `status.name`
- [ ] Update profile detail views: `tags` are now objects `{id, name, slug}`, `location` is object `{id, name}`
- [ ] Update service create/edit forms: send `status` slug, `contacts` array instead of `contactInfo`
- [ ] Update event create/edit forms: send `status` slug
- [ ] Update catalog views: categories and locations now include `slug`
- [ ] Update contact request form: send `eventoId` for event inquiries, `servicioId` for service inquiries
- [ ] Remove any `profile.tags` text parsing (now objects from the API)
- [ ] Remove any `profile.location` string parsing (now object with `id` and `name`)
- [ ] Profile `slug` is available for public profile URLs (auto-generated from name)
