import { useState } from 'react';
import { useEndpoints, useDeleteEndpoint } from '@/hooks/useEndpoints';
import { useGroups } from '@/hooks/useGroups';
import { MethodBadge } from '@/components/common/MethodBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Trash2, Filter } from 'lucide-react';
import type { EndpointStatus } from '@/types';

export default function AdminEndpoints() {
  const [groupFilter, setGroupFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<EndpointStatus | undefined>();
  const [search, setSearch] = useState('');

  const { data: endpoints = [], isLoading } = useEndpoints({
    groupId: groupFilter,
    status: statusFilter,
    q: search || undefined,
  });
  const { data: groups = [] } = useGroups();
  const deleteEndpoint = useDeleteEndpoint();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Endpoints</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Filter className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints…"
            className="outline-none"
          />
        </div>
        <select
          value={groupFilter ?? ''}
          onChange={(e) => setGroupFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">All Groups</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
        </select>
        <select
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter((e.target.value as EndpointStatus) || undefined)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Path</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Summary</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Version</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {endpoints.map((ep) => (
                <tr key={ep.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><MethodBadge method={ep.method} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{ep.path}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ep.summary}</td>
                  <td className="px-4 py-3"><StatusBadge status={ep.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{ep.version}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteEndpoint.mutate(ep.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {endpoints.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No endpoints found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
