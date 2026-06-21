import apiClient from './axiosClient';
import type { ApiResponse, Stats } from '@/types';

export const statsApi = {
  get: () => apiClient.get<ApiResponse<Stats>>('/stats'),
};
