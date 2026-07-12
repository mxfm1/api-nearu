# Migration 0006: Contact Request Upgrade

**Archivo:** `drizzle/0006_contact_request_upgrade.sql`

## Cambios

| Tabla | Cambio | Descripción |
|-------|--------|-------------|
| `solicitudes_contacto` | ADD COLUMN `intencion` text NOT NULL | Intención del mensaje (cotización, propuesta, disponibilidad, consulta) |
| `solicitudes_contacto` | DROP COLUMN `mensaje` | Legacy column reemplazada por `inbox_messages` |
| `solicitudes_contacto` | UPDATE `estado` | Migración de datos: `leido`/`respondido` → `en_curso`, `archivado` → `cerrada` |

## Nuevos valores

### `intencion`
- `Solicitar una cotización`
- `Solicitar una propuesta comercial`
- `Consultar disponibilidad`
- `Realizar una consulta sobre el servicio`

### `estado` (simplificado)
- `pendiente`
- `en_curso`
- `cerrada`

## Data migration

```sql
UPDATE "solicitudes_contacto" SET "estado" = 'en_curso' WHERE "estado" IN ('leido', 'respondido');
UPDATE "solicitudes_contacto" SET "estado" = 'cerrada' WHERE "estado" = 'archivado';
```
