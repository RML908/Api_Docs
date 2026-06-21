import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, CheckCircle, FileText, AlertTriangle, FolderOpen } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useStats();
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.username}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total Endpoints" value={data?.total ?? 0} icon={Zap} color="bg-blue-50 text-blue-600" />
          <StatCard label="Published" value={data?.published ?? 0} icon={CheckCircle} color="bg-green-50 text-green-600" />
          <StatCard label="Draft" value={data?.draft ?? 0} icon={FileText} color="bg-gray-100 text-gray-600" />
          <StatCard label="Deprecated" value={data?.deprecated ?? 0} icon={AlertTriangle} color="bg-red-50 text-red-600" />
          <StatCard label="Groups" value={data?.groups ?? 0} icon={FolderOpen} color="bg-purple-50 text-purple-600" />
        </div>
      )}
    </div>
  );
}
