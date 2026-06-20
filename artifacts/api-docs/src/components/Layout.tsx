import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Book, Settings, Layers, Menu, ServerCrash } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const links = [
    { href: "/", label: "API Reference", icon: Book },
    { href: "/admin", label: "Admin Dashboard", icon: Settings },
    { href: "/admin/groups", label: "Manage Groups", icon: Layers },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background dark text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex sticky top-0 h-screen">
        <div className="flex h-14 items-center px-4 border-b border-border">
          <div className="flex items-center gap-2 font-mono font-bold tracking-tight">
            <ServerCrash className="h-5 w-5 text-primary" />
            <span>API_PORTAL</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>System Status:</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", health?.status === 'ok' ? 'bg-green-500' : 'bg-destructive animate-pulse')} />
            {health?.status === 'ok' ? 'Online' : 'Checking'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="font-mono font-bold tracking-tight text-sm">API_PORTAL</div>
        </header>
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
