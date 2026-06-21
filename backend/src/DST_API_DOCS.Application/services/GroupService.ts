import type { IGroupRepository } from '../interfaces/repositories/IGroupRepository';
import type { CreateGroupDto, UpdateGroupDto, GroupResponseDto } from '../dtos/groups/GroupDtos';
import type { GroupRow } from '../../DST_API_DOCS.Persistence/schema';
import { omitUndefined } from '../utils/omitUndefined';

function toDto(row: GroupRow): GroupResponseDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class GroupService {
  constructor(private readonly groupRepo: IGroupRepository) {}

  async listGroups(): Promise<GroupResponseDto[]> {
    const rows = await this.groupRepo.findAll();
    return rows.map(toDto);
  }

  async getGroup(id: number): Promise<GroupResponseDto> {
    const row = await this.groupRepo.findById(id);
    if (!row) throw Object.assign(new Error('Group not found'), { statusCode: 404 });
    return toDto(row);
  }

  async createGroup(dto: CreateGroupDto, userId?: number): Promise<GroupResponseDto> {
    const maxOrder = await this.groupRepo.getMaxSortOrder();
    const row = await this.groupRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      icon: dto.icon ?? '📁',
      sortOrder: maxOrder + 1,
      isDeleted: false,
      deletedAt: null,
      createdBy: userId ?? null,
      updatedBy: null,
    });
    return toDto(row);
  }

  async updateGroup(id: number, dto: UpdateGroupDto, userId?: number): Promise<GroupResponseDto> {
    const row = await this.groupRepo.update(id, omitUndefined({ ...dto, updatedBy: userId ?? null }));
    if (!row) throw Object.assign(new Error('Group not found'), { statusCode: 404 });
    return toDto(row);
  }

  async deleteGroup(id: number, userId?: number): Promise<void> {
    const deleted = await this.groupRepo.softDelete(id, userId);
    if (!deleted) throw Object.assign(new Error('Group not found'), { statusCode: 404 });
  }
}
