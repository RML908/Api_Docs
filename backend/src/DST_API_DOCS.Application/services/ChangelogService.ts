import type { IChangelogRepository } from '../interfaces/repositories/IChangelogRepository';
import type {
  CreateChangelogDto,
  UpdateChangelogDto,
  ChangelogResponseDto,
} from '../dtos/changelogs/ChangelogDtos';
import type { ChangelogRow } from '../../DST_API_DOCS.Persistence/schema';

function toDto(row: ChangelogRow): ChangelogResponseDto {
  return {
    id: row.id,
    version: row.version,
    title: row.title,
    content: row.content,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ChangelogService {
  constructor(private readonly changelogRepo: IChangelogRepository) {}

  async listChangelogs(version?: string): Promise<ChangelogResponseDto[]> {
    const rows = await this.changelogRepo.findAll(version);
    return rows.map(toDto);
  }

  async createChangelog(dto: CreateChangelogDto, userId?: number): Promise<ChangelogResponseDto> {
    const row = await this.changelogRepo.create({
      version: dto.version,
      title: dto.title,
      content: dto.content,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      isDeleted: false,
      deletedAt: null,
      createdBy: userId ?? null,
      updatedBy: null,
    });
    return toDto(row);
  }

  async updateChangelog(id: number, dto: UpdateChangelogDto, userId?: number): Promise<ChangelogResponseDto> {
    const existing = await this.changelogRepo.findById(id);
    if (!existing) throw Object.assign(new Error('Changelog not found'), { statusCode: 404 });

    const updateData: Record<string, unknown> = { updatedBy: userId ?? null };
    if (dto.version !== undefined) updateData['version'] = dto.version;
    if (dto.title !== undefined) updateData['title'] = dto.title;
    if (dto.content !== undefined) updateData['content'] = dto.content;
    if (dto.publishedAt !== undefined) {
      updateData['publishedAt'] = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    const row = await this.changelogRepo.update(id, updateData as any);
    if (!row) throw Object.assign(new Error('Changelog not found'), { statusCode: 404 });
    return toDto(row);
  }

  async deleteChangelog(id: number, userId?: number): Promise<void> {
    const deleted = await this.changelogRepo.softDelete(id, userId);
    if (!deleted) throw Object.assign(new Error('Changelog not found'), { statusCode: 404 });
  }
}
