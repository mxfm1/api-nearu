export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  errorCode?: string;
  details?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
