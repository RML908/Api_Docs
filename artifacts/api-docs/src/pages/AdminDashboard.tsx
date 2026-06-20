import { useState } from "react";
import {
  useGetStats, getGetStatsQueryKey,
  useListGroups, getListGroupsQueryKey,
  useListEndpoints, getListEndpointsQueryKey,
  useCreateEndpoint, useUpdateEndpoint, useDeleteEndpoint,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Search, BarChart3, CheckCircle, FileText, AlertTriangle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import type { Endpoint } from "@workspace/api-client-react/src/generated/api.schemas";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const STATUSES = ["published", "draft", "deprecated"] as const;

const endpointFormSchema = z.object({
  groupId: z.coerce.number().min(1, "Select a group"),
  method: z.enum(METHODS),
  path: z.string().min(1, "Path is required"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  status: z.enum(STATUSES),
  params: z.string().optional(),
  responseExample: z.string().optional(),
  responseStatus: z.coerce.number().optional(),
});
type EndpointFormValues = z.infer<typeof endpointFormSchema>;

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/30",
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  published: { label: "Published", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  draft: { label: "Draft", cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
  deprecated: { label: "Deprecated", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
};

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | undefined; accent?: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("h-10 w-10 rounded-md flex items-center justify-center", accent ?? "bg-primary/10")}>
          <Icon className={cn("h-5 w-5", accent ? "text-current" : "text-primary")} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-mono">
            {value === undefined ? <Loader2 className="h-5 w-5 animate-spin" /> : value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EndpointFormDialog({
  open,
  onClose,
  endpoint,
}: {
  open: boolean;
  onClose: () => void;
  endpoint: Endpoint | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: groups } = useListGroups();
  const createEndpoint = useCreateEndpoint();
  const updateEndpoint = useUpdateEndpoint();

  const form = useForm<EndpointFormValues>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues: {
      groupId: endpoint?.groupId ?? 0,
      method: (endpoint?.method as typeof METHODS[number]) ?? "GET",
      path: endpoint?.path ?? "",
      summary: endpoint?.summary ?? "",
      description: endpoint?.description ?? "",
      status: (endpoint?.status as typeof STATUSES[number]) ?? "draft",
      params: endpoint?.params ?? "",
      responseExample: endpoint?.responseExample ?? "",
      responseStatus: endpoint?.responseStatus ?? 200,
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
  };

  const onSubmit = (values: EndpointFormValues) => {
    const data = {
      ...values,
      description: values.description || undefined,
      params: values.params || undefined,
      responseExample: values.responseExample || undefined,
      responseStatus: values.responseStatus || undefined,
    };

    if (endpoint) {
      updateEndpoint.mutate(
        { id: endpoint.id, data },
        {
          onSuccess: () => {
            toast({ title: "Endpoint updated" });
            invalidate();
            onClose();
          },
          onError: () => toast({ title: "Failed to update endpoint", variant: "destructive" }),
        }
      );
    } else {
      createEndpoint.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Endpoint created" });
            invalidate();
            onClose();
          },
          onError: () => toast({ title: "Failed to create endpoint", variant: "destructive" }),
        }
      );
    }
  };

  const isPending = createEndpoint.isPending || updateEndpoint.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>{endpoint ? "Edit Endpoint" : "New Endpoint"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="groupId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={field.value ? String(field.value) : undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-group">
                        <SelectValue placeholder="Select group..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups?.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-method">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="path" render={({ field }) => (
              <FormItem>
                <FormLabel>Path</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/api/v1/resource" className="font-mono" data-testid="input-path" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="summary" render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Short description" data-testid="input-summary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Detailed description (optional)" rows={2} data-testid="textarea-description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="responseStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Status</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="200" className="font-mono" data-testid="input-response-status" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="params" render={({ field }) => (
              <FormItem>
                <FormLabel>Parameters (JSON array)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='[{"name":"id","type":"integer","in":"path","required":true,"description":"Resource ID"}]'
                    rows={3}
                    className="font-mono text-xs"
                    data-testid="textarea-params"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="responseExample" render={({ field }) => (
              <FormItem>
                <FormLabel>Response Example (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='{"id":1,"name":"example"}'
                    rows={3}
                    className="font-mono text-xs"
                    data-testid="textarea-response-example"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
              <Button type="submit" disabled={isPending} data-testid="button-save">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {endpoint ? "Save Changes" : "Create Endpoint"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Endpoint | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Endpoint | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: endpoints, isLoading: endpointsLoading } = useListEndpoints(
    statusFilter !== "all" ? { status: statusFilter as "published" | "draft" | "deprecated" } : undefined
  );
  const deleteEndpoint = useDeleteEndpoint();

  const filtered = (endpoints ?? []).filter((ep) =>
    !search || ep.summary.toLowerCase().includes(search.toLowerCase()) || ep.path.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (ep: Endpoint) => { setEditTarget(ep); setDialogOpen(true); };

  const handleDelete = (ep: Endpoint) => {
    deleteEndpoint.mutate(
      { id: ep.id },
      {
        onSuccess: () => {
          toast({ title: "Endpoint deleted" });
          queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setDeleteConfirm(null);
        },
        onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and publish your API endpoints.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-endpoint">
          <Plus className="mr-2 h-4 w-4" />
          New Endpoint
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={BarChart3} label="Total" value={stats?.total} />
        <StatCard icon={CheckCircle} label="Published" value={stats?.published} accent="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={FileText} label="Draft" value={stats?.draft} accent="bg-zinc-500/10 text-zinc-400" />
        <StatCard icon={AlertTriangle} label="Deprecated" value={stats?.deprecated} accent="bg-red-500/10 text-red-400" />
        <StatCard icon={Layers} label="Groups" value={stats?.groups} accent="bg-blue-500/10 text-blue-400" />
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">All Endpoints</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter endpoints..."
                  className="pl-8 h-8 w-48 text-sm bg-background"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-36 text-sm" data-testid="select-filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {endpointsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              <FileText className="h-8 w-8 mb-2 opacity-40" />
              No endpoints found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-background/40">
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 w-20">Method</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3 hidden md:table-cell">Summary</th>
                    <th className="px-4 py-3 w-28">Status</th>
                    <th className="px-4 py-3 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((ep) => (
                    <tr key={ep.id} className="hover:bg-accent/30 transition-colors group" data-testid={`row-endpoint-${ep.id}`}>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("font-mono text-[11px] w-16 justify-center", methodColors[ep.method])}>
                          {ep.method}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{ep.path}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-xs">{ep.summary}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[11px] capitalize", statusConfig[ep.status]?.cls)}>
                          {statusConfig[ep.status]?.label ?? ep.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(ep)}
                            data-testid={`button-edit-endpoint-${ep.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteConfirm(ep)}
                            data-testid={`button-delete-endpoint-${ep.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EndpointFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        endpoint={editTarget}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Endpoint?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete{" "}
            <span className="font-mono text-foreground">{deleteConfirm?.path}</span>.
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteEndpoint.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteEndpoint.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
