import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi, type CreateGroupPayload, type UpdateGroupPayload } from '@/api/groups';
import { toast } from 'sonner';
import { extractApiError } from '@/utils/apiError';

export const GROUP_KEYS = {
  all: ['groups'] as const,
  list: () => [...GROUP_KEYS.all, 'list'] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: GROUP_KEYS.list(),
    queryFn: async () => {
      const res = await groupsApi.list();
      return res.data.data;
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => groupsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all });
      toast.success('Group created');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGroupPayload }) =>
      groupsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all });
      toast.success('Group updated');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => groupsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all });
      toast.success('Group deleted');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}
