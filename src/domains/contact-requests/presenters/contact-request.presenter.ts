import type { ContactRequestWithUsers } from '../entities/contact-request.entity';

export function presentContactRequest(request: ContactRequestWithUsers) {
  return {
    id: request.id,
    servicioId: request.servicioId,
    propietarioId: request.propietarioId,
    remitente: {
      id: request.remitenteId,
      nombre: request.remitenteNombre ?? null,
      email: request.remitenteEmail ?? null,
      imagen: request.remitenteImagen ?? null,
    },
    estado: request.estado,
    ultimoMensaje: request.ultimoMensaje ?? null,
    cantidadMensajes: request.cantidadMensajes ?? 0,
    createdAt: request.createdAt?.toISOString?.() ?? request.createdAt,
    updatedAt: request.updatedAt?.toISOString?.() ?? request.updatedAt,
  };
}

export function presentContactRequests(requests: ContactRequestWithUsers[]) {
  return requests.map(presentContactRequest);
}
