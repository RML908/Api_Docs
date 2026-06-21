import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

export function extractApiError(error: unknown): string {
  const axiosErr = error as AxiosError<ApiResponse>;
  const data = axiosErr?.response?.data;
  if (data?.errors?.length) return data.errors.join(', ');
  if (data?.message) return data.message;
  if (axiosErr?.message) return axiosErr.message;
  return 'An unexpected error occurred';
}
