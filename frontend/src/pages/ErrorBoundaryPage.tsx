import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export function ErrorBoundaryPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
    ? error.message
    : 'An unexpected error occurred';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600">Oops!</h1>
      <p className="text-gray-600">{message}</p>
      <Link to="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Back to home
      </Link>
    </div>
  );
}
