import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  BookOpen,
  Users,
  Layers,
  Settings,
  Search,
  ChevronDown,
  BarChart2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GripVertical,
  Code2,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHOD_COLORS: Record<Method, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  DELETE: "bg-red-500/15 text-red-400 border border-red-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
};

type Endpoint = {
  id: number;
  method: Method;
  path: string;
  summary: string;
  group: string;
  status: "published" | "draft" | "deprecated";
  lastEdited: string;
};

const initialEndpoints: Endpoint[] = [
  { id: 1, method: "POST", path: "/api/auth/login", summary: "Authenticate user and receive access token", group: "Authentication", status: "published", lastEdited: "2 hours ago" },
  { id: 2, method: "POST", path: "/api/auth/logout", summary: "Invalidate the current session token", group: "Authentication", status: "published", lastEdited: "2 hours ago" },
  { id: 3, method: "GET", path: "/api/users", summary: "List all users with optional filters", group: "Users", status: "published", lastEdited: "1 day ago" },
  { id: 4, method: "GET", path: "/api/users/:id", summary: "Retrieve a single user by ID", group: "Users", status: "published", lastEdited: "1 day ago" },
  { id: 5, method: "POST", path: "/api/users", summary: "Create a new user account", group: "Users", status: "published", lastEdited: "1 day ago" },
  { id: 6, method: "DELETE", path: "/api/users/:id", summary: "Delete a user account permanently", group: "Users", status: "draft", lastEdited: "3 days ago" },
  { id: 7, method: "GET", path: "/api/resources", summary: "Fetch all available resources", group: "Resources", status: "published", lastEdited: "5 days ago" },
  { id: 8, method: "PATCH", path: "/api/resources/:id", summary: "Partially update a resource", group: "Resources", status: "deprecated", lastEdited: "2 weeks ago" },
];

const GROUPS = ["Authentication", "Users", "Resources", "Webhooks", "Analytics"];

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  deprecated: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

