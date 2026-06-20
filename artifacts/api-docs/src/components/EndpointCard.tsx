import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Copy, Terminal } from "lucide-react";
import { Endpoint, EndpointMethod } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [isOpen, setIsOpen] = useState(false);

  let parsedParams = [];
  try {
    if (endpoint.params) parsedParams = JSON.parse(endpoint.params);
  } catch (e) {
    console.error("Failed to parse params", e);
  }

  let parsedResponse = null;
  try {
    if (endpoint.responseExample) parsedResponse = JSON.parse(endpoint.responseExample);
  } catch (e) {
    // If it fails, we'll just show the raw string
    parsedResponse = endpoint.responseExample;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-lg border border-border bg-card overflow-hidden">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={cn("font-mono text-xs w-16 justify-center", methodColors[endpoint.method] || "bg-gray-500/10 text-gray-500")}>
            {endpoint.method}
          </Badge>
          <span className="font-mono text-sm tracking-tight text-foreground">{endpoint.path}</span>
          <span className="text-muted-foreground text-sm hidden md:inline-block truncate max-w-md">{endpoint.summary}</span>
        </div>
        <div className="flex items-center gap-2">
          {endpoint.version && (
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border hidden sm:inline-flex">
              {endpoint.version.toUpperCase()}
            </Badge>
          )}
          {endpoint.status === 'deprecated' && <Badge variant="destructive" className="text-xs scale-90">Deprecated</Badge>}
          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-background/50 grid gap-6">
          {endpoint.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{endpoint.description}</p>
          )}

          {parsedParams.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</h4>
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-card border-b border-border">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">In</th>
                      <th className="px-4 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedParams.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-2 font-mono text-primary flex items-center gap-2">
                          {p.name}
                          {p.required && <span className="text-[10px] text-destructive bg-destructive/10 px-1 rounded">req</span>}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.type || 'string'}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.in || 'query'}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {endpoint.responseExample && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Response Example
                {endpoint.responseStatus && <Badge variant="outline" className="font-mono text-[10px] scale-90">{endpoint.responseStatus}</Badge>}
              </h4>
              <div className="relative group">
                <pre className="p-4 rounded-md bg-zinc-950 border border-border/50 overflow-x-auto text-sm font-mono text-zinc-300">
                  <code>
                    {typeof parsedResponse === 'object' ? JSON.stringify(parsedResponse, null, 2) : parsedResponse}
                  </code>
                </pre>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-100"
                  onClick={() => {
                    navigator.clipboard.writeText(typeof parsedResponse === 'object' ? JSON.stringify(parsedResponse, null, 2) : parsedResponse);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
