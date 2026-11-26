import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/utils/cn';

function valueType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

type Requirement = 'required' | 'optional' | null;
type Filter = 'all' | 'required' | 'optional';

/** Reads "string (required) - ..." / "(optional)" from a field description. */
function requirementOf(value: unknown): Requirement {
  if (typeof value !== 'string') return null;
  const m = value.match(/\((required|optional)\b/i);
  return m ? (m[1]!.toLowerCase() as Requirement) : null;
}

export function JsonSchemaTable({ data, filterable = false }: { data: unknown; filterable?: boolean }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) return [];
    return Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
      key,
      value,
      req: requirementOf(value),
    }));
  }, [data]);

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    );
  }
  if (rows.length === 0) return null;

  const requiredCount = rows.filter((r) => r.req === 'required').length;
  const optionalCount = rows.filter((r) => r.req === 'optional').length;
  const canFilter = filterable && requiredCount > 0 && optionalCount > 0;

  // Required fields first (stable: original order is kept inside each group)
  const visible = (canFilter ? rows.filter((r) => filter === 'all' || r.req === filter) : rows)
    .map((r, i) => ({ ...r, i }))
    .sort((a, b) => {
      if (!canFilter) return a.i - b.i;
      const rank = (x: Requirement) => (x === 'required' ? 0 : x === 'optional' ? 1 : 2);
      return rank(a.req) - rank(b.req) || a.i - b.i;
    });

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: t('all'), count: rows.length },
    { id: 'required', label: t('required'), count: requiredCount },
    { id: 'optional', label: t('optional'), count: optionalCount },
  ];

  return (
    <div>
      {canFilter && (
        <div role="tablist" className="mb-3 flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === tab.id
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {tab.label} <span className={filter === tab.id ? 'text-blue-100' : 'text-gray-400'}>{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[20rem] text-sm">
          <tbody className="divide-y divide-gray-100">
            {visible.map(({ key, value, req }) => (
              <tr key={key}>
                <td className="w-2/5 px-3 py-2 align-top sm:w-1/3">
                  <code className="break-words text-xs font-semibold text-blue-700">{key}</code>
                  {req && (
                    <span
                      className={cn(
                        'mt-1 block w-fit rounded px-1.5 py-0.5 text-[10px] font-medium',
                        req === 'required' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {t(req)}
                    </span>
                  )}
                </td>
                <td className="hidden px-3 py-2 align-top text-xs text-gray-500 sm:table-cell">{valueType(value)}</td>
                <td className="break-words px-3 py-2 align-top font-mono text-xs text-gray-700">
                  {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
