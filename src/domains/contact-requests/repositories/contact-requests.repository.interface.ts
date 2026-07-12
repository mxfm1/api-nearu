import type { ContactRequest, ContactRequestWithUsers } from '../entities/contact-request.entity';

export interface IContactRequestsRepository {
  findById(id: string): Promise<ContactRequestWithUsers | null>;
  findByPropietarioId(propietarioId: string): Promise<ContactRequestWithUsers[]>;
  findByRemitenteId(remitenteId: string): Promise<ContactRequestWithUsers[]>;
  create(data: {
    servicioId?: string | null;
    eventoId?: string | null;
    propietarioId: string;
    remitenteId: string;
    intencion: string;
  }): Promise<ContactRequest>;
  updateEstado(id: string, estado: string): Promise<ContactRequest>;
}
