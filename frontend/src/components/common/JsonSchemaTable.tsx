function valueType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function JsonSchemaTable({ data }: { data: unknown }) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    );
  }

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="w-1/3 px-3 py-2 align-top">
                <code className="text-xs font-semibold text-blue-700">{key}</code>
              </td>
              <td className="px-3 py-2 align-top text-xs text-gray-500">{valueType(value)}</td>
              <td className="px-3 py-2 align-top font-mono text-xs text-gray-700">
                {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
