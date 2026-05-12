"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/layout/AdminLayout';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('http://127.0.0.1:8000/api/admin/services', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  const filteredServices = services.filter(service => {
    const q = searchQuery.toLowerCase();
    return (
      (service.title?.toLowerCase() || '').includes(q) ||
      (service.provider?.name?.toLowerCase() || '').includes(q) ||
      (typeof service.category === 'object' ? service.category.name : service.category)?.toLowerCase().includes(q) ||
      (`SER-00${service.id}`).toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher un service...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Catalogue des Services</h1>
          <p className="text-slate-400 font-medium mt-1">Gérez l'ensemble des prestations proposées par vos experts.</p>
        </div>
        <button 
          onClick={() => router.push('/settings/pricing')}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-light transition-all flex items-center space-x-3 uppercase text-xs tracking-widest"
        >
          <span>⚙️</span>
          <span>Paramètres des prix</span>
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun service trouvé</h3>
            <p className="text-slate-400">Aucun service ne correspond à votre recherche "{searchQuery}"</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Service / Expert</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Gamme de Prix</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredServices.map((service, idx) => (
                <tr 
                  key={service.id} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/services/${service.id}`)}
                >
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
                        S{service.id}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{service.title}</p>
                        <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tight">{service.provider?.name || 'Expert inconnu'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-xs font-bold border border-teal-100">
                      {typeof service.category === 'object' ? service.category.name : 'Général'}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-slate-600 text-sm">
                    {service.price_min} - {service.price_max} DT
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${service.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${service.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span>{service.is_active ? 'Actif' : 'Suspendu'}</span>
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <Link href={`/services/${service.id}`} className="inline-block p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-primary hover:bg-teal-50 transition-all">
                      👁️
                    </Link>
                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500 transition-all">🚫</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
