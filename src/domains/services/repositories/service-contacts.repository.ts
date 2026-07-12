import { eq } from 'drizzle-orm';
import { db } from '@/src/shared/database';
import { serviceContacts } from '@/src/shared/database/schema';
import type { IServiceContactsRepository } from './service-contacts.repository.interface';
import type { ServiceContact } from '../entities/service-contact.entity';

export class ServiceContactsRepository implements IServiceContactsRepository {
  async findByServiceId(serviceId: string): Promise<ServiceContact[]> {
    try {
      const result = await db
        .select()
        .from(serviceContacts)
        .where(eq(serviceContacts.serviceId, serviceId));
      return result as ServiceContact[];
    } catch (error) {
      console.error('[ServiceContactsRepository.findByServiceId] Error:', error);
      throw error;
    }
  }

  async replaceByServiceId(
    serviceId: string,
    contacts: Array<{ type: string; value: string }>,
  ): Promise<void> {
    try {
      await db
        .delete(serviceContacts)
        .where(eq(serviceContacts.serviceId, serviceId));

      if (contacts.length > 0) {
        await db.insert(serviceContacts).values(
          contacts.map((c) => ({
            id: crypto.randomUUID(),
            serviceId,
            type: c.type,
            value: c.value,
          })),
        );
      }
    } catch (error) {
      console.error('[ServiceContactsRepository.replaceByServiceId] Error:', error);
      throw error;
    }
  }
}
