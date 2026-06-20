import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Plus, Trash2, Copy, Check, Key, ShieldOff,
  Clock, Terminal, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ApiKeyRecord {
  id: number;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

interface NewKeyResult extends ApiKeyRecord {
  key: string;
}

async function fetchKeys(): Promise<ApiKeyRecord[]> {
  const res = await fetch(`${BASE}/api/admin/api-keys`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch keys");
  return res.json();
}

async function createKey(name: string): Promise<NewKeyResult> {
  const res = await fetch(`${BASE}/api/admin/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create key");
  return res.json();
}

async function revokeKey(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/api-keys/${id}/revoke`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to revoke key");
}

async function deleteKey(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/api-keys/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete key");
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost" size="icon"
      className={cn("h-7 w-7 flex-shrink-0", className)}
      onClick={copy}
      data-testid="button-copy-key"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function NewKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [result, setResult] = useState<NewKeyResult | null>(null);

  const mutation = useMutation({
    mutationFn: createKey,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast({ title: "Failed to create key", variant: "destructive" }),
  });

  const handleClose = () => {
    setName("");
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>

        {!result ? (
          <>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Key Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CI Pipeline, My Script, Production Bot"
                  onKeyDown={(e) => e.key === "Enter" && name && mutation.mutate(name)}
                  autoFocus
                  data-testid="input-key-name"
                />
                <p className="text-xs text-muted-foreground">
                  Give it a descriptive name so you know what's using it.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} data-testid="button-cancel">Cancel</Button>
              <Button
                disabled={!name.trim() || mutation.isPending}
                onClick={() => mutation.mutate(name.trim())}
                data-testid="button-generate-key"
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Key
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Copy this key now — it will <strong>never be shown again</strong>.</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your API Key
                </label>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background p-3">
                  <code className="flex-1 text-xs font-mono text-primary break-all" data-testid="text-api-key">
                    {result.key}
                  </code>
                  <CopyButton text={result.key} />
                </div>
              </div>

              <div className="rounded-md border border-border bg-background p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage</p>
                <div className="flex items-center gap-2">
                  <pre className="flex-1 text-xs font-mono text-muted-foreground overflow-x-auto">
                    {`curl -H "Authorization: Bearer ${result.key}" \\
  /api/endpoints`}
                  </pre>
                  <CopyButton text={`Authorization: Bearer ${result.key}`} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} data-testid="button-done">Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminApiKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ApiKeyRecord | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: fetchKeys,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeKey,
    onSuccess: () => {
      toast({ title: "Key revoked" });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast({ title: "Failed to revoke", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKey,
    onSuccess: () => {
      toast({ title: "Key deleted" });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setDeleteConfirm(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Keys allow scripts and CI pipelines to call protected API endpoints without a browser session.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-create-key">
          <Plus className="mr-2 h-4 w-4" />
          New Key
        </Button>
      </div>

      {/* How it works */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            How to use
          </CardTitle>
          <CardDescription className="text-xs">
            Pass the key as a Bearer token in the Authorization header on any write request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="rounded-md border border-border bg-zinc-950 p-4 text-xs font-mono space-y-2">
            <p className="text-zinc-500"># Create a group</p>
            <p className="text-zinc-300">
              curl -X POST /api/groups \<br />
              {"  "}<span className="text-emerald-400">-H "Authorization: Bearer apk_your_key"</span> \<br />
              {"  "}-H "Content-Type: application/json" \<br />
              {"  "}-d '{`{"name":"Payments","icon":"💳"}`}'
            </p>
            <div className="border-t border-border/50 pt-2 mt-2">
              <p className="text-zinc-500"># Create an endpoint</p>
              <p className="text-zinc-300">
                curl -X POST /api/endpoints \<br />
                {"  "}<span className="text-emerald-400">-H "Authorization: Bearer apk_your_key"</span> \<br />
                {"  "}-H "Content-Type: application/json" \<br />
                {"  "}-d '{`{"groupId":1,"method":"POST","path":"/pay","summary":"Charge card","status":"draft"}`}'
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Read endpoints (<code className="text-primary">GET /api/groups</code>, <code className="text-primary">GET /api/endpoints</code>) are public — no key needed.
          </p>
        </CardContent>
      </Card>

      {/* Keys list */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Active Keys</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !keys || keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Key className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No API keys yet.</p>
              <p className="text-xs mt-1 opacity-60">Create one to enable programmatic access.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setCreateOpen(true)} data-testid="button-empty-create-key">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Create first key
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-accent/20 transition-colors group"
                  data-testid={`row-api-key-${k.id}`}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0",
                    k.isActive ? "bg-emerald-500/10" : "bg-zinc-500/10"
                  )}>
                    <Key className={cn("h-4 w-4", k.isActive ? "text-emerald-500" : "text-zinc-500")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{k.name}</p>
                      {k.isActive ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-zinc-500/10 text-zinc-400 border-zinc-500/30">Revoked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <code className="text-xs font-mono text-muted-foreground">{k.keyPrefix}••••••••</code>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last used: {formatRelative(k.lastUsedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {k.isActive && (
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 gap-1.5"
                        onClick={() => revokeMutation.mutate(k.id)}
                        disabled={revokeMutation.isPending}
                        data-testid={`button-revoke-key-${k.id}`}
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                        Revoke
                      </Button>
                    )}
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirm(k)}
                      data-testid={`button-delete-key-${k.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewKeyDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete API Key?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deleting <span className="font-medium text-foreground">{deleteConfirm?.name}</span> will permanently remove it.
            Any scripts using this key will immediately lose access.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
