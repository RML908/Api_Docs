export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function success<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { success: true, message, data, errors: [] };
}

export function failure(errors: string[], message = 'Error'): ApiResponse<null> {
  return { success: false, message, data: null, errors };
}
