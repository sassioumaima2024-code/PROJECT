'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, Navigation2, Zap, PhoneCall, X, Send, MapPin, Clock, Star } from 'lucide-react';
import Link from 'next/link';

const NEARBY_PROVIDERS = [
  { id: 1, name: 'Plomberie Express', category: 'Plomberie', distance: '850m', eta: '5 min', rating: 4.9, top: '40%', left: '30%' },
  { id: 2, name: 'ElectroFix TN', category: 'Électricité', distance: '1.2km', eta: '8 min', rating: 4.8, top: '60%', left: '70%' },
  { id: 3, name: 'Sami Artisan', category: 'Plomberie', distance: '2.5km', eta: '12 min', rating: 4.5, top: '20%', left: '60%' },
];

export default function UrgenceModePage() {
  const [userLocation, setUserLocation] = useState({ lat: 36.8065, lng: 10.1815 }); // Default: Tunis
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [needDescription, setNeedDescription] = useState('');
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    // Try to get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleDispatch = () => {
    if (!needDescription.trim()) {
      alert("Veuillez décrire brièvement l'urgence pour le prestataire.");
      return;
    }
    // Simulate real alert
    const audio = new Audio('/emergency_sent.mp3'); // Mock audio
    audio.play().catch(() => {});
    
    alert(`URGENCE ENVOYÉE ! ${selectedProvider.name} arrive vers votre position dans environ ${selectedProvider.eta}.`);
    setShowConfirmDialog(false);
    setSelectedProvider(null);
    setNeedDescription('');
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans relative overflow-hidden flex flex-col text-white">
      
      {/* INTERACTIVE MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0 }}
          src={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&output=embed`} 
          allowFullScreen
          className="grayscale brightness-[0.4] contrast-125 opacity-70"
        ></iframe>
        
        {/* Red Overlay for Emergency Mode */}
        <div className="absolute inset-0 bg-[#DC2626]/10 pointer-events-none mix-blend-color-dodge"></div>

        {/* User Center Sonar Radar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          <div className="absolute w-[300px] h-[300px] rounded-full border border-[#DC2626]/20 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-[200px] h-[200px] rounded-full border border-[#DC2626]/40 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          <div className="absolute w-[100px] h-[100px] rounded-full border border-[#DC2626]/60 animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
          
          <div className="w-12 h-12 bg-[#DC2626] rounded-full shadow-[0_0_30px_rgba(220,38,38,0.8)] flex items-center justify-center z-20 border-2 border-white">
            <ShieldAlert size={20} className="text-white" />
          </div>
        </div>

        {/* PulsingMarkers for Providers */}
        {!isSearching && NEARBY_PROVIDERS.map((provider) => (
          <div 
            key={provider.id} 
            onClick={() => setSelectedProvider(provider)}
            className={`absolute z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${selectedProvider?.id === provider.id ? 'scale-125 z-30' : ''}`}
            style={{ top: provider.top, left: provider.left }}
          >
            <div className={`p-1 rounded-full shadow-xl border-2 relative ${selectedProvider?.id === provider.id ? 'bg-white border-[#DC2626]' : 'bg-[#DC2626] border-white'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedProvider?.id === provider.id ? 'bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white' : 'bg-white text-[#DC2626]'}`}>
                {provider.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-md">
                <Zap size={12} className="text-black fill-black" />
              </div>
            </div>
            <div className={`px-2 py-1 mt-2 rounded-md shadow-lg text-[10px] font-bold ${selectedProvider?.id === provider.id ? 'bg-[#DC2626] text-white' : 'bg-white text-slate-800'}`}>
              {provider.eta}
            </div>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-20 p-6 flex justify-between items-start">
        <Link href="/client" className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-white/20 transition">
          <ArrowLeft size={24} />
        </Link>
        <div className="bg-[#DC2626] px-4 py-2 rounded-2xl shadow-lg shadow-[#DC2626]/50 flex items-center gap-2 animate-pulse">
          <ShieldAlert size={16} />
          <span className="font-bold text-white text-xs tracking-widest uppercase">Mode Urgence</span>
        </div>
      </header>

      {/* SEARCHING STATE BANNER */}
      {isSearching && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 w-max">
          <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 shadow-xl flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold text-sm">Recherche de prestataires à proximité...</span>
          </div>
        </div>
      )}

      {/* BOTTOM SLIDING LIST (NearbyProvidersList) */}
      <div className={`mt-auto relative z-20 transition-all duration-500 transform ${isSearching ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        
        {/* Gradient fade to map */}
        <div className="h-20 bg-gradient-to-t from-slate-900 to-transparent w-full absolute -top-20"></div>

        <div className="bg-slate-900 px-6 pb-8 pt-4 rounded-t-[40px] border-t border-slate-800 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6"></div>
          
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-black text-white">Prestataires Disponibles</h2>
              <p className="text-slate-400 font-medium text-sm mt-1">{NEARBY_PROVIDERS.length} professionnels prêts à intervenir</p>
            </div>
            <div className="bg-slate-800 p-2 rounded-full border border-slate-700">
              <Navigation2 size={20} className="text-[#DC2626]" />
            </div>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto hide-scrollbar">
            {NEARBY_PROVIDERS.map((provider) => (
              <div 
                key={provider.id} 
                onClick={() => setSelectedProvider(provider)}
                className={`p-4 rounded-3xl border transition cursor-pointer flex gap-4 ${selectedProvider?.id === provider.id ? 'bg-slate-800 border-[#DC2626] shadow-[0_0_20px_rgba(220,38,38,0.15)]' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex-shrink-0 flex items-center justify-center text-white font-bold text-xl relative shadow-md">
                  {provider.name.charAt(0)}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-slate-800"></div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-base leading-tight">{provider.name}</h3>
                    {/* ETABadge */}
                    <span className="text-[10px] font-black uppercase bg-[#DC2626] text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                      <Clock size={10} /> {provider.eta}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="text-slate-400">{provider.category}</span>
                    <span className="flex items-center text-slate-300"><MapPin size={12} className="mr-0.5 text-slate-500"/> {provider.distance}</span>
                    <span className="flex items-center text-[#FBBF24]"><Star size={12} fill="currentColor" className="mr-0.5" />{provider.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {selectedProvider && (
            <button 
              onClick={() => setShowConfirmDialog(true)}
              className="w-full mt-6 py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(220,38,38,0.4)] transition animate-in slide-in-from-bottom-4 flex items-center justify-center gap-2"
            >
              <Zap size={20} className="fill-white" />
              Déclencher Intervention
            </button>
          )}

        </div>
      </div>

      {/* URGENCE CONFIRM DIALOG */}
      {showConfirmDialog && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-4 pb-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldAlert size={24} className="text-[#DC2626]" /> Alerte Urgence
              </h2>
              <button onClick={() => setShowConfirmDialog(false)} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl mb-6 border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Prestataire sélectionné :</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold">
                  {selectedProvider.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{selectedProvider.name}</p>
                  <p className="text-xs text-[#10B981] font-bold">Arrivée estimée : {selectedProvider.eta}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-300 mb-2">Décrivez rapidement l'urgence :</label>
              <textarea 
                value={needDescription}
                onChange={(e) => setNeedDescription(e.target.value)}
                placeholder="Ex: Fuite d'eau importante dans la cuisine, impossible de couper le robinet..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#DC2626] h-28"
              />
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition">
                <PhoneCall size={20} /> Appeler
              </button>
              <button 
                onClick={handleDispatch}
                className="flex-1 py-4 bg-[#DC2626] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#B91C1C] shadow-[0_10px_20px_rgba(220,38,38,0.4)] transition"
              >
                <Send size={20} /> Envoyer
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 text-center mt-4">
              En envoyant cette alerte, le prestataire recevra votre position GPS exacte et votre numéro de téléphone.
            </p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
