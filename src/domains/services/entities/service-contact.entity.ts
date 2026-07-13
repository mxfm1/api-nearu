export interface ServiceContact {
  id: string;
  serviceId: string;
  type: string;
  value: string;
  readAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
}
