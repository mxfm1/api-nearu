export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  errorCode?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
