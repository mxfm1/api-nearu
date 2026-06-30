import type { ServiceWithDetails } from '../entities/service.entity';
import type { IServicesRepository, IListServicesFilters } from '../repositories/services.repository.interface';

export type IListServicesUseCase = ReturnType<typeof listServicesUseCase>;

export const listServicesUseCase =
  (servicesRepository: IServicesRepository) =>
  async (filters?: IListServicesFilters): Promise<ServiceWithDetails[]> => {
    return servicesRepository.list(filters);
  };
