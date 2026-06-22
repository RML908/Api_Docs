import { useEffect, useMemo, useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { useEndpoints } from '@/hooks/useEndpoints';
import { MethodBadge } from '@/components/common/MethodBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { JsonSchemaTable } from '@/components/common/JsonSchemaTable';
import { CodeSamplePanel } from '@/components/common/CodeSamplePanel';
import { getRequestBody, getResponseBody } from '@/utils/codeSamples';
import { Search } from 'lucide-react';
import type { Endpoint, EndpointStatus } from '@/types';
import { cn } from '@/utils/cn';

export default function PublicDocs() {
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: endpoints = [], isLoading: endpointsLoading } = useEndpoints({ status: 'published' });
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const byGroup = useMemo(() => {
    const map = new Map<number, Endpoint[]>();
    for (const ep of endpoints) {
      const list = map.get(ep.groupId) ?? [];
      list.push(ep);
      map.set(ep.groupId, list);
    }
    return map;
  }, [endpoints]);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => {
      if (g.name.toLowerCase().includes(q)) return true;
      return (byGroup.get(g.id) ?? []).some(
        (ep) => ep.path.toLowerCase().includes(q) || ep.summary.toLowerCase().includes(q),
      );
    });
  }, [groups, byGroup, search]);

  useEffect(() => {
    if (selectedId === null && endpoints.length > 0) {
      setSelectedId(endpoints[0]!.id);
    }
  }, [endpoints, selectedId]);

  const selected = endpoints.find((ep) => ep.id === selectedId) ?? null;
  const isLoading = groupsLoading || endpointsLoading;

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
          </div>
        ) : (
          <nav className="p-2">
            {filteredGroups.map((group) => {
              const groupEndpoints = byGroup.get(group.id) ?? [];
              if (groupEndpoints.length === 0) return null;
              return (
                <div key={group.id} className="mb-3">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span>{group.icon}</span>
                    <span>{group.name}</span>
                  </div>
                  <div>
                    {groupEndpoints.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedId(ep.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm',
                          selectedId === ep.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        <MethodBadge method={ep.method} />
                        <span className="truncate font-mono text-xs">{ep.path}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredGroups.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-gray-400">No endpoints found</p>
            )}
          </nav>
        )}
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {isLoading ? 'Loading…' : 'Select an endpoint to view its documentation'}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <div className="mb-1 flex items-center gap-2">
              <MethodBadge method={selected.method} />
              <code className="font-mono text-sm text-gray-700">{selected.path}</code>
              <span className="text-xs text-gray-400">{selected.version}</span>
              <StatusBadge status={selected.status as EndpointStatus} />
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{selected.summary}</h1>
            {selected.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{selected.description}</p>
            )}

            {getRequestBody(selected) !== null ? (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Request Body</h2>
                <JsonSchemaTable data={getRequestBody(selected)} />
              </section>
            ) : selected.params ? (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Request Format</h2>
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"><code>{selected.params}</code></pre>
              </section>
            ) : null}

            <section className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Response</h2>
                {selected.responseStatus && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {selected.responseStatus}
                  </span>
                )}
              </div>
              {getResponseBody(selected) !== null ? (
                <JsonSchemaTable data={getResponseBody(selected)} />
              ) : selected.responseExample ? (
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"><code>{selected.responseExample}</code></pre>
              ) : (
                <p className="text-sm text-gray-400">No response example provided.</p>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Code samples */}
      {selected && (
        <aside className="w-96 shrink-0 overflow-y-auto bg-gray-950 px-6 py-8">
          <CodeSamplePanel endpoint={selected} />
        </aside>
      )}
    </div>
  );
}
