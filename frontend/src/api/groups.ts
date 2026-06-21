import apiClient from './axiosClient';
import type { ApiResponse, Group } from '@/types';

export interface CreateGroupPayload { name: string; description?: string; icon: string; }
export interface UpdateGroupPayload { name?: string; description?: string | null; icon?: string; sortOrder?: number; }

export const groupsApi = {
  list: () => apiClient.get<ApiResponse<Group[]>>('/groups'),
  create: (payload: CreateGroupPayload) => apiClient.post<ApiResponse<Group>>('/groups', payload),
  update: (id: number, payload: UpdateGroupPayload) => apiClient.patch<ApiResponse<Group>>(`/groups/${id}`, payload),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/groups/${id}`),
};
