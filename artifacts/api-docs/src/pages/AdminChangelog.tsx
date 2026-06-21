import { useState } from "react";
import {
  useListChangelogs,
  useCreateChangelog,
  useUpdateChangelog,
  useDeleteChangelog,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListChangelogsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Globe, Lock, Loader2, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Changelog } from "@workspace/api-client-react/src/generated/api.schemas";

const VERSION_COLORS: Record<string, string> = {
  v1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  v2: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  v3: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const VERSIONS = ["v1", "v2", "v3"];

interface FormState {
  version: string;
  title: string;
  content: string;
  publishedAt: string;
}

const defaultForm = (): FormState => ({
  version: "v1",
  title: "",
  content: "",
  publishedAt: "",
});

function ChangelogForm({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Changelog;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() =>
    existing
      ? {
          version: existing.version,
          title: existing.title,
          content: existing.content,
          publishedAt: existing.publishedAt
            ? new Date(existing.publishedAt).toISOString().split("T")[0]
            : "",
        }
      : defaultForm()
  );

  const create = useCreateChangelog();
  const update = useUpdateChangelog();
  const isPending = create.isPending || update.isPending;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListChangelogsQueryKey() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const data = {
      version: form.version,
      title: form.title.trim(),
      content: form.content.trim(),
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
    };

    if (existing) {
      update.mutate(
        { id: existing.id, data },
        {
          onSuccess: () => {
            toast({ title: "Changelog updated" });
            invalidate();
            onClose();
          },
          onError: () => toast({ title: "Failed to update", variant: "destructive" }),
        }
      );
    } else {
      create.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Changelog created" });
            invalidate();
            onClose();
          },
          onError: () => toast({ title: "Failed to create", variant: "destructive" }),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Changelog" : "New Changelog Entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Version</Label>
              <Select value={form.version} onValueChange={(v) => setForm({ ...form, version: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERSIONS.map((v) => (
                    <SelectItem key={v} value={v}>{v.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Publish Date <span className="text-muted-foreground text-xs">(leave blank for draft)</span></Label>
              <Input
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Cursor pagination, MFA support, unified content feed"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Content <span className="text-muted-foreground text-xs">(plain text, line breaks supported)</span></Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={`What's new in ${form.version.toUpperCase()}:\n\n• New: cursor-based pagination on GET /users\n• Changed: unified /content feed replaces /posts and /articles\n• Deprecated: offset-based pagination (removed in v3)`}
              rows={8}
              className="font-mono text-sm resize-y"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {existing ? "Save changes" : "Create entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminChangelog() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Changelog | undefined>();
  const [deleting, setDeleting] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: changelogs, isLoading } = useListChangelogs();
  const deleteChangelog = useDeleteChangelog();

  const sorted = [...(changelogs ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleDelete = (id: number) => {
    setDeleting(id);
    deleteChangelog.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Entry deleted" });
          queryClient.invalidateQueries({ queryKey: getListChangelogsQueryKey() });
        },
        onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
        onSettled: () => setDeleting(null),
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Publish release notes per API version — visible publicly on the Changelog page.
          </p>
        </div>
        <Button onClick={() => { setEditing(undefined); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          New entry
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3 border border-dashed border-border rounded-lg">
          <ScrollText className="h-10 w-10 opacity-20" />
          <p className="text-sm">No entries yet — create your first changelog.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => {
            const isPublished = !!entry.publishedAt;
            const versionColor = VERSION_COLORS[entry.version] ?? "bg-gray-500/10 text-gray-400 border-gray-500/30";
            const dateLabel = isPublished
              ? new Date(entry.publishedAt!).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "Draft";

            return (
              <div
                key={entry.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-border/80 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("font-mono text-[11px] px-2 py-0.5 rounded border font-semibold shrink-0", versionColor)}>
                      {entry.version.toUpperCase()}
                    </span>
                    <span className="font-medium truncate">{entry.title}</span>
                    {isPublished ? (
                      <Badge variant="outline" className="text-[10px] gap-1 text-green-500 border-green-500/30 bg-green-500/10 shrink-0">
                        <Globe className="h-2.5 w-2.5" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground shrink-0">
                        <Lock className="h-2.5 w-2.5" /> Draft
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{dateLabel}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{entry.content}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => { setEditing(entry); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={deleting === entry.id}
                    onClick={() => handleDelete(entry.id)}
                  >
                    {deleting === entry.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ChangelogForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        existing={editing}
      />
    </div>
  );
}
