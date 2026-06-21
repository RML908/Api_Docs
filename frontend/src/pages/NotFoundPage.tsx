import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-xl font-semibold text-gray-700">Page not found</p>
      <Link to="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Back to home
      </Link>
    </div>
  );
}
