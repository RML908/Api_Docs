import { useQuery } from '@tanstack/react-query';
import { changelogsApi } from '@/api/changelogs';
import { format } from 'date-fns';

export default function PublicChangelog() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['changelogs'],
    queryFn: async () => { const r = await changelogsApi.list(); return r.data.data; },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Changelog</h1>
        <p className="mt-2 text-gray-500">API updates and version history</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-8">
              <div className="absolute left-0 top-1 h-full w-px bg-gray-200" />
              <div className="absolute left-[-5px] top-1 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" />
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded bg-blue-100 px-2.5 py-0.5 font-mono text-sm font-semibold text-blue-700">
                    {log.version}
                  </span>
                  <h2 className="font-semibold text-gray-900">{log.title}</h2>
                  <span className="ml-auto text-xs text-gray-400">
                    {format(new Date(log.publishedAt ?? log.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{log.content}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No changelog entries yet</p>}
        </div>
      )}
    </div>
  );
}
