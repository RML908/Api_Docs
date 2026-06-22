import { useState } from 'react';
import type { Endpoint } from '@/types';
import { buildCurlSample, buildJsSample, buildPythonSample, getResponseBody } from '@/utils/codeSamples';
import { cn } from '@/utils/cn';

const TABS = ['cURL', 'JavaScript', 'Python'] as const;
type Tab = typeof TABS[number];

export function CodeSamplePanel({ endpoint }: { endpoint: Endpoint }) {
  const [tab, setTab] = useState<Tab>('cURL');
  const baseUrl = window.location.origin;

  const sample =
    tab === 'cURL' ? buildCurlSample(endpoint, baseUrl) :
    tab === 'JavaScript' ? buildJsSample(endpoint, baseUrl) :
    buildPythonSample(endpoint, baseUrl);

  const responseBody = getResponseBody(endpoint);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-gray-900">
        <div className="flex items-center gap-1 border-b border-gray-800 px-3 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium',
                tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <pre className="overflow-x-auto p-4 text-xs text-gray-100"><code>{sample}</code></pre>
      </div>

      {responseBody !== null && (
        <div className="overflow-hidden rounded-xl bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
            <span className="text-xs font-medium text-gray-300">Response</span>
            {endpoint.responseStatus && (
              <span className="rounded bg-green-900 px-2 py-0.5 text-xs font-medium text-green-300">
                {endpoint.responseStatus}
              </span>
            )}
          </div>
          <pre className="overflow-x-auto p-4 text-xs text-gray-100">
            <code>{JSON.stringify(responseBody, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
