import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PublicNavbar } from '@/components/common/PublicNavbar';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <PublicNavbar />
        <main>
          <Outlet />
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </ErrorBoundary>
  );
}
