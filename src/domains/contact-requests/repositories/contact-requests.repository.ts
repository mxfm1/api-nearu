import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { contactRequests, users, inboxMessages } from '@/src/shared/database/schema';
import type { IContactRequestsRepository } from './contact-requests.repository.interface';
import type { ContactRequest, ContactRequestWithUsers } from '../entities/contact-request.entity';

const baseSelect = {
  request: contactRequests,
  remitenteNombre: users.name,
  remitenteEmail: users.email,
  remitenteImagen: users.image,
  ultimoMensaje: sql<string>`(
    SELECT ${inboxMessages.content}
    FROM ${inboxMessages}
    WHERE ${inboxMessages.contactRequestId} = ${contactRequests.id}
    ORDER BY ${inboxMessages.createdAt} DESC
    LIMIT 1
  )`.as('ultimo_mensaje'),
  cantidadMensajes: sql<number>`(
    SELECT COUNT(*)
    FROM ${inboxMessages}
    WHERE ${inboxMessages.contactRequestId} = ${contactRequests.id}
  )`.as('cantidad_mensajes'),
};

function mapRow(row: { request: unknown; remitenteNombre: string | null; remitenteEmail: string | null; remitenteImagen: string | null; ultimoMensaje: string | null; cantidadMensajes: number }) {
  return {
    ...(row.request as ContactRequest),
    remitenteNombre: row.remitenteNombre ?? undefined,
    remitenteEmail: row.remitenteEmail ?? undefined,
    remitenteImagen: row.remitenteImagen ?? null,
    ultimoMensaje: row.ultimoMensaje ?? null,
    cantidadMensajes: row.cantidadMensajes ?? 0,
  } satisfies ContactRequestWithUsers;
}

export class ContactRequestsRepository implements IContactRequestsRepository {
  async findById(id: string): Promise<ContactRequestWithUsers | null> {
    try {
      const result = await db
        .select(baseSelect)
        .from(contactRequests)
        .where(eq(contactRequests.id, id))
        .leftJoin(users, eq(contactRequests.remitenteId, users.id))
        .limit(1);

      if (!result[0]) return null;
      return mapRow(result[0]);
    } catch (error) {
      console.error('[ContactRequestsRepository.findById] Error:', error);
      throw error;
    }
  }

  async findByPropietarioId(propietarioId: string): Promise<ContactRequestWithUsers[]> {
    try {
      const result = await db
        .select(baseSelect)
        .from(contactRequests)
        .where(eq(contactRequests.propietarioId, propietarioId))
        .leftJoin(users, eq(contactRequests.remitenteId, users.id))
        .orderBy(desc(contactRequests.createdAt));

      return result.map(mapRow);
    } catch (error) {
      console.error('[ContactRequestsRepository.findByPropietarioId] Error:', error);
      throw error;
    }
  }

  async findByRemitenteId(remitenteId: string): Promise<ContactRequestWithUsers[]> {
    try {
      const result = await db
        .select(baseSelect)
        .from(contactRequests)
        .where(eq(contactRequests.remitenteId, remitenteId))
        .leftJoin(users, eq(contactRequests.remitenteId, users.id))
        .orderBy(desc(contactRequests.createdAt));

      return result.map(mapRow);
    } catch (error) {
      console.error('[ContactRequestsRepository.findByRemitenteId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    servicioId?: string | null;
    eventoId?: string | null;
    propietarioId: string;
    remitenteId: string;
    intencion: string;
  }): Promise<ContactRequest> {
    try {
      const result = await db
        .insert(contactRequests)
        .values({
          id: crypto.randomUUID(),
          servicioId: data.servicioId || null,
          eventoId: data.eventoId || null,
          propietarioId: data.propietarioId,
          remitenteId: data.remitenteId,
          intencion: data.intencion,
        })
        .returning();
      return result[0] as ContactRequest;
    } catch (error) {
      console.error('[ContactRequestsRepository.create] Error:', error);
      throw error;
    }
  }

  async updateEstado(id: string, estado: string): Promise<ContactRequest> {
    try {
      const result = await db
        .update(contactRequests)
        .set({ estado, updatedAt: new Date() })
        .where(eq(contactRequests.id, id))
        .returning();
      return result[0] as ContactRequest;
    } catch (error) {
      console.error('[ContactRequestsRepository.updateEstado] Error:', error);
      throw error;
    }
  }
}
