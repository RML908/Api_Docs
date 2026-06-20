import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Copy,
  Check,
  BookOpen,
  Zap,
  Shield,
  Code2,
  Terminal,
  ExternalLink,
} from "lucide-react";

const METHODS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  DELETE: "bg-red-500/15 text-red-400 border border-red-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
};

const endpoints = [
  {
    id: "auth",
    group: "Authentication",
    icon: "🔐",
    items: [
      {
        id: "login",
        method: "POST",
        path: "/api/auth/login",
        summary: "Authenticate user and receive access token",
        description:
          "Validates credentials and returns a signed JWT token for use in subsequent requests. Tokens expire after 24 hours.",
        params: [],
        body: [
          { name: "email", type: "string", required: true, desc: "User email address" },
          { name: "password", type: "string", required: true, desc: "User password (min 8 chars)" },
        ],
        response: `{\n  "token": "eyJhbGciOiJIUzI1NiJ9...",\n  "user": {\n    "id": "usr_01HX",\n    "email": "user@example.com",\n    "name": "Ada Lovelace"\n  },\n  "expires_at": "2025-06-21T00:00:00Z"\n}`,
        status: 200,
      },
      {
        id: "logout",
        method: "POST",
        path: "/api/auth/logout",
        summary: "Invalidate the current session token",
        description: "Revokes the provided token from the server-side allowlist. Pass the Bearer token in the Authorization header.",
        params: [],
        body: [],
        response: `{\n  "message": "Logged out successfully"\n}`,
        status: 200,
      },
    ],
  },
  {
    id: "users",
    group: "Users",
    icon: "👤",
    items: [
      {
        id: "list-users",
        method: "GET",
        path: "/api/users",
        summary: "List all users with optional filters",
        description: "Returns a paginated list of users. Supports filtering by role, status, and creation date range.",
        params: [
          { name: "page", type: "integer", required: false, desc: "Page number (default: 1)" },
          { name: "limit", type: "integer", required: false, desc: "Items per page (max: 100)" },
          { name: "role", type: "string", required: false, desc: "Filter by role: admin | member | viewer" },
        ],
        body: [],
        response: `{\n  "data": [\n    {\n      "id": "usr_01HX",\n      "name": "Ada Lovelace",\n      "email": "ada@example.com",\n      "role": "admin",\n      "created_at": "2025-01-15T09:00:00Z"\n    }\n  ],\n  "pagination": {\n    "page": 1,\n    "total": 48,\n    "pages": 5\n  }\n}`,
        status: 200,
      },
      {
        id: "get-user",
        method: "GET",
        path: "/api/users/:id",
        summary: "Retrieve a single user by ID",
        description: "Returns the full profile of a user. Admins can access any user; members can only access their own profile.",
        params: [
          { name: "id", type: "string", required: true, desc: "User ID (e.g. usr_01HX)" },
        ],
        body: [],
        response: `{\n  "id": "usr_01HX",\n  "name": "Ada Lovelace",\n  "email": "ada@example.com",\n  "role": "admin",\n  "avatar_url": "https://cdn.example.com/avatars/ada.jpg",\n  "created_at": "2025-01-15T09:00:00Z"\n}`,
        status: 200,
      },
      {
        id: "create-user",
        method: "POST",
        path: "/api/users",
        summary: "Create a new user account",
        description: "Creates a new user and sends a verification email. Requires admin privileges.",
        params: [],
        body: [
          { name: "name", type: "string", required: true, desc: "Full display name" },
          { name: "email", type: "string", required: true, desc: "Unique email address" },
          { name: "role", type: "string", required: false, desc: "User role (default: member)" },
        ],
        response: `{\n  "id": "usr_02JY",\n  "name": "Grace Hopper",\n  "email": "grace@example.com",\n  "role": "member",\n  "created_at": "2025-06-20T12:00:00Z"\n}`,
        status: 201,
      },
      {
        id: "delete-user",
        method: "DELETE",
        path: "/api/users/:id",
        summary: "Delete a user account",
        description: "Permanently removes a user and all associated data. This action is irreversible.",
        params: [{ name: "id", type: "string", required: true, desc: "User ID to delete" }],
        body: [],
        response: `{\n  "message": "User deleted successfully"\n}`,
        status: 200,
      },
    ],
  },
  {
    id: "resources",
    group: "Resources",
    icon: "📦",
    items: [
      {
        id: "list-resources",
        method: "GET",
        path: "/api/resources",
        summary: "Fetch all available resources",
        description: "Returns resources the authenticated user has access to. Results are sorted by updated_at descending.",
        params: [
          { name: "type", type: "string", required: false, desc: "Filter by resource type" },
          { name: "q", type: "string", required: false, desc: "Full-text search query" },
        ],
        body: [],
        response: `{\n  "data": [\n    {\n      "id": "res_9Kx",\n      "type": "document",\n      "title": "API Overview",\n      "updated_at": "2025-06-20T10:30:00Z"\n    }\n  ]\n}`,
        status: 200,
      },
      {
        id: "update-resource",
        method: "PATCH",
        path: "/api/resources/:id",
        summary: "Partially update a resource",
        description: "Updates only the specified fields of a resource. Omitted fields remain unchanged.",
        params: [{ name: "id", type: "string", required: true, desc: "Resource ID" }],
        body: [
          { name: "title", type: "string", required: false, desc: "New title" },
          { name: "status", type: "string", required: false, desc: "published | draft | archived" },
        ],
        response: `{\n  "id": "res_9Kx",\n  "title": "Updated API Overview",\n  "status": "published",\n  "updated_at": "2025-06-20T14:00:00Z"\n}`,
        status: 200,
      },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function EndpointCard({ ep }: { ep: (typeof endpoints)[0]["items"][0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-700/30 transition-colors text-left"
      >
        <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${METHODS[ep.method]}`}>{ep.method}</span>
        <code className="text-slate-200 font-mono text-sm flex-1">{ep.path}</code>
        <span className="text-slate-400 text-sm hidden md:block">{ep.summary}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-700/60 px-5 py-5 space-y-5">
          <p className="text-slate-300 text-sm leading-relaxed">{ep.description}</p>

          {ep.params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Parameters</h4>
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                {ep.params.map((p, i) => (
                  <div key={p.name} className={`flex items-start gap-4 px-4 py-3 ${i > 0 ? "border-t border-slate-700/40" : ""}`}>
                    <code className="text-violet-300 font-mono text-xs w-28 shrink-0 pt-0.5">{p.name}</code>
                    <span className="text-slate-500 text-xs w-16 shrink-0 pt-0.5">{p.type}</span>
                    <span className="text-slate-300 text-xs flex-1">{p.desc}</span>
                    {p.required && <span className="text-red-400 text-xs">required</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ep.body.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Request Body</h4>
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                {ep.body.map((b, i) => (
                  <div key={b.name} className={`flex items-start gap-4 px-4 py-3 ${i > 0 ? "border-t border-slate-700/40" : ""}`}>
                    <code className="text-blue-300 font-mono text-xs w-28 shrink-0 pt-0.5">{b.name}</code>
                    <span className="text-slate-500 text-xs w-16 shrink-0 pt-0.5">{b.type}</span>
                    <span className="text-slate-300 text-xs flex-1">{b.desc}</span>
                    {b.required && <span className="text-red-400 text-xs">required</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {ep.status}
                </span>
                <CopyButton text={ep.response} />
              </div>
            </div>
            <pre className="bg-slate-900/80 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto border border-slate-700/40">
              {ep.response}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApiDocs() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("auth");

  const filtered = endpoints
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (ep) =>
          ep.path.toLowerCase().includes(search.toLowerCase()) ||
          ep.summary.toLowerCase().includes(search.toLowerCase()) ||
          ep.method.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const activeGroup = filtered.find((g) => g.id === active) ?? filtered[0];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-700/60 bg-[#0d1117]/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">DevAPI</span>
            <span className="text-slate-600 text-sm">Docs</span>
            <span className="ml-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
              v2.4
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
              <BookOpen className="w-3.5 h-3.5" /> Guides
            </a>
            <a href="#" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
              <Terminal className="w-3.5 h-3.5" /> Playground
            </a>
            <button className="text-xs bg-violet-600 hover:bg-violet-500 transition-colors px-3 py-1.5 rounded-lg text-white font-medium">
              Get API Key
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex flex-1 px-6 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <div className="sticky top-22">
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search endpoints…"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Endpoints</p>
              {filtered.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActive(g.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    active === g.id
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.group}</span>
                  <span className="ml-auto text-xs text-slate-500">{g.items.length}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Resources</p>
              {[
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Quick Start" },
                { icon: <Shield className="w-3.5 h-3.5" />, label: "Authentication" },
                { icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Rate Limits" },
                { icon: <Code2 className="w-3.5 h-3.5" />, label: "SDKs" },
              ].map((r) => (
                <button
                  key={r.label}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {activeGroup && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{activeGroup.icon}</span>
                  <h1 className="text-xl font-semibold text-slate-100">{activeGroup.group}</h1>
                </div>
                <p className="text-slate-400 text-sm">
                  {activeGroup.items.length} endpoint{activeGroup.items.length !== 1 ? "s" : ""} — click any row to expand
                </p>
              </div>

              {/* Base URL */}
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 mb-6">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Base URL</span>
                <code className="text-violet-300 font-mono text-sm flex-1">https://api.example.com</code>
                <CopyButton text="https://api.example.com" />
              </div>

              <div className="space-y-3">
                {activeGroup.items.map((ep) => (
                  <EndpointCard key={ep.id} ep={ep} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
