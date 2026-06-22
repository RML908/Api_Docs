import { useState } from 'react';
import { useEndpoints, useCreateEndpoint, useUpdateEndpoint, useDeleteEndpoint } from '@/hooks/useEndpoints';
import { useGroups } from '@/hooks/useGroups';
import { MethodBadge } from '@/components/common/MethodBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Trash2, Pencil, Filter, Plus } from 'lucide-react';
import type { Endpoint, EndpointMethod, EndpointStatus } from '@/types';
import type { CreateEndpointPayload } from '@/api/endpoints';

const METHODS: EndpointMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUSES: EndpointStatus[] = ['draft', 'published', 'deprecated'];

const emptyForm: CreateEndpointPayload = {
  groupId: 0,
  method: 'GET',
  path: '',
  summary: '',
  description: '',
  status: 'draft',
  version: 'v1',
  params: '',
  responseExample: '',
  responseStatus: 200,
};

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
  const createEndpoint = useCreateEndpoint();
  const updateEndpoint = useUpdateEndpoint();
  const deleteEndpoint = useDeleteEndpoint();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateEndpointPayload>(emptyForm);

  const set = <K extends keyof CreateEndpointPayload>(key: K, value: CreateEndpointPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const startCreate = () => {
    setForm({ ...emptyForm, groupId: groups[0]?.id ?? 0 });
    setEditingId(null);
    setShowCreate(true);
  };

  const startEdit = (ep: Endpoint) => {
    setForm({
      groupId: ep.groupId,
      method: ep.method,
      path: ep.path,
      summary: ep.summary,
      description: ep.description ?? '',
      status: ep.status,
      version: ep.version,
      params: ep.params ?? '',
      responseExample: ep.responseExample ?? '',
      responseStatus: ep.responseStatus ?? 200,
    });
    setShowCreate(false);
    setEditingId(ep.id);
  };

  const cancel = () => {
    setShowCreate(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleCreate = async () => {
    await createEndpoint.mutateAsync(form);
    cancel();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    await updateEndpoint.mutateAsync({ id: editingId, payload: form });
    cancel();
  };

  const isSaving = createEndpoint.isPending || updateEndpoint.isPending;
  const isFormOpen = showCreate || editingId !== null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Endpoints</h1>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Endpoint
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-blue-800">
            {editingId !== null ? 'Edit Endpoint' : 'New Endpoint'}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={form.groupId}
              onChange={(e) => set('groupId', Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={0} disabled>Select group…</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
            </select>

            <select
              value={form.method}
              onChange={(e) => set('method', e.target.value as EndpointMethod)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <input
              value={form.path}
              onChange={(e) => set('path', e.target.value)}
              placeholder="/api/v1/resource"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono lg:col-span-2"
            />

            <input
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Summary"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm lg:col-span-2"
            />

            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as EndpointStatus)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <input
              value={form.version}
              onChange={(e) => set('version', e.target.value)}
              placeholder="Version (e.g. v1)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What does this endpoint do?"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Request Format</label>
              <textarea
                value={form.params}
                onChange={(e) => set('params', e.target.value)}
                placeholder={'{\n  "field": "type"\n}'}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Response Format</label>
              <textarea
                value={form.responseExample}
                onChange={(e) => set('responseExample', e.target.value)}
                placeholder={'{\n  "field": "type"\n}'}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
              />
            </div>
          </div>

          <div className="mt-3 w-40">
            <label className="mb-1 block text-xs font-medium text-gray-600">Response Status</label>
            <input
              type="number"
              value={form.responseStatus}
              onChange={(e) => set('responseStatus', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={editingId !== null ? handleUpdate : handleCreate}
              disabled={isSaving || !form.groupId || !form.path || !form.summary}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : editingId !== null ? 'Save' : 'Create'}
            </button>
            <button onClick={cancel} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      )}

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
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Path</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Summary</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Version</th>
                <th className="w-20 px-4 py-3" />
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(ep)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteEndpoint.mutate(ep.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
