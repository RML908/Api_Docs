import type { Endpoint } from '@/types';

function tryParseJson(text: string | null | undefined): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function getRequestBody(ep: Endpoint): unknown {
  return tryParseJson(ep.params);
}

export function getResponseBody(ep: Endpoint): unknown {
  return tryParseJson(ep.responseExample);
}

function hasBody(method: string) {
  return method === 'POST' || method === 'PUT' || method === 'PATCH';
}

export function buildCurlSample(ep: Endpoint, baseUrl: string): string {
  const url = `${baseUrl}${ep.path}`;
  const body = getRequestBody(ep);
  const lines = [`curl -X ${ep.method} "${url}" \\`, `  -H "Content-Type: application/json"`];
  if (hasBody(ep.method) && body !== null) {
    lines.push(' \\');
    lines.push(`  -d '${JSON.stringify(body)}'`);
  }
  return lines.join('\n');
}

export function buildJsSample(ep: Endpoint, baseUrl: string): string {
  const url = `${baseUrl}${ep.path}`;
  const body = getRequestBody(ep);
  const opts = [`method: "${ep.method}"`, `headers: { "Content-Type": "application/json" }`];
  if (hasBody(ep.method) && body !== null) {
    opts.push(`body: JSON.stringify(${JSON.stringify(body)})`);
  }
  return [
    `const response = await fetch("${url}", {`,
    `  ${opts.join(',\n  ')}`,
    `});`,
    ``,
    `const data = await response.json();`,
  ].join('\n');
}

export function buildPythonSample(ep: Endpoint, baseUrl: string): string {
  const url = `${baseUrl}${ep.path}`;
  const body = getRequestBody(ep);
  const lines = [`import requests`, ``];
  if (hasBody(ep.method) && body !== null) {
    lines.push(`response = requests.${ep.method.toLowerCase()}(`);
    lines.push(`    "${url}",`);
    lines.push(`    json=${JSON.stringify(body)},`);
    lines.push(`)`);
  } else {
    lines.push(`response = requests.${ep.method.toLowerCase()}("${url}")`);
  }
  lines.push(``, `data = response.json()`);
  return lines.join('\n');
}
