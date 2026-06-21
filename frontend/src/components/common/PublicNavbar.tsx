import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <BookOpen className="h-5 w-5 text-blue-600" />
            DST API Docs
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn('text-sm font-medium transition-colors', isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900')
              }
            >
              Documentation
            </NavLink>
            <NavLink
              to="/changelog"
              className={({ isActive }) =>
                cn('text-sm font-medium transition-colors', isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900')
              }
            >
              Changelog
            </NavLink>
          </nav>
        </div>
        <div>
          {isAuthenticated ? (
            <NavLink
              to="/admin"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Admin
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
