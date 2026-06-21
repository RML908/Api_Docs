import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi, type CreateEndpointPayload, type ListEndpointsQuery } from '@/api/endpoints';
import { toast } from 'sonner';
import { extractApiError } from '@/utils/apiError';

export const ENDPOINT_KEYS = {
  all: ['endpoints'] as const,
  list: (q?: ListEndpointsQuery) => [...ENDPOINT_KEYS.all, 'list', q] as const,
  detail: (id: number) => [...ENDPOINT_KEYS.all, id] as const,
};

export function useEndpoints(query?: ListEndpointsQuery) {
  return useQuery({
    queryKey: ENDPOINT_KEYS.list(query),
    queryFn: async () => {
      const res = await endpointsApi.list(query);
      return res.data.data;
    },
  });
}

export function useEndpoint(id: number) {
  return useQuery({
    queryKey: ENDPOINT_KEYS.detail(id),
    queryFn: async () => {
      const res = await endpointsApi.get(id);
      return res.data.data;
    },
    enabled: id > 0,
  });
}

export function useCreateEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEndpointPayload) => endpointsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENDPOINT_KEYS.all });
      toast.success('Endpoint created');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useUpdateEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateEndpointPayload> }) =>
      endpointsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENDPOINT_KEYS.all });
      toast.success('Endpoint updated');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useDeleteEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => endpointsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENDPOINT_KEYS.all });
      toast.success('Endpoint deleted');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}