type Tab = "endpoints" | "groups" | "settings";

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-start gap-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("endpoints");
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editing, setEditing] = useState<Endpoint | null>(null);
  const [adding, setAdding] = useState(false);
  const [newEp, setNewEp] = useState<Partial<Endpoint>>({ method: "GET", status: "draft", group: "Authentication" });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = endpoints.filter((ep) => {
    const matchSearch =
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.summary.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === "All" || ep.group === filterGroup;
    const matchStatus = filterStatus === "All" || ep.status === filterStatus;
    return matchSearch && matchGroup && matchStatus;
  });

  const saveEdit = () => {
    if (!editing) return;
    setEndpoints((prev) => prev.map((e) => (e.id === editing.id ? { ...editing, lastEdited: "just now" } : e)));
    setEditing(null);
    showToast("Endpoint updated");
  };

  const deleteEp = (id: number) => {
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
    showToast("Endpoint deleted");
  };

  const addEp = () => {
    if (!newEp.path || !newEp.summary) return;
    const ep: Endpoint = {
      id: Date.now(),
      method: newEp.method as Method,
      path: newEp.path!,
      summary: newEp.summary!,
      group: newEp.group ?? "Authentication",
      status: newEp.status as Endpoint["status"],
      lastEdited: "just now",
    };
    setEndpoints((prev) => [ep, ...prev]);
    setAdding(false);
    setNewEp({ method: "GET", status: "draft", group: "Authentication" });
    showToast("Endpoint added");
  };

  const toggleStatus = (id: number) => {
    setEndpoints((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === "published" ? "draft" : "published", lastEdited: "just now" } : e
      )
    );
  };

  const publishedCount = endpoints.filter((e) => e.status === "published").length;
  const draftCount = endpoints.filter((e) => e.status === "draft").length;
  const groups = [...new Set(endpoints.map((e) => e.group))];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-52 border-r border-slate-700/60 flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-700/60">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">DevAPI</p>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">Content</p>
          {([
            { id: "endpoints", label: "Endpoints", icon: <Layers className="w-4 h-4" /> },
            { id: "groups", label: "Groups", icon: <Tag className="w-4 h-4" /> },
            { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
          ] as const).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                tab === item.id
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 pt-4">Insights</p>
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
            <BookOpen className="w-4 h-4" /> Changelog
          </button>
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
            <Users className="w-4 h-4" /> Team
          </button>
        </nav>
        <div className="p-3 border-t border-slate-700/60">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">A</div>
            <div className="min-w-0">
              <p className="text-xs text-slate-200 truncate">Ada Lovelace</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-slate-700/60 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-slate-100 capitalize">{tab}</h1>
            <p className="text-xs text-slate-500">Manage your API documentation content</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800">
              <Eye className="w-3.5 h-3.5" /> Preview Docs
            </a>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 transition-colors px-3 py-1.5 rounded-lg text-white font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Endpoint
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Endpoints" value={endpoints.length} sub="across all groups" icon={<Layers className="w-4 h-4 text-violet-400" />} color="bg-violet-500/15" />
            <StatCard label="Published" value={publishedCount} sub="visible to users" icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} color="bg-emerald-500/15" />
            <StatCard label="Drafts" value={draftCount} sub="awaiting review" icon={<AlertCircle className="w-4 h-4 text-amber-400" />} color="bg-amber-500/15" />
            <StatCard label="Groups" value={groups.length} sub="endpoint categories" icon={<Tag className="w-4 h-4 text-blue-400" />} color="bg-blue-500/15" />
          </div>

          {/* Add endpoint form */}
          {adding && (
            <div className="bg-slate-800/60 border border-violet-500/40 rounded-xl p-5 mb-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" /> New Endpoint
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Method</label>
                  <select
                    value={newEp.method}
                    onChange={(e) => setNewEp({ ...newEp, method: e.target.value as Method })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Group</label>
                  <select
                    value={newEp.group}
                    onChange={(e) => setNewEp({ ...newEp, group: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    {GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Path</label>
                  <input
                    placeholder="/api/path"
                    value={newEp.path ?? ""}
                    onChange={(e) => setNewEp({ ...newEp, path: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Status</label>
                  <select
                    value={newEp.status}
                    onChange={(e) => setNewEp({ ...newEp, status: e.target.value as Endpoint["status"] })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Summary</label>
                  <input
                    placeholder="Describe what this endpoint does..."
                    value={newEp.summary ?? ""}
                    onChange={(e) => setNewEp({ ...newEp, summary: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setAdding(false)} className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={addEp} className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Endpoint
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
              />
            </div>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500/60"
            >
              <option value="All">All Groups</option>
              {groups.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500/60"
            >
              <option value="All">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="deprecated">Deprecated</option>
            </select>
            <span className="text-xs text-slate-500 ml-auto">{filtered.length} endpoints</span>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-700/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Endpoint</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Group</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Edited</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ep, i) => (
                  editing?.id === ep.id ? (
                    <tr key={ep.id} className="border-b border-violet-500/30 bg-violet-500/5">
                      <td className="px-4 py-3" colSpan={5}>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <select
                            value={editing.method}
                            onChange={(e) => setEditing({ ...editing, method: e.target.value as Method })}
                            className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                          >
                            {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map((m) => <option key={m}>{m}</option>)}
                          </select>
                          <input
                            value={editing.path}
                            onChange={(e) => setEditing({ ...editing, path: e.target.value })}
                            className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500"
                          />
                          <select
                            value={editing.group}
                            onChange={(e) => setEditing({ ...editing, group: e.target.value })}
                            className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                          >
                            {GROUPS.map((g) => <option key={g}>{g}</option>)}
                          </select>
                          <input
                            value={editing.summary}
                            onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                            className="col-span-2 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                          />
                          <select
                            value={editing.status}
                            onChange={(e) => setEditing({ ...editing, status: e.target.value as Endpoint["status"] })}
                            className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="deprecated">Deprecated</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditing(null)} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                          <button onClick={saveEdit} className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                            <Save className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={ep.id} className={`border-b border-slate-700/40 hover:bg-slate-800/30 transition-colors group ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono shrink-0 ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                          <code className="text-slate-200 text-xs font-mono">{ep.path}</code>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-10">{ep.summary}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400 bg-slate-700/40 px-2.5 py-1 rounded-full">{ep.group}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(ep.id)}
                          className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-all ${STATUS_STYLE[ep.status]}`}
                        >
                          {ep.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ep.lastEdited}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button
                            onClick={() => setEditing(ep)}
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteEp(ep.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500 text-sm">
                      No endpoints match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
