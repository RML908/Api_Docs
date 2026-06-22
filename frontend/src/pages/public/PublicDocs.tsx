import { useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { useEndpoints } from '@/hooks/useEndpoints';
import { MethodBadge } from '@/components/common/MethodBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import type { Endpoint, EndpointStatus, Group } from '@/types';

function EndpointRow({ endpoint: ep }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = ep.description || ep.params || ep.responseExample;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => hasDetails && setExpanded((v) => !v)}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <MethodBadge method={ep.method} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <code className="truncate text-sm font-mono text-gray-700">{ep.path}</code>
            <span className="text-xs text-gray-400">{ep.version}</span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{ep.summary}</p>
        </div>
        <StatusBadge status={ep.status as EndpointStatus} />
        {hasDetails && (
          expanded ? <ChevronDown className="mt-0.5 h-4 w-4 text-gray-400" /> : <ChevronRight className="mt-0.5 h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && hasDetails && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50 px-4 py-3">
          {ep.description && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Description</p>
              <p className="mt-1 text-sm text-gray-700">{ep.description}</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {ep.params && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Request Format</p>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"><code>{ep.params}</code></pre>
              </div>
            )}
            {ep.responseExample && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Response Format{ep.responseStatus ? ` (${ep.responseStatus})` : ''}
                </p>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"><code>{ep.responseExample}</code></pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupSection({ group }: { group: Group }) {
  const [open, setOpen] = useState(true);
  const { data: endpoints = [] } = useEndpoints({ groupId: group.id, status: 'published' });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50"
      >
        <span className="text-xl">{group.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{group.name}</p>
          {group.description && <p className="text-xs text-gray-500">{group.description}</p>}
        </div>
        <span className="text-xs text-gray-400">{endpoints.length}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>

      {open && endpoints.length > 0 && (
        <div className="border-t border-gray-100">
          {endpoints.map((ep) => <EndpointRow key={ep.id} endpoint={ep} />)}
        </div>
      )}
    </div>
  );
}

export default function PublicDocs() {
  const { data: groups = [], isLoading } = useGroups();
  const [search, setSearch] = useState('');

  const filtered = groups.filter(
    (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
        <p className="mt-2 text-gray-500">Browse all available API endpoints</p>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group) => <GroupSection key={group.id} group={group} />)}
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No groups found</p>}
        </div>
      )}
    </div>
  );
}
