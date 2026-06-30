import type { ServicePortfolioItem } from '../entities/service.entity';

export interface IServicePortfolioRepository {
  findByServiceId(serviceId: string): Promise<ServicePortfolioItem[]>;
  create(data: {
    serviceId: string;
    url: string;
    title?: string | null;
    description?: string | null;
    orden?: number;
  }): Promise<ServicePortfolioItem>;
  update(id: string, data: { title?: string | null; description?: string | null; url?: string; orden?: number }): Promise<ServicePortfolioItem>;
  delete(id: string): Promise<void>;
  deleteByServiceId(serviceId: string): Promise<void>;
}
