import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import PublicDocs from "./pages/PublicDocs";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGroups from "./pages/AdminGroups";
import AdminLogin from "./pages/AdminLogin";
import AdminApiKeys from "./pages/AdminApiKeys";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommandPalette, useCommandPalette } from "./components/CommandPalette";
import { AuthProvider } from "./hooks/use-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { open, setOpen } = useCommandPalette();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Switch>
              <Route path="/admin/login" component={AdminLogin} />
              <Route>
                {() => (
                  <Layout onOpenCommandPalette={() => setOpen(true)}>
                    <Switch>
                      <Route path="/" component={PublicDocs} />
                      <Route path="/admin">
                        {() => <ProtectedRoute component={AdminDashboard} />}
                      </Route>
                      <Route path="/admin/groups">
                        {() => <ProtectedRoute component={AdminGroups} />}
                      </Route>
                      <Route path="/admin/api-keys">
                        {() => <ProtectedRoute component={AdminApiKeys} />}
                      </Route>
                      <Route component={NotFound} />
                    </Switch>
                  </Layout>
                )}
              </Route>
            </Switch>
            <CommandPalette open={open} onClose={() => setOpen(false)} />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
