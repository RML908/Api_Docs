import { z } from 'zod';

export const CreateChangelogSchema = z.object({
  version: z.string().min(1, 'Version is required').max(20),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  publishedAt: z.string().datetime().nullable().optional(),
});

export const UpdateChangelogSchema = CreateChangelogSchema.partial();

export type CreateChangelogDto = z.infer<typeof CreateChangelogSchema>;
export type UpdateChangelogDto = z.infer<typeof UpdateChangelogSchema>;

export interface ChangelogResponseDto {
  id: number;
  version: string;
  title: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
