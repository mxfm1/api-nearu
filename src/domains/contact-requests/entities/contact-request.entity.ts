export type ContactRequestStatus = 'pendiente' | 'leido' | 'respondido' | 'archivado';

export interface ContactRequest {
  id: string;
  servicioId: string;
  propietarioId: string;
  remitenteId: string;
  mensaje: string | null;
  estado: ContactRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactRequestWithUsers extends ContactRequest {
  remitenteNombre?: string;
  remitenteEmail?: string;
  remitenteImagen?: string | null;
}
