import { cn } from '@/utils/cn';
import type { EndpointMethod } from '@/types';

const METHOD_COLORS: Record<EndpointMethod, string> = {
  GET: 'bg-green-100 text-green-800 border-green-200',
  POST: 'bg-blue-100 text-blue-800 border-blue-200',
  PUT: 'bg-orange-100 text-orange-800 border-orange-200',
  PATCH: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
};

export function MethodBadge({ method }: { method: EndpointMethod }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono font-semibold',
        METHOD_COLORS[method],
      )}
    >
      {method}
    </span>
  );
}
