import type { ServiceWithDetails } from '../entities/service.entity';
import type { IServicesRepository } from '../repositories/services.repository.interface';
import { NotFoundError } from '@/src/shared/errors/common';

export type IGetServiceUseCase = ReturnType<typeof getServiceUseCase>;

export const getServiceUseCase =
  (servicesRepository: IServicesRepository) =>
  async (slugOrId: string): Promise<ServiceWithDetails> => {
    // Try by slug first, then by ID
    let service = await servicesRepository.findBySlug(slugOrId);
    if (!service) {
      service = await servicesRepository.findById(slugOrId);
    }
    if (!service) throw new NotFoundError('Service');

    return service;
  };
