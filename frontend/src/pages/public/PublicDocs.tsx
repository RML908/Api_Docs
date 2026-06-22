import { useEffect, useMemo, useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { useEndpoints } from '@/hooks/useEndpoints';
import { MethodBadge } from '@/components/common/MethodBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { JsonSchemaTable } from '@/components/common/JsonSchemaTable';
import { CodeSamplePanel } from '@/components/common/CodeSamplePanel';
import { getRequestBody, getResponseBody } from '@/utils/codeSamples';
import { Search, Menu, Code2, X } from 'lucide-react';
import type { Endpoint, EndpointStatus } from '@/types';
import { cn } from '@/utils/cn';

export default function PublicDocs() {
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: endpoints = [], isLoading: endpointsLoading } = useEndpoints({ status: 'published' });
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  const byGroup = useMemo(() => {
    const map = new Map<number, Endpoint[]>();
    for (const ep of endpoints) {
      const list = map.get(ep.groupId) ?? [];
      list.push(ep);
      map.set(ep.groupId, list);
    }
    return map;
  }, [endpoints]);

  const matchesQuery = (ep: Endpoint, q: string) =>
    ep.path.toLowerCase().includes(q) ||
    ep.summary.toLowerCase().includes(q) ||
    ep.method.toLowerCase().includes(q) ||
    (ep.description?.toLowerCase().includes(q) ?? false);

  const visibleByGroup = useMemo(() => {
    const map = new Map<number, Endpoint[]>();
    const q = search.trim().toLowerCase();
    for (const group of groups) {
      const groupEndpoints = byGroup.get(group.id) ?? [];
      if (!q) {
        map.set(group.id, groupEndpoints);
        continue;
      }
      const groupNameMatches = group.name.toLowerCase().includes(q);
      const visible = groupNameMatches ? groupEndpoints : groupEndpoints.filter((ep) => matchesQuery(ep, q));
      map.set(group.id, visible);
    }
    return map;
  }, [groups, byGroup, search]);

  const filteredGroups = useMemo(
    () => groups.filter((g) => (visibleByGroup.get(g.id) ?? []).length > 0),
    [groups, visibleByGroup],
  );

  useEffect(() => {
    if (selectedId === null && endpoints.length > 0) {
      setSelectedId(endpoints[0]!.id);
    }
  }, [endpoints, selectedId]);

  const selected = endpoints.find((ep) => ep.id === selectedId) ?? null;
  const isLoading = groupsLoading || endpointsLoading;

  const selectEndpoint = (id: number) => {
    setSelectedId(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Mobile toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <Menu className="h-4 w-4" /> Endpoints
        </button>
        {selected && (
          <button
            onClick={() => setCodeOpen(true)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <Code2 className="h-4 w-4" /> Code
          </button>
        )}
      </div>

      <div className="relative flex flex-1">
        {/* Sidebar backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out',
            'lg:static lg:z-auto lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-3 lg:hidden">
            <span className="text-sm font-semibold text-gray-700">Endpoints</span>
            <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
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
                const groupEndpoints = visibleByGroup.get(group.id) ?? [];
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
                          onClick={() => selectEndpoint(ep.id)}
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
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              {isLoading ? 'Loading…' : 'Select an endpoint to view its documentation'}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <MethodBadge method={selected.method} />
                <code className="break-all font-mono text-sm text-gray-700">{selected.path}</code>
                <span className="text-xs text-gray-400">{selected.version}</span>
                <StatusBadge status={selected.status as EndpointStatus} />
              </div>
              <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{selected.summary}</h1>
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

        {/* Code samples backdrop (mobile/tablet) */}
        {codeOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setCodeOpen(false)}
          />
        )}

        {/* Code samples drawer (mobile/tablet) */}
        {selected && (
          <aside
            className={cn(
              'fixed inset-y-0 right-0 z-40 w-full max-w-sm transform overflow-y-auto bg-gray-950 px-4 py-4 transition-transform duration-200 ease-in-out lg:hidden',
              codeOpen ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-200">Code Sample</span>
              <button onClick={() => setCodeOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <CodeSamplePanel endpoint={selected} />
          </aside>
        )}

        {/* Code samples panel (desktop, static) */}
        {selected && (
          <aside className="hidden w-96 shrink-0 overflow-y-auto bg-gray-950 px-6 py-8 lg:block">
            <CodeSamplePanel endpoint={selected} />
          </aside>
        )}
      </div>
    </div>
  );
}
