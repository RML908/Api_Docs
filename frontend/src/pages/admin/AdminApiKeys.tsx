import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/api/apiKeys';
import { Plus, Trash2, X, Copy, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiError } from '@/utils/apiError';

export default function AdminApiKeys() {
  const qc = useQueryClient();
  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => { const r = await apiKeysApi.list(); return r.data.data; },
  });

  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () => apiKeysApi.create(newKeyName),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(res.data.data.key ?? null);
      setNewKeyName('');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const revokeMut = useMutation({
    mutationFn: apiKeysApi.revoke,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Key revoked'); },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const deleteMut = useMutation({
    mutationFn: apiKeysApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Key deleted'); },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="mt-1 text-sm text-gray-500">Keys for programmatic access via Bearer token authentication</p>
      </div>

      {createdKey && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-800">API Key Created — copy now, it won't be shown again</p>
            <button onClick={() => setCreatedKey(null)}><X className="h-4 w-4 text-green-700" /></button>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-mono text-sm">
            <span className="flex-1 break-all">{createdKey}</span>
            <button onClick={() => { navigator.clipboard.writeText(createdKey); toast.success('Copied!'); }}>
              <Copy className="h-4 w-4 text-gray-400 hover:text-gray-700" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-3">
        <input
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Key name…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          onClick={() => createMut.mutate()}
          disabled={!newKeyName.trim() || createMut.isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Create
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Prefix</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Last Used</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((key) => (
                <tr key={key.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{key.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{key.keyPrefix}…</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${key.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                  <td className="flex gap-1 px-4 py-3">
                    {key.isActive && (
                      <button onClick={() => revokeMut.mutate(key.id)} className="rounded p-1 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600" title="Revoke">
                        <ShieldOff className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => deleteMut.mutate(key.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No API keys yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
