import { useState } from "react";
import { useListGroups, useListEndpoints } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Layers } from "lucide-react";
import { EndpointCard } from "../components/EndpointCard";
import { cn } from "@/lib/utils";
import type { Endpoint } from "@workspace/api-client-react/src/generated/api.schemas";

const VERSIONS = ["all", "v1", "v2", "v3"] as const;
type VersionFilter = typeof VERSIONS[number];

export default function PublicDocs() {
  const [search, setSearch] = useState("");
  const [version, setVersion] = useState<VersionFilter>("all");

  const { data: groups, isLoading: groupsLoading } = useListGroups();
  const { data: endpoints, isLoading: endpointsLoading } = useListEndpoints({
    status: "published",
    q: search || undefined,
    version: version !== "all" ? version : undefined,
  });

  const isLoading = groupsLoading || endpointsLoading;

  const endpointsByGroup = (endpoints ?? []).reduce<Record<number, Endpoint[]>>((acc, ep) => {
    if (!acc[ep.groupId]) acc[ep.groupId] = [];
    acc[ep.groupId].push(ep);
    return acc;
  }, {});

  const activeGroups = (groups ?? [])
    .filter((g) => (endpointsByGroup[g.id]?.length ?? 0) > 0 || !search)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const usedVersions = [...new Set((endpoints ?? []).map((e) => e.version).filter(Boolean))].sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
        <p className="text-muted-foreground text-lg">
          Explore our REST API endpoints. Integrations start here.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 font-mono bg-card"
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        {/* Version tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {VERSIONS.filter((v) => v === "all" || usedVersions.includes(v) || usedVersions.length === 0).map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-mono font-medium transition-colors",
                version === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              data-testid={`button-version-${v}`}
            >
              {v === "all" ? "All versions" : v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (groups ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <Layers className="h-12 w-12 opacity-20" />
          <p>No endpoints published yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {activeGroups.map((group) => {
            const groupEndpoints = (endpointsByGroup[group.id] ?? []).sort(
              (a, b) => a.sortOrder - b.sortOrder
            );
            if (groupEndpoints.length === 0 && search) return null;

            return (
              <div key={group.id} className="space-y-4" id={`group-${group.id}`}>
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <span>{group.icon}</span>
                      {group.name}
                    </h2>
                    {group.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{group.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {groupEndpoints.length} endpoint{groupEndpoints.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {groupEndpoints.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic py-4">
                    No endpoints in this group match the current filters.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {groupEndpoints.map((ep) => (
                      <EndpointCard key={ep.id} endpoint={ep} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
