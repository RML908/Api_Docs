import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ErrorBoundaryPage } from '@/pages/ErrorBoundaryPage';

// Public pages
import PublicDocs from '@/pages/public/PublicDocs';
import PublicChangelog from '@/pages/public/PublicChangelog';

// Auth pages
import LoginPage from '@/pages/admin/LoginPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminGroups from '@/pages/admin/AdminGroups';
import AdminEndpoints from '@/pages/admin/AdminEndpoints';
import AdminChangelog from '@/pages/admin/AdminChangelog';
import AdminApiKeys from '@/pages/admin/AdminApiKeys';

// Error pages
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { index: true, element: <PublicDocs /> },
      { path: 'changelog', element: <PublicChangelog /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'groups', element: <AdminGroups /> },
          { path: 'endpoints', element: <AdminEndpoints /> },
          { path: 'changelog', element: <AdminChangelog /> },
          { path: 'api-keys', element: <AdminApiKeys /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
