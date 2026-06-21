import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { changelogsApi } from '@/api/changelogs';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiError } from '@/utils/apiError';

export default function AdminChangelog() {
  const qc = useQueryClient();
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['changelogs'],
    queryFn: async () => { const r = await changelogsApi.list(); return r.data.data; },
  });

  const createMut = useMutation({
    mutationFn: changelogsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['changelogs'] }); toast.success('Changelog created'); setShowCreate(false); setForm({ version: '', title: '', content: '' }); },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const deleteMut = useMutation({
    mutationFn: changelogsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['changelogs'] }); toast.success('Changelog deleted'); },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ version: '', title: '', content: '' });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Changelog</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Entry
        </button>
      </div>

      {showCreate && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="Version (e.g. v1.2.0)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Markdown content…" rows={4} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="mt-2 flex gap-2">
            <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60">
              {createMut.isPending ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-mono font-semibold text-blue-700">{log.version}</span>
                  <h3 className="mt-2 font-semibold text-gray-900">{log.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{log.content}</p>
                </div>
                <button onClick={() => deleteMut.mutate(log.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-400">No changelog entries yet.</p>}
        </div>
      )}
    </div>
  );
}
