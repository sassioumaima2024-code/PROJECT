'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, AlertTriangle, Star, Home, Wrench, Zap, Car, Scissors, Droplet, Baby, Truck, Monitor, Paintbrush, Camera, ChefHat, Calendar, User, Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'Plomberie', icon: <Droplet size={24} /> },
  { name: 'Électricité', icon: <Zap size={24} /> },
  { name: 'Ménage', icon: <Home size={24} /> },
  { name: 'Coiffure', icon: <Scissors size={24} /> },
  { name: 'Taxi', icon: <Car size={24} /> },
  { name: 'Bricolage', icon: <Wrench size={24} /> },
  { name: 'Baby-sitter', icon: <Baby size={24} /> },
  { name: 'Déménagement', icon: <Truck size={24} /> },
  { name: 'Informatique', icon: <Monitor size={24} /> },
  { name: 'Peinture', icon: <Paintbrush size={24} /> },
  { name: 'Photographie', icon: <Camera size={24} /> },
  { name: 'Traiteur', icon: <ChefHat size={24} /> },
];

const MOCK_TOP_PROVIDERS = [
  { id: 1, name: 'Plomberie Express', category: 'Plomberie', rating: 4.9, distance: '2.5 km', reviews: 124 },
  { id: 2, name: 'Électricité Sécurité', category: 'Électricité', rating: 4.8, distance: '1.2 km', reviews: 89 },
  { id: 3, name: 'Nettoyage Pro', category: 'Ménage', rating: 4.7, distance: '3.0 km', reviews: 210 },
];

