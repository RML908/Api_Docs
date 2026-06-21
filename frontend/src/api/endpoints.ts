import apiClient from './axiosClient';
import type { ApiResponse, Endpoint, EndpointMethod, EndpointStatus } from '@/types';

export interface CreateEndpointPayload {
  groupId: number;
  method: EndpointMethod;
  path: string;
  summary: string;
  description?: string;
  status?: EndpointStatus;
  version?: string;
  params?: string;
  responseExample?: string;
  responseStatus?: number;
}

export interface ListEndpointsQuery {
  groupId?: number;
  status?: EndpointStatus;
  version?: string;
  q?: string;
}

export const endpointsApi = {
  list: (query?: ListEndpointsQuery) =>
    apiClient.get<ApiResponse<Endpoint[]>>('/endpoints', { params: query }),

  get: (id: number) =>
    apiClient.get<ApiResponse<Endpoint>>(`/endpoints/${id}`),

  create: (payload: CreateEndpointPayload) =>
    apiClient.post<ApiResponse<Endpoint>>('/endpoints', payload),

  update: (id: number, payload: Partial<CreateEndpointPayload>) =>
    apiClient.patch<ApiResponse<Endpoint>>(`/endpoints/${id}`, payload),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/endpoints/${id}`),
};
