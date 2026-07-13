export type ContactRequestStatus = 'pendiente' | 'en_curso' | 'cerrada';

export type ContactRequestIntencion = 'Solicitar una cotización' | 'Solicitar una propuesta comercial' | 'Consultar disponibilidad' | 'Realizar una consulta sobre el servicio';

export interface ContactRequest {
  id: string;
  servicioId: string | null;
  eventoId: string | null;
  propietarioId: string;
  remitenteId: string;
  intencion: ContactRequestIntencion;
  estado: ContactRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactRequestWithUsers extends ContactRequest {
  remitenteNombre?: string;
  remitenteEmail?: string;
  remitenteImagen?: string | null;
  ultimoMensaje?: string | null;
  cantidadMensajes?: number;
}
