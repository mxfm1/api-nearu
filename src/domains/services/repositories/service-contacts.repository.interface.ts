import type { ServiceContact } from '../entities/service-contact.entity';

export interface IServiceContactsRepository {
  findByServiceId(serviceId: string): Promise<ServiceContact[]>;
  replaceByServiceId(serviceId: string, contacts: Array<{ type: string; value: string }>): Promise<void>;
}
