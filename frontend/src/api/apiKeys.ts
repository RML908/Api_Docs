import apiClient from './axiosClient';
import type { ApiResponse, ApiKey } from '@/types';

export const apiKeysApi = {
  list: () => apiClient.get<ApiResponse<ApiKey[]>>('/api-keys'),
  create: (name: string) => apiClient.post<ApiResponse<ApiKey>>('/api-keys', { name }),
  revoke: (id: number) => apiClient.patch<ApiResponse<null>>(`/api-keys/${id}/revoke`),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/api-keys/${id}`),
};
