import { useState } from "react";
import {
  useListGroups, getListGroupsQueryKey,
  useCreateGroup, useUpdateGroup, useDeleteGroup,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Layers, GripVertical } from "lucide-react";
import { z } from "zod";
import type { Group } from "@workspace/api-client-react/src/generated/api.schemas";

const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().min(1, "Icon is required"),
});
type GroupFormValues = z.infer<typeof groupFormSchema>;

function GroupFormDialog({
  open,
  onClose,
  group,
}: {
  open: boolean;
  onClose: () => void;
  group: Group | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: group?.name ?? "",
      description: group?.description ?? "",
      icon: group?.icon ?? "📁",
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
  };

  const onSubmit = (values: GroupFormValues) => {
    const data = {
      ...values,
      description: values.description || undefined,
    };

    if (group) {
      updateGroup.mutate(
        { id: group.id, data },
        {
          onSuccess: () => {
            toast({ title: "Group updated" });
            invalidate();
            onClose();
          },
          onError: () => toast({ title: "Failed to update group", variant: "destructive" }),
        }
      );
    } else {
      createGroup.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Group created" });
            invalidate();
            onClose();
          },
          onError: () => toast({ title: "Failed to create group", variant: "destructive" }),
        }
      );
    }
  };

  const isPending = createGroup.isPending || updateGroup.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{group ? "Edit Group" : "New Group"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="📁" className="text-center text-lg" data-testid="input-icon" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Authentication" data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="What endpoints live in this group?" rows={2} data-testid="textarea-description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
              <Button type="submit" disabled={isPending} data-testid="button-save">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {group ? "Save Changes" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Group | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Group | null>(null);

  const { data: groups, isLoading } = useListGroups();
  const deleteGroup = useDeleteGroup();

  const openCreate = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (g: Group) => { setEditTarget(g); setDialogOpen(true); };

  const handleDelete = (g: Group) => {
    deleteGroup.mutate(
      { id: g.id },
      {
        onSuccess: () => {
          toast({ title: "Group deleted" });
          queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
          setDeleteConfirm(null);
        },
        onError: () => toast({ title: "Failed to delete group", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Groups</h1>
          <p className="text-muted-foreground mt-1">Organize your API endpoints into logical groups.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-group">
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">Endpoint Groups</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !groups || groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Layers className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No groups yet.</p>
              <p className="text-xs mt-1 opacity-60">Create a group to start organizing endpoints.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={openCreate} data-testid="button-empty-new-group">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Create first group
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {[...groups].sort((a, b) => a.sortOrder - b.sortOrder).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors group"
                  data-testid={`row-group-${g.id}`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                  <div className="text-xl flex-shrink-0 w-8 text-center">{g.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{g.name}</p>
                    {g.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{g.description}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    #{g.id}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(g)}
                      data-testid={`button-edit-group-${g.id}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirm(g)}
                      data-testid={`button-delete-group-${g.id}`}
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

      <GroupFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        group={editTarget}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Group?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deleting <span className="font-medium text-foreground">{deleteConfirm?.name}</span> will
            also delete all its endpoints. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteGroup.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
