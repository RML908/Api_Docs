import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().min(1, 'Icon is required').default('📁'),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;

export interface GroupResponseDto {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
