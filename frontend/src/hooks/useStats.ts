import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/stats';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await statsApi.get();
      return res.data.data;
    },
    refetchInterval: 30_000,
  });
}
