import type { BaseEntity, SoftDeletable, Auditable } from './BaseEntity';
import type { EndpointMethod } from '../enums/EndpointMethod';
import type { EndpointStatus } from '../enums/EndpointStatus';

export interface Endpoint extends BaseEntity, SoftDeletable, Auditable {
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
}
