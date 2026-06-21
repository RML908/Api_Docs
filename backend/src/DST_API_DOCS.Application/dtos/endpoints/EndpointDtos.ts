import { z } from 'zod';
import { EndpointMethod } from '../../../DST_API_DOCS.Domain/enums/EndpointMethod';
import { EndpointStatus } from '../../../DST_API_DOCS.Domain/enums/EndpointStatus';

export const CreateEndpointSchema = z.object({
  groupId: z.number().int().positive('Group ID is required'),
  method: z.nativeEnum(EndpointMethod).default(EndpointMethod.GET),
  path: z.string().min(1, 'Path is required').max(500),
  summary: z.string().min(1, 'Summary is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(EndpointStatus).default(EndpointStatus.DRAFT),
  version: z.string().default('v1'),
  params: z.string().optional(),
  responseExample: z.string().optional(),
  responseStatus: z.number().int().min(100).max(599).optional(),
});

export const UpdateEndpointSchema = CreateEndpointSchema.partial();

export const ListEndpointsQuerySchema = z.object({
  groupId: z.coerce.number().int().optional(),
  status: z.nativeEnum(EndpointStatus).optional(),
  version: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateEndpointDto = z.infer<typeof CreateEndpointSchema>;
export type UpdateEndpointDto = z.infer<typeof UpdateEndpointSchema>;
export type ListEndpointsQuery = z.infer<typeof ListEndpointsQuerySchema>;

export interface EndpointResponseDto {
  id: number;
  groupId: number;
  method: string;
  path: string;
  summary: string;
  description: string | null;
  status: string;
  version: string;
  params: string | null;
  responseExample: string | null;
  responseStatus: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
