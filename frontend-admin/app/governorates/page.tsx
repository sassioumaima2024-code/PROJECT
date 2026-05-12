"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '../../components/layout/AdminLayout';

const TunisiaMap = dynamic(() => import('../../components/map/TunisiaMap'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-50 rounded-2xl flex items-center justify-center animate-pulse text-slate-400 font-medium">Chargement de la carte interactive...</div>
});

export default function GovernoratesPage() {
  const [govs, setGovs] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGov, setSelectedGov] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    Promise.all([
      fetch('http://127.0.0.1:8000/api/admin/governorates', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/admin/services', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([govsData, servicesData]) => {
        if (Array.isArray(govsData)) setGovs(govsData);
        if (Array.isArray(servicesData)) setServices(servicesData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleMapClick = (govName: string) => {
    setSelectedGov(govName);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = selectedGov 
    ? services.filter(s => s.governorates && s.governorates.some((g: any) => 
        g.toLowerCase().includes(selectedGov.toLowerCase()) || selectedGov.toLowerCase().includes(g.toLowerCase())
      ))
    : [];

  const filteredGovs = govs.filter(gov => 
    (gov.name_fr?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (gov.name_ar?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (gov.code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher une région...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gouvernorats de Tunisie</h1>
          <p className="text-slate-400 font-medium mt-1">Gestion de la couverture géographique de SERVICY.</p>
        </div>
        {selectedGov && (
          <div className="bg-teal-50 text-teal-700 px-6 py-3 rounded-2xl font-black border border-teal-100 flex items-center space-x-2">
            <span>📍</span>
            <span>Sélection : {selectedGov}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <div className="xl:col-span-2">
          <TunisiaMap onGovernorateClick={handleMapClick} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[500px] overflow-y-auto">
          {selectedGov ? (
            <>
              <div className="flex items-center justify-between sticky top-0 bg-white pb-4 mb-4 border-b border-slate-50 z-10">
                <h3 className="text-lg font-black text-slate-800">
                  Services à <span className="text-primary">{selectedGov}</span>
                </h3>
                <button onClick={() => setSelectedGov(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">Retour</button>
              </div>
              
              {filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <span className="text-4xl mb-3">📭</span>
                  <p className="text-slate-400 font-medium text-sm">Aucun service disponible pour le moment dans cette région.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredServices.map(service => (
                    <div key={service.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">{service.title}</h4>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">{service.price_min} DT</span>
                      </div>
                      <span className="inline-block px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-bold">
                        {typeof service.category === 'object' ? service.category.name : service.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-black text-slate-800 mb-6 sticky top-0 bg-white pb-2 border-b border-slate-50 z-10">Régions Couvertes</h3>
              
              {filteredGovs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="text-slate-400 font-medium text-sm">Aucune région trouvée pour "{searchQuery}".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGovs.map((gov) => (
                    <div 
                      key={gov.id} 
                      className="p-4 rounded-xl flex items-center space-x-4 transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 hover:shadow-sm"
                      onClick={() => setSelectedGov(gov.name_fr)}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black bg-teal-50 text-teal-600">
                        {gov.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{gov.name_fr}</h4>
                        <p className="text-[10px] text-slate-400">{gov.name_ar}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
