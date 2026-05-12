"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('http://127.0.0.1:8000/api/admin/appointments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAppts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  const filteredAppts = appts.filter(a => 
    (a.client?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (a.provider?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (a.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    a.id.toString().includes(searchQuery)
  );

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher un RDV...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Rendez-vous</h1>
          <p className="text-slate-400 font-medium mt-1">Suivez l'état d'avancement des demandes de services.</p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Prestataire</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAppts.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-bold text-slate-400 text-xs">#{appt.id}</td>
                <td className="p-6 font-bold text-slate-600 text-sm">{appt.scheduled_at}</td>
                <td className="p-6">
                   <p className="text-xs font-bold text-slate-800">C: {appt.client}</p>
                   <p className="text-[10px] text-teal-600 font-medium">P: {appt.provider}</p>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                    appt.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {appt.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <Link 
                    href={`/appointments/${appt.id}`}
                    className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
            {filteredAppts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  Aucun rendez-vous ne correspond à "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
