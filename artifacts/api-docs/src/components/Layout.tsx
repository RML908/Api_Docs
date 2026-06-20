import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Book, Settings, Layers, Menu, ServerCrash, Search, LogOut, LogIn } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
  onOpenCommandPalette?: () => void;
}

export function Layout({ children, onOpenCommandPalette }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: health } = useHealthCheck();
  const { isAdmin, isLoading, logout } = useAuth();

  const publicLinks = [
    { href: "/", label: "API Reference", icon: Book },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Dashboard", icon: Settings },
    { href: "/admin/groups", label: "Manage Groups", icon: Layers },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

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

        {/* ⌘K search trigger */}
        <div className="px-2 pt-2">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground hover:bg-accent/60 transition-colors"
            data-testid="button-open-command-palette"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden md:flex items-center gap-0.5 rounded border border-border px-1 py-0.5 text-[9px] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2 pt-2">
          {/* Public nav */}
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          {/* Admin nav — only shown when logged in */}
          {!isLoading && isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Admin</p>
              </div>
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href} className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {/* Login link — only when not admin */}
          {!isLoading && !isAdmin && (
            <div className="pt-2">
              <Link href="/admin/login" className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground/60 hover:text-muted-foreground"
              )}>
                <LogIn className="h-4 w-4" />
                Admin login
              </Link>
            </div>
          )}
        </nav>

        {/* Footer: status + logout */}
        <div className="border-t border-border">
          {isAdmin && (
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-8"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          )}
          <div className="p-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>System Status:</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", health?.status === 'ok' ? 'bg-green-500' : 'bg-destructive animate-pulse')} />
              {health?.status === 'ok' ? 'Online' : 'Checking'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="font-mono font-bold tracking-tight text-sm flex-1">API_PORTAL</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCommandPalette}
            className="h-8 w-8"
            data-testid="button-mobile-search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
