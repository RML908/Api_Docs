import { useState, useEffect, useCallback } from "react";
import { useListGroups, useListEndpoints } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Layers, LayoutDashboard, Book, Settings } from "lucide-react";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/30",
};

const NAV_PAGES = [
  { label: "API Reference", href: "/", icon: Book, description: "Browse published endpoints" },
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard, description: "Manage endpoints" },
  { label: "Manage Groups", href: "/admin/groups", icon: Layers, description: "Organize endpoint groups" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const { data: endpoints } = useListEndpoints();
  const { data: groups } = useListGroups();

  const groupMap = (groups ?? []).reduce<Record<number, string>>((acc, g) => {
    acc[g.id] = g.name;
    return acc;
  }, {});

  const navigate = useCallback((href: string) => {
    setLocation(href);
    onClose();
  }, [setLocation, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 gap-0 bg-card border-border max-w-xl overflow-hidden shadow-2xl">
        <Command className="rounded-none bg-transparent [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
          <div className="flex items-center border-b border-border px-3">
            <CommandInput
              placeholder="Search endpoints, pages..."
              className="h-12 border-0 outline-none ring-0 focus:ring-0 bg-transparent text-sm placeholder:text-muted-foreground"
              data-testid="input-command-search"
            />
            <kbd className="hidden md:flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto p-1">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>

            <CommandGroup heading="Pages">
              {NAV_PAGES.map((page) => (
                <CommandItem
                  key={page.href}
                  value={page.label + " " + page.description}
                  onSelect={() => navigate(page.href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer aria-selected:bg-accent"
                  data-testid={`cmd-page-${page.href.replace(/\//g, "-")}`}
                >
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <page.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {(endpoints ?? []).length > 0 && (
              <CommandGroup heading="Endpoints">
                {(endpoints ?? []).map((ep) => (
                  <CommandItem
                    key={ep.id}
                    value={`${ep.method} ${ep.path} ${ep.summary} ${groupMap[ep.groupId] ?? ""}`}
                    onSelect={() => navigate(`/?highlight=${ep.id}`)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer aria-selected:bg-accent"
                    data-testid={`cmd-endpoint-${ep.id}`}
                  >
                    <Badge
                      variant="outline"
                      className={cn("font-mono text-[10px] w-16 justify-center flex-shrink-0", methodColors[ep.method])}
                    >
                      {ep.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-foreground truncate">{ep.path}</p>
                      <p className="text-xs text-muted-foreground truncate">{ep.summary}</p>
                    </div>
                    {groupMap[ep.groupId] && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden md:block">
                        {groupMap[ep.groupId]}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {(groups ?? []).length > 0 && (
              <CommandGroup heading="Groups">
                {(groups ?? []).map((g) => (
                  <CommandItem
                    key={g.id}
                    value={`group ${g.name} ${g.description ?? ""}`}
                    onSelect={() => navigate(`/#group-${g.id}`)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer aria-selected:bg-accent"
                    data-testid={`cmd-group-${g.id}`}
                  >
                    <span className="text-lg flex-shrink-0 w-7 text-center">{g.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{g.name}</p>
                      {g.description && (
                        <p className="text-xs text-muted-foreground truncate">{g.description}</p>
                      )}
                    </div>
                    <Settings className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          <div className="border-t border-border px-3 py-2 flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
            <span><kbd className="rounded border border-border px-1">↑↓</kbd> navigate</span>
            <span><kbd className="rounded border border-border px-1">↵</kbd> select</span>
            <span><kbd className="rounded border border-border px-1">esc</kbd> close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
