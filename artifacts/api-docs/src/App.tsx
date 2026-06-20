import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import PublicDocs from "./pages/PublicDocs";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGroups from "./pages/AdminGroups";
import { Layout } from "./components/Layout";
import { CommandPalette, useCommandPalette } from "./components/CommandPalette";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicDocs} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/groups" component={AdminGroups} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { open, setOpen } = useCommandPalette();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout onOpenCommandPalette={() => setOpen(true)}>
            <Router />
          </Layout>
          <CommandPalette open={open} onClose={() => setOpen(false)} />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
