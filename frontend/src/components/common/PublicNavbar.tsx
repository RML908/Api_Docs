import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-sm font-medium transition-colors', isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900');

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <img src="/dst-logo.webp" alt="DST" className="h-7 w-auto" />
            <span>API Docs</span>
          </NavLink>
          <nav className="hidden items-center gap-4 sm:flex">
            <NavLink to="/" end className={navLinkClass}>
              Documentation
            </NavLink>
            <NavLink to="/changelog" className={navLinkClass}>
              Changelog
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
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
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 sm:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 sm:hidden">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Documentation
          </NavLink>
          <NavLink to="/changelog" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Changelog
          </NavLink>
          {isAuthenticated ? (
            <NavLink
              to="/admin"
              className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="mt-2 rounded-md border border-gray-300 px-3 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
