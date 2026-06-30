import type { ContactRequest, ContactRequestWithUsers } from '../entities/contact-request.entity';

export interface IContactRequestsRepository {
  findById(id: string): Promise<ContactRequestWithUsers | null>;
  findByPropietarioId(propietarioId: string): Promise<ContactRequestWithUsers[]>;
  create(data: {
    servicioId: string;
    propietarioId: string;
    remitenteId: string;
    mensaje?: string | null;
  }): Promise<ContactRequest>;
  updateEstado(id: string, estado: string): Promise<ContactRequest>;
}
