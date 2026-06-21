import apiClient from './axiosClient';
import type { ApiResponse, Changelog } from '@/types';

export interface CreateChangelogPayload {
  version: string;
  title: string;
  content: string;
  publishedAt?: string | null;
}

export const changelogsApi = {
  list: (version?: string) =>
    apiClient.get<ApiResponse<Changelog[]>>('/changelogs', { params: version ? { version } : {} }),

  create: (payload: CreateChangelogPayload) =>
    apiClient.post<ApiResponse<Changelog>>('/changelogs', payload),

  update: (id: number, payload: Partial<CreateChangelogPayload>) =>
    apiClient.patch<ApiResponse<Changelog>>(`/changelogs/${id}`, payload),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/changelogs/${id}`),
};
