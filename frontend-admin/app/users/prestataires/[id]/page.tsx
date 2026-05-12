"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/layout/AdminLayout';
import { apiGet, apiPatch } from '../../../../lib/api';
import Link from 'next/link';

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const data = await apiGet(`/admin/providers/${id}`);
    if (data.error) {
      setError(data.error);
    } else {
      setProvider(data);
    }
    setLoading(false);
  };

  const validateProvider = async () => {
    const data = await apiPatch(`/admin/providers/${id}/validate`, {});
    if (!data.error) {
      fetchData();
    }
  };

  const toggleStatus = async () => {
    const data = await apiPatch(`/admin/users/${id}/toggle`, {});
    if (!data.error) {
      fetchData();
    }
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;
  if (error) return <AdminLayout><div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100">{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4 animate-fade-in">
        <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{provider.name || "Détail Prestataire"}</h1>
          <p className="text-slate-400 font-medium text-sm">Identifiant Unique: PRE-{provider.id.toString().padStart(4, '0')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8 animate-slide-up">
          <div className="premium-card p-8 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-rose-700 text-white flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-2xl shadow-primary/20 uppercase">
              {provider.name ? provider.name[0] : provider.email[0]}
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">{provider.name || provider.email.split('@')[0]}</h2>
            <p className="text-slate-400 font-medium mb-6">{provider.email}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${provider.is_active ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {provider.is_active ? 'Actif' : 'Suspendu'}
              </span>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${provider.is_verified ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                {provider.is_verified ? 'Vérifié' : 'En attente'}
              </span>
            </div>

            <div className="space-y-3">
              {!provider.is_verified && (
                <button 
                  onClick={validateProvider}
                  className="w-full py-4 bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all"
                >
                  Valider le compte
                </button>
              )}
              <button 
                onClick={toggleStatus}
                className={`w-full py-4 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all ${provider.is_active ? 'bg-rose-600 shadow-rose-100 hover:bg-rose-700' : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700'}`}
              >
                {provider.is_active ? 'Suspendre le compte' : 'Réactiver le compte'}
              </button>
            </div>
          </div>

          <div className="premium-card p-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Informations Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</p>
                  <p className="font-bold text-slate-700">{provider.phone || "Non renseigné"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gouvernorat</p>
                  <p className="font-bold text-slate-700">{provider.governorate || "Non renseigné"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre depuis</p>
                  <p className="font-bold text-slate-700">{provider.created_at}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="lg:col-span-2 space-y-8 animate-slide-up delay-100">
          <div className="premium-card p-8">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-3 h-8 bg-teal-500 rounded-lg"></span>
              Services Proposés
            </h3>
            
            {provider.services?.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucun service actif pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {provider.services.map((service: any) => (
                  <div key={service.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-white rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-wider shadow-sm">
                        {service.category}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'}`}></span>
                    </div>
                    <h4 className="font-black text-slate-800 mb-2 group-hover:text-primary transition-colors">{service.title}</h4>
                    <p className="text-primary font-black text-sm">{service.price_min} - {service.price_max} TND</p>
                    <Link href={`/services/${service.id}`} className="mt-6 block">
                      <button className="w-full py-3 bg-white text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md hover:bg-primary hover:text-white transition-all">
                        Détails du service
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="premium-card p-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Statistiques & Performance</h3>
              <p className="text-slate-400 text-sm mb-8">Analyse des revenus et des avis clients.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rendez-vous</p>
                  <p className="text-2xl font-black">24</p>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Note Moyenne</p>
                  <p className="text-2xl font-black">4.8</p>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenus</p>
                  <p className="text-2xl font-black">1.2k <span className="text-xs">TND</span></p>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taux Succès</p>
                  <p className="text-2xl font-black">96%</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
