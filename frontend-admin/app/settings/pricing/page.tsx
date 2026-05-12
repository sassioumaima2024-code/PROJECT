"use client";
import { useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function PricingSettingsPage() {
  const [commission, setCommission] = useState(15);
  const [minPrice, setMinPrice] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Paramètres des Prix</h1>
        <p className="text-slate-400 font-medium mt-1">Configurez les règles tarifaires globales de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-10 animate-fade-in">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-4 text-xl">💰</span>
            Commission Plateforme
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Taux de commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={commission} 
                  onChange={(e) => setCommission(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">%</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed italic">
              Ce taux sera prélevé sur chaque transaction effectuée via SERVICY.
            </p>
          </div>
        </div>

        <div className="premium-card p-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center">
            <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mr-4 text-xl">🛡️</span>
            Limites Tarifaires
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Prix minimum autorisé (DT)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">DT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button 
          onClick={handleSave}
          className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center space-x-3 ${
            saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary-light shadow-primary/20'
          }`}
        >
          {saved ? (
            <>
              <span>✓</span>
              <span>Paramètres enregistrés</span>
            </>
          ) : (
            <span>Enregistrer les modifications</span>
          )}
        </button>
      </div>
    </AdminLayout>
  );
}
