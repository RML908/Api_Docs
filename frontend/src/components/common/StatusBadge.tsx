import { cn } from '@/utils/cn';
import type { EndpointStatus } from '@/types';

const STATUS_COLORS: Record<EndpointStatus, string> = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-600',
  deprecated: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: EndpointStatus }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[status])}>
      {status}
    </span>
  );
}
