import type { IEndpointRepository } from '../interfaces/repositories/IEndpointRepository';
import type { IGroupRepository } from '../interfaces/repositories/IGroupRepository';
import type {
  CreateEndpointDto,
  UpdateEndpointDto,
  ListEndpointsQuery,
  EndpointResponseDto,
} from '../dtos/endpoints/EndpointDtos';
import type { EndpointRow } from '../../DST_API_DOCS.Persistence/schema';
import { omitUndefined } from '../utils/omitUndefined';

function toDto(row: EndpointRow): EndpointResponseDto {
  return {
    id: row.id,
    groupId: row.groupId,
    method: row.method,
    path: row.path,
    summary: row.summary,
    description: row.description,
    status: row.status,
    version: row.version,
    params: row.params,
    responseExample: row.responseExample,
    responseStatus: row.responseStatus,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class EndpointService {
  constructor(
    private readonly endpointRepo: IEndpointRepository,
    private readonly groupRepo: IGroupRepository,
  ) {}

  async listEndpoints(query: ListEndpointsQuery): Promise<EndpointResponseDto[]> {
    const rows = await this.endpointRepo.findAll(omitUndefined({
      groupId: query.groupId,
      status: query.status,
      version: query.version,
      search: query.q,
    }));
    return rows.map(toDto);
  }

  async getEndpoint(id: number): Promise<EndpointResponseDto> {
    const row = await this.endpointRepo.findById(id);
    if (!row) throw Object.assign(new Error('Endpoint not found'), { statusCode: 404 });
    return toDto(row);
  }

  async createEndpoint(dto: CreateEndpointDto, userId?: number): Promise<EndpointResponseDto> {
    const group = await this.groupRepo.findById(dto.groupId);
    if (!group) throw Object.assign(new Error('Group not found'), { statusCode: 404 });

    const maxOrder = await this.endpointRepo.getMaxSortOrderByGroup(dto.groupId);
    const row = await this.endpointRepo.create({
      ...dto,
      sortOrder: maxOrder + 1,
      description: dto.description ?? null,
      params: dto.params ?? null,
      responseExample: dto.responseExample ?? null,
      responseStatus: dto.responseStatus ?? 200,
      isDeleted: false,
      deletedAt: null,
      createdBy: userId ?? null,
      updatedBy: null,
    });
    return toDto(row);
  }

  async updateEndpoint(id: number, dto: UpdateEndpointDto, userId?: number): Promise<EndpointResponseDto> {
    const row = await this.endpointRepo.update(id, omitUndefined({ ...dto, updatedBy: userId ?? null }));
    if (!row) throw Object.assign(new Error('Endpoint not found'), { statusCode: 404 });
    return toDto(row);
  }

  async deleteEndpoint(id: number, userId?: number): Promise<void> {
    const deleted = await this.endpointRepo.softDelete(id, userId);
    if (!deleted) throw Object.assign(new Error('Endpoint not found'), { statusCode: 404 });
  }
}
