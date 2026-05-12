"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '../../../lib/api';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appt, setAppt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    apiGet(`/admin/appointments/${id}`)
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAppt(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  if (error) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
        <span className="text-6xl mb-4">⚠️</span>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Erreur</h2>
        <p className="text-slate-400 mb-6 font-medium">{error}</p>
        <button onClick={() => router.push('/appointments')} className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-100">
          Retour aux rendez-vous
        </button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-10 flex items-center justify-between animate-fade-in">
        <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-primary transition-colors font-bold text-sm">
          <span className="mr-2 text-lg">←</span> Retour
        </button>
        <div className="flex space-x-3">
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
            appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
            appt.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {appt.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="premium-card p-8">
            <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 text-xl">📅</span>
              Rendez-vous #{appt.id}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Date prévue</span>
                <p className="text-lg font-bold text-slate-700 mt-1">{new Date(appt.scheduled_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                <p className="text-sm font-medium text-slate-400">{new Date(appt.scheduled_at).toLocaleTimeString('fr-FR', { timeStyle: 'short' })}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Service demandé</span>
                <p className="text-lg font-bold text-primary mt-1">{appt.service?.title}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-3">Description / Note</h3>
              <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {appt.description || <span className="italic text-slate-400">Aucune note particulière fournie.</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="premium-card p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mr-3 text-sm">👤</span>
              Client
            </h3>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg">
                {appt.client.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{appt.client.name}</h4>
                <p className="text-xs text-slate-400">{appt.client.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Téléphone</span>
              <p className="font-bold text-slate-700 mt-1">{appt.client.phone || 'Non renseigné'}</p>
            </div>
          </div>

          <div className="premium-card p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mr-3 text-sm">👷</span>
              Prestataire
            </h3>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                {appt.provider.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{appt.provider.name}</h4>
                <p className="text-xs text-slate-400">{appt.provider.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Téléphone</span>
              <p className="font-bold text-slate-700 mt-1">{appt.provider.phone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
