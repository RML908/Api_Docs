import { useState } from "react";
import { useListGroups, useListEndpoints } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { EndpointCard } from "../components/EndpointCard";
import { Endpoint } from "@workspace/api-client-react/src/generated/api.schemas";

export default function PublicDocs() {
  const [search, setSearch] = useState("");
  const { data: groups, isLoading: groupsLoading } = useListGroups();
  const { data: endpoints, isLoading: endpointsLoading } = useListEndpoints({ status: 'published', q: search || undefined });

  if (groupsLoading || endpointsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group endpoints
  const endpointsByGroup = (endpoints || []).reduce((acc: Record<number, Endpoint[]>, ep) => {
    if (!acc[ep.groupId]) acc[ep.groupId] = [];
    acc[ep.groupId].push(ep);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
        <p className="text-muted-foreground text-lg">
          Explore our REST API endpoints. Integrations start here.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9 font-mono bg-card" 
          placeholder="Search endpoints, paths, or methods..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        {groups?.sort((a, b) => a.sortOrder - b.sortOrder).map(group => {
          const groupEndpoints = endpointsByGroup[group.id] || [];
          if (groupEndpoints.length === 0 && search) return null; // Hide empty groups when searching

          return (
            <div key={group.id} className="space-y-4" id={`group-${group.id}`}>
              <div className="border-b border-border pb-2">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  {group.name}
                </h2>
                {group.description && (
                  <p className="text-muted-foreground mt-1">{group.description}</p>
                )}
              </div>

              {groupEndpoints.length === 0 ? (
                <div className="text-muted-foreground text-sm py-4 italic">No endpoints available in this group.</div>
              ) : (
                <div className="grid gap-4">
                  {groupEndpoints.sort((a, b) => a.sortOrder - b.sortOrder).map(ep => (
                    <EndpointCard key={ep.id} endpoint={ep} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
