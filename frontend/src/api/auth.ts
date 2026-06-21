import apiClient from './axiosClient';
import type { ApiResponse, AuthTokens, UserProfile } from '@/types';

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/login', { username, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<Omit<AuthTokens, 'user'>>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken }),

  me: () =>
    apiClient.get<ApiResponse<UserProfile>>('/auth/me'),
};
