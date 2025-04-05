import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth-context";
import { useEffect, Suspense, lazy } from "react";

// Layouts and common components
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import Design from "@/pages/design";
import Inventory from "@/pages/inventory";
import Production from "@/pages/production";
import Analytics from "@/pages/analytics";
import Payments from "@/pages/payments";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected routes */}
      <Route path="/">
        {user ? (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/design">
        <ProtectedRoute>
          <Design />
        </ProtectedRoute>
      </Route>
      <Route path="/inventory">
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      </Route>
      <Route path="/production">
        <ProtectedRoute>
          <Production />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      <Route path="/payments">
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isAuthPage = location === "/login" || location === "/register";

  return (
    <QueryClientProvider client={queryClient}>
      {!isAuthPage && user ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col h-full overflow-y-auto bg-secondary-50">
            <Router />
          </main>
          <MobileNav />
        </div>
      ) : (
        <Router />
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
