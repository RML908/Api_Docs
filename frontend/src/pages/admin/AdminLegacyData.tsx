import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Database } from 'lucide-react';

const LEGACY_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MjkzMTk1MDAsImV4cCI6MTc2MDg1NTUwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.73yulxFZZVxnx-Pi0q7VAlw4d2Q5phHZ3IJouKkvaG0';

type TableData = Record<string, Array<Record<string, unknown>>>;

const TABLE_LABELS: Record<string, string> = {
  dst_patient_schedule: 'Patient Schedule',
  dst_patient_schedule_sublist: 'Patient Schedule — Services',
  dst_doctors_blocked_time: 'Doctor Blocked Time',
};

function TableView({ name, rows }: { name: string; rows: Array<Record<string, unknown>> }) {
  const columns = rows.length > 0 ? Object.keys(rows[0]!) : [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-800">{TABLE_LABELS[name] ?? name}</h2>
        <span className="text-xs text-gray-400">{rows.length} row{rows.length === 1 ? '' : 's'}</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-400">No rows yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-700">
                      {row[col] === null ? <span className="text-gray-300">null</span> : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminLegacyData() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['legacy-tables', refreshKey],
    queryFn: async () => {
      const res = await fetch('/legacy-api/view_tables.php', {
        headers: { Authorization: `Bearer ${LEGACY_TOKEN}` },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Request failed');
      return json.data as TableData;
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Database className="h-6 w-6 text-blue-600" /> Legacy Test Database
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live contents of the legacy-api test MySQL tables, most recent rows first.
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error).message}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(data ?? {}).map(([name, rows]) => (
            <TableView key={name} name={name} rows={rows} />
          ))}
        </div>
      )}
    </div>
  );
}