export default function ClientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Client');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token || role !== 'client') {
        router.push('/login?role=client');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // For client, we might use nomCommercial if they set it, otherwise email
          setUserName(data.nomCommercial || data.email.split('@')[0] || 'Client');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    
    fetchProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDF0F5] font-sans pb-24 relative">
      
      {/* HEADER: Rose Rubis (#9B1D54) */}
      <header className="bg-gradient-to-r from-[#9B1D54] to-[#C2185B] text-white pt-12 pb-16 px-6 rounded-b-[40px] shadow-lg relative z-20">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-[#F48FB1] text-sm font-medium">Bonjour,</p>
            <h1 className="text-2xl font-bold">{userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/client/notifications" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative hover:bg-white/30 transition">
              <Bell size={20} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#E8A020] border-2 border-[#9B1D54] rounded-full"></div>
            </Link>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer hover:bg-white/30 transition">
              <MapPin size={16} className="text-white" />
              <span className="text-sm font-semibold">Tunis, Centre</span>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY FLOATING SEARCH BAR */}
      <div className="sticky top-6 z-50 mx-6 -mt-8 mb-8">
        <Link href="/client/recherche" className="block bg-white rounded-2xl shadow-xl shadow-[#9B1D54]/20 p-2 flex items-center border border-slate-100 transition-transform hover:scale-[1.02]">
          <div className="bg-[#FDF0F5] p-3 rounded-xl text-[#9B1D54]">
            <Search size={20} />
          </div>
          <div className="flex-1 px-4 py-2 text-slate-400 font-medium">
            Que recherchez-vous ? (ex: Plombier)
          </div>
        </Link>
      </div>

      <main className="px-6 space-y-8">
        
        {/* URGENCE BUTTON (Pulsating) */}
        <Link href="/client/urgence" className="block w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C62828] to-[#E8A020] rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-[#C62828] to-[#E8A020] rounded-3xl p-5 flex items-center justify-between text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <AlertTriangle size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold tracking-wide">BESOIN URGENT ?</h2>
                <p className="text-white/80 text-sm font-medium">Trouvez un prestataire immédiatement</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white text-[#C62828] rounded-full flex items-center justify-center font-bold shadow-md transform group-hover:translate-x-1 transition">
              →
            </div>
          </div>
        </Link>

        {/* PROMO BANNER CMS */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2D1B2E] to-[#4A2B4C] text-white p-6 shadow-lg">
          <div className="relative z-10 w-2/3">
            <span className="bg-[#E8A020] text-[#92400E] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block shadow-sm">Offre Spéciale</span>
            <h3 className="text-xl font-bold leading-tight mb-3">-20% sur votre premier grand nettoyage de Printemps</h3>
            <button className="text-xs font-bold text-[#2D1B2E] bg-white px-4 py-2 rounded-xl shadow-md hover:bg-slate-100 transition">En profiter</button>
          </div>
          <div className="absolute -right-6 -bottom-6 w-40 h-40 opacity-20">
            <Sparkles size={160} className="text-[#F48FB1]" />
          </div>
        </div>

        {/* RECENTLY USED CHIPS */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Utilisés récemment</h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            <Link href="/client/recherche" className="flex items-center gap-2 bg-white pr-4 p-1.5 rounded-full border border-slate-200 shadow-sm shrink-0 hover:border-[#9B1D54] transition">
              <div className="w-8 h-8 rounded-full bg-[#E0F2F1] text-[#00897B] flex items-center justify-center"><Droplet size={14}/></div>
              <span className="text-sm font-bold text-[#2D1B2E]">Plomberie</span>
            </Link>
            <Link href="/client/recherche" className="flex items-center gap-2 bg-white pr-4 p-1.5 rounded-full border border-slate-200 shadow-sm shrink-0 hover:border-[#9B1D54] transition">
              <div className="w-8 h-8 rounded-full bg-[#FFF8E1] text-[#FFA000] flex items-center justify-center"><Zap size={14}/></div>
              <span className="text-sm font-bold text-[#2D1B2E]">Électricité</span>
            </Link>
          </div>
        </div>

        {/* CATEGORIES SCROLL */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-black text-[#2D1B2E]">Catégories</h2>
            <Link href="/client/recherche" className="text-[#C2185B] text-sm font-bold cursor-pointer hover:underline">Voir tout</Link>
          </div>
          <div className="flex overflow-x-auto pb-4 -mx-6 px-6 gap-4 hide-scrollbar">
            {CATEGORIES.map((cat, idx) => (
              <Link key={idx} href={`/client/recherche?category=${cat.name}`} className="flex flex-col items-center gap-2 min-w-[80px] group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-[#F48FB1]/30 flex items-center justify-center text-[#9B1D54] group-hover:bg-[#9B1D54] group-hover:text-white group-hover:shadow-md transition-colors cursor-pointer">
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-[#2D1B2E]">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* TOP RATED PROVIDERS */}
        <div>
          <h2 className="text-xl font-black text-[#2D1B2E] mb-4">Mieux Notés Autour De Vous</h2>
          <div className="space-y-4">
            {MOCK_TOP_PROVIDERS.map(provider => (
              <Link key={provider.id} href={`/client/prestataire?id=${provider.id}&name=${provider.name}&category=${provider.category}&rating=${provider.rating}&reviews=${provider.reviews}`} className="block bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:shadow-md transition hover:border-[#F48FB1]/50">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FDF0F5] to-[#F48FB1] flex-shrink-0 flex items-center justify-center text-[#9B1D54] relative">
                  <span className="font-bold text-2xl">{provider.name.charAt(0)}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#C2185B] bg-[#FDF0F5] px-2 py-1 rounded-md mb-1">{provider.category}</span>
                    <div className="flex items-center text-[#E8A020] bg-orange-50 px-2 py-0.5 rounded-full">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-bold ml-1">{provider.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-[#2D1B2E] text-lg leading-tight mb-1">{provider.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 gap-3">
                    <span className="flex items-center"><MapPin size={12} className="mr-1 text-[#C2185B]"/> {provider.distance}</span>
                    <span>• {provider.reviews} avis</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-3 px-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(155,29,84,0.05)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto mb-3">
          <Link href="/client" className="flex flex-col items-center gap-1 text-[#9B1D54]">
            <Home size={24} />
            <span className="text-[10px] font-bold">Accueil</span>
          </Link>
          <Link href="/client/recherche" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#9B1D54] transition cursor-pointer">
            <Search size={24} />
            <span className="text-[10px] font-semibold">Recherche</span>
          </Link>
          <Link href="/client/historique" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#9B1D54] transition cursor-pointer">
            <Calendar size={24} />
            <span className="text-[10px] font-semibold">RDV</span>
          </Link>
          <Link href="/client/profil" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#9B1D54] transition cursor-pointer">
            <User size={24} />
            <span className="text-[10px] font-semibold">Profil</span>
          </Link>
        </div>
      </nav>

      {/* CSS to hide scrollbar but keep functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
