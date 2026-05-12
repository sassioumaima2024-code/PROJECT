"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '../../../lib/api';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    apiGet(`/admin/services/${id}`)
      .then(data => {
        if (data.error) throw new Error(data.error);
        setService(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  if (error || !service) {
    return (
      <AdminLayout>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Erreur</h3>
          <p className="text-slate-400 mb-6">{error || "Impossible de charger le service."}</p>
          <Link href="/services" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-all">
            Retour aux services
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center space-x-4 animate-fade-in">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-all">
          ←
        </button>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Détails du Service / SER-00{service.id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="premium-card p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">{service.title}</h1>
                <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-xs font-bold border border-teal-100 uppercase tracking-wider">
                  {service.category?.name || 'Non Catégorisé'}
                </span>
              </div>
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${service.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {service.is_active ? '✅ Actif' : '🚫 Suspendu'}
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-3">Description du service</h3>
              <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {service.description || <span className="italic text-slate-400">Aucune description fournie par le prestataire.</span>}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Prix Minimum</span>
                <p className="text-2xl font-black text-emerald-500 mt-1">{service.price_min} DT</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Prix Maximum</span>
                <p className="text-2xl font-black text-rose-500 mt-1">{service.price_max} DT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale */}
        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="premium-card p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">👨‍🔧</span>
              Prestataire
            </h3>
            
            {service.provider ? (
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg">
                  {service.provider.email[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{service.provider.name || 'Nom non défini'}</h4>
                  <p className="text-xs text-slate-400 font-medium">{service.provider.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium italic">Prestataire introuvable ou supprimé.</p>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-50">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Expérience déclarée</span>
              <p className="text-lg font-bold text-slate-700 mt-1">{service.experience || 0} an(s)</p>
            </div>
          </div>

          <div className="premium-card p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mr-3">📍</span>
              Zones Couvertes
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {Array.isArray(service.governorates) && service.governorates.length > 0 ? (
                service.governorates.map((gov: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100">
                    {gov}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic font-medium">Toute la Tunisie</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
