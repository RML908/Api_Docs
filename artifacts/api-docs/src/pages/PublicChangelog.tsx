import { useState } from "react";
import { useListChangelogs } from "@workspace/api-client-react";
import { Loader2, ScrollText, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Changelog } from "@workspace/api-client-react/src/generated/api.schemas";

const VERSION_COLORS: Record<string, string> = {
  v1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  v2: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  v3: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

function ChangelogEntry({ entry }: { entry: Changelog }) {
  const isPublished = !!entry.publishedAt;
  const date = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Draft";

  const versionColor = VERSION_COLORS[entry.version] ?? "bg-gray-500/10 text-gray-400 border-gray-500/30";

  return (
    <div className="relative pl-6 pb-10 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-0 top-2 bottom-0 w-px bg-border" />
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-[-4px] top-2 h-2 w-2 rounded-full border-2 border-background",
        isPublished ? "bg-primary" : "bg-muted-foreground/40"
      )} />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn("font-mono text-xs px-2 py-0.5 rounded-md border font-semibold", versionColor)}>
              {entry.version.toUpperCase()}
            </span>
            <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isPublished
              ? <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
              : <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />}
            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{date}</span>
          </div>
        </div>

        {/* Content rendered as markdown-lite */}
        <div className="p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </div>
      </div>
    </div>
  );
}

export default function PublicChangelog() {
  const [activeVersion, setActiveVersion] = useState<string>("all");
  const { data: changelogs, isLoading } = useListChangelogs();

  const published = (changelogs ?? []).filter((c) => !!c.publishedAt);
  const versions = ["all", ...new Set(published.map((c) => c.version)).values()].sort();

  const filtered = activeVersion === "all"
    ? published
    : published.filter((c) => c.version === activeVersion);

  // Sort newest first by publishedAt
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="text-muted-foreground text-lg">
          What's new, fixed, and changed — by version.
        </p>
      </div>

      {/* Version filter */}
      {versions.length > 1 && (
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          {versions.map((v) => (
            <button
              key={v}
              onClick={() => setActiveVersion(v)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-mono font-medium transition-colors",
                activeVersion === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {v === "all" ? "All versions" : v.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <ScrollText className="h-12 w-12 opacity-20" />
          <p>No changelog entries published yet.</p>
        </div>
      ) : (
        <div className="max-w-3xl">
          {sorted.map((entry) => (
            <ChangelogEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
