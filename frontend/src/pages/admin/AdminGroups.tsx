import { useState } from 'react';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Group } from '@/types';

export default function AdminGroups() {
  const { data: groups = [], isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '📁' });

  const handleCreate = async () => {
    await createGroup.mutateAsync({ name: form.name, description: form.description, icon: form.icon });
    setShowCreate(false);
    setForm({ name: '', description: '', icon: '📁' });
  };

  const handleUpdate = async (group: Group) => {
    await updateGroup.mutateAsync({ id: group.id, payload: { name: form.name, description: form.description, icon: form.icon } });
    setEditingId(null);
  };

  const startEdit = (group: Group) => {
    setEditingId(group.id);
    setForm({ name: group.name, description: group.description ?? '', icon: group.icon });
  };

  if (isLoading) return <div className="animate-pulse text-gray-400">Loading groups…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Group
        </button>
      </div>

      {showCreate && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-blue-800">New Group</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Icon" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleCreate} disabled={createGroup.isPending} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60">
              {createGroup.isPending ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.id} className="rounded-xl border border-gray-200 bg-white p-4">
            {editingId === group.id ? (
              <div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleUpdate(group)} disabled={updateGroup.isPending} className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-60">Save</button>
                  <button onClick={() => setEditingId(null)} className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{group.name}</p>
                    {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(group)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteGroup.mutate(group.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {groups.length === 0 && <p className="text-sm text-gray-400">No groups yet. Create your first group above.</p>}
      </div>
    </div>
  );
}
