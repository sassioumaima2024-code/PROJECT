"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiGet } from '../../lib/api';
import AdminLayout from '../../components/layout/AdminLayout';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    apiGet('/admin/dashboard/stats')
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const kpis = stats ? [
    { name: 'Utilisateurs', value: stats.users_count, icon: '👤', trend: '+12%', color: 'bg-primary' },
    { name: 'Prestataires', value: stats.providers_count, icon: '👷', trend: '+5%', color: 'bg-secondary' },
    { name: 'Rendez-vous', value: stats.appointments_count, icon: '📅', trend: '+18%', color: 'bg-accent' },
    { name: 'Revenus (DT)', value: stats.total_revenue, icon: '💰', trend: '+24%', color: 'bg-success' },
  ] : [];

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  if (error) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-rose-100 shadow-sm animate-fade-in">
        <span className="text-6xl mb-4">🚫</span>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Accès Interrompu</h2>
        <p className="text-slate-400 mb-6 font-medium text-center px-10">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-100">
          Réessayer
        </button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* KPI Grid - Re-organized for clarity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {kpis.map((kpi, idx) => (
          <div key={kpi.name} className={`premium-card p-8 animate-fade-in hover:translate-y-[-5px] transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/60`} style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-slate-50 text-3xl shadow-inner border border-white`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-black px-3 py-1.5 rounded-lg tracking-wider ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                {kpi.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{kpi.name}</h3>
            <p className="text-4xl font-black text-slate-800 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 premium-card p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Activités Récentes</h3>
            <Link href="/users/prestataires" className="text-primary font-bold text-sm uppercase tracking-widest hover:text-primary-light transition-colors">Tout afficher</Link>
          </div>
          <div className="space-y-8">
            {stats?.latest_activity?.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                    👷
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{activity.name}</p>
                    <p className="text-slate-400 text-sm font-medium">{activity.email} • {activity.city}</p>
                  </div>
                </div>
                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                  <Link 
                    href="/users/prestataires"
                    className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all uppercase tracking-widest"
                  >
                    Gérer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-10 border-rose-100 bg-gradient-to-b from-white to-rose-50/20">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-10 flex items-center">
            Alertes Critique <span className="ml-3 text-rose-500 animate-pulse">⚠️</span>
          </h3>
          <div className="space-y-6">
            {stats?.alerts?.map((alert: any, i: number) => (
              <div key={i} className="p-6 rounded-[1.5rem] bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="flex justify-between items-start mb-4">
                  <p className="font-extrabold text-slate-800 uppercase text-xs tracking-widest">{alert.title}</p>
                  <span className="text-xs font-black bg-rose-500 text-white px-3 py-1 rounded-full">{alert.score}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{alert.description}</p>
                <button 
                  onClick={() => router.push('/users/prestataires')}
                  className="w-full py-4 bg-rose-600 text-white text-xs font-black rounded-xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all uppercase tracking-widest"
                >
                  Examiner maintenant
                </button>
              </div>
            ))}
            {(!stats?.alerts || stats.alerts.length === 0) && (
              <div className="p-10 text-center">
                <span className="text-4xl block mb-4">✨</span>
                <p className="text-slate-400 font-bold">Aucune alerte critique</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}