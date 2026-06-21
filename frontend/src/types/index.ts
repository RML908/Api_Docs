// ─── API Response Envelope ───────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

// ─── Domain ──────────────────────────────────────────────────────────────────
export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type EndpointStatus = 'published' | 'draft' | 'deprecated';

export interface Group {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Endpoint {
  id: number;
  groupId: number;
  method: EndpointMethod;
  path: string;
  summary: string;
  description: string | null;
  status: EndpointStatus;
  version: string;
  params: string | null;
  responseExample: string | null;
  responseStatus: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Changelog {
  id: number;
  version: string;
  title: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  key?: string; // Only present immediately after creation
}

export interface Stats {
  total: number;
  published: number;
  draft: number;
  deprecated: number;
  groups: number;
}

// ─── Utility ─────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
