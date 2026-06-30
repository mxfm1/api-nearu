import { eq, desc } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { contactRequests, users } from '@/src/shared/database/schema';
import type { IContactRequestsRepository } from './contact-requests.repository.interface';
import type { ContactRequest, ContactRequestWithUsers } from '../entities/contact-request.entity';

export class ContactRequestsRepository implements IContactRequestsRepository {
  async findById(id: string): Promise<ContactRequestWithUsers | null> {
    try {
      const result = await db
        .select({
          request: contactRequests,
          remitenteNombre: users.name,
          remitenteEmail: users.email,
          remitenteImagen: users.image,
        })
        .from(contactRequests)
        .where(eq(contactRequests.id, id))
        .leftJoin(users, eq(contactRequests.remitenteId, users.id))
        .limit(1);

      if (!result[0]) return null;

      const { request, ...userData } = result[0];
      return {
        ...(request as ContactRequest),
        ...userData,
      };
    } catch (error) {
      console.error('[ContactRequestsRepository.findById] Error:', error);
      throw error;
    }
  }

  async findByPropietarioId(propietarioId: string): Promise<ContactRequestWithUsers[]> {
    try {
      const result = await db
        .select({
          request: contactRequests,
          remitenteNombre: users.name,
          remitenteEmail: users.email,
          remitenteImagen: users.image,
        })
        .from(contactRequests)
        .where(eq(contactRequests.propietarioId, propietarioId))
        .leftJoin(users, eq(contactRequests.remitenteId, users.id))
        .orderBy(desc(contactRequests.createdAt));

      return result.map(({ request, ...userData }) => ({
        ...(request as ContactRequest),
        ...userData,
      }));
    } catch (error) {
      console.error('[ContactRequestsRepository.findByPropietarioId] Error:', error);
      throw error;
    }
  }

  async create(data: {
    servicioId: string;
    propietarioId: string;
    remitenteId: string;
    mensaje?: string | null;
  }): Promise<ContactRequest> {
    try {
      const result = await db
        .insert(contactRequests)
        .values({
          id: crypto.randomUUID(),
          servicioId: data.servicioId,
          propietarioId: data.propietarioId,
          remitenteId: data.remitenteId,
          mensaje: data.mensaje ?? null,
          estado: 'pendiente',
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
