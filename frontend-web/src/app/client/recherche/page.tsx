'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Mic, SlidersHorizontal, Map, List, MapPin, Star, ChevronDown, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const MOCK_PROVIDERS = [
  { id: 1, name: 'Plomberie Express', category: 'Plomberie', rating: 4.9, distance: '2.5 km', price: '50 DT / h', reviews: 124, exp: '10 ans' },
  { id: 2, name: 'Ahmed B. Artisan', category: 'Électricité', rating: 4.8, distance: '1.2 km', price: '40 DT / h', reviews: 89, exp: '5 ans' },
  { id: 3, name: 'Nettoyage Pro', category: 'Ménage', rating: 4.7, distance: '3.0 km', price: '25 DT / h', reviews: 210, exp: '3 ans' },
  { id: 4, name: 'ElectroFix', category: 'Électricité', rating: 4.5, distance: '4.5 km', price: '45 DT / h', reviews: 45, exp: '8 ans' },
  { id: 5, name: 'Sami Plombier', category: 'Plomberie', rating: 4.6, distance: '5.2 km', price: '55 DT / h', reviews: 67, exp: '12 ans' },
];

const CATEGORIES = [
  'Plomberie', 'Électricité', 'Ménage', 'Coiffure', 'Taxi', 'Bricolage', 
  'Baby-sitter', 'Déménagement', 'Informatique', 'Peinture', 'Photographie', 'Traiteur'
];

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isMapView, setIsMapView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [priceRange, setPriceRange] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [experience, setExperience] = useState(5);
  const [distance, setDistance] = useState(10);
  const [sortBy, setSortBy] = useState('Pertinence');
  const [showSort, setShowSort] = useState(false);

  // Synchronize category if changed via URL
  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Filtering Logic
  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === '' || p.category === activeCategory;
      const matchesRating = p.rating >= minRating;
      
      return matchesSearch && matchesCategory && matchesRating;
    }).sort((a, b) => {
      if (sortBy === 'Note') return b.rating - a.rating;
      if (sortBy === 'Prix') return parseInt(a.price) - parseInt(b.price);
      return 0;
    });
  }, [searchQuery, activeCategory, minRating, sortBy]);

  return (
    <div className="min-h-screen bg-[#FDF0F5] font-sans relative overflow-hidden flex flex-col">
      
      {/* HEADER & SEARCH */}
      <header className="bg-white px-6 pt-12 pb-4 shadow-sm z-20 relative">
        <div className="flex gap-3 items-center mb-4">
          <Link href="/client" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-4 py-3 shadow-sm focus-within:border-[#9B1D54] transition">
            <Search size={20} className="text-[#9B1D54]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (ex: Plombier)" 
              className="flex-1 bg-transparent border-none outline-none px-3 text-[#2D1B2E] font-medium placeholder:text-slate-400"
            />
            <Mic size={20} className="text-slate-400 cursor-pointer" />
          </div>
          <button onClick={() => setShowFilters(true)} className="w-12 h-12 bg-[#9B1D54] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#9B1D54]/30 hover:bg-[#C2185B] transition">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Sort & Quick Filters */}
        <div className="flex items-center justify-between text-sm relative z-30">
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1 font-bold text-[#2D1B2E] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition">
              {sortBy} <ChevronDown size={14} className={`transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 py-2 w-40 z-50 animate-in slide-in-from-top-2 fade-in">
                {['Pertinence', 'Prix', 'Note', 'Distance'].map(sortOption => (
                  <button 
                    key={sortOption}
                    onClick={() => { setSortBy(sortOption); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-bold transition ${sortBy === sortOption ? 'text-[#9B1D54] bg-[#FDF0F5]' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {sortOption}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar no-wrap ml-4">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap border transition ${activeCategory === cat ? 'bg-[#9B1D54] text-white border-transparent' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT (MAP OR LIST) */}
      <main className="flex-1 relative z-10 overflow-y-auto hide-scrollbar">
        {isMapView ? (
          /* MAP VIEW */
          <div className="absolute inset-0 z-0 h-full">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0 }}
              src="https://www.google.com/maps?q=Tunis&output=embed" 
              allowFullScreen
              className="grayscale brightness-90 contrast-125"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none">
              {filteredProviders.map((p, i) => (
                <div key={p.id} className="absolute flex flex-col items-center group pointer-events-auto cursor-pointer" style={{ top: `${20 + (i*15)}%`, left: `${30 + (i*10)}%` }}>
                  <div className="bg-[#9B1D54] text-white px-2 py-1 rounded-lg font-bold text-xs shadow-md mb-1 group-hover:scale-110 transition">{p.rating}★</div>
                  <MapPin size={32} className="text-[#C2185B] drop-shadow-md" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="p-6 space-y-4 pb-32">
            {filteredProviders.length > 0 ? filteredProviders.map((provider) => (
              <Link 
                href={`/client/prestataire?id=${provider.id}&name=${provider.name}&category=${provider.category}&rating=${provider.rating}&reviews=${provider.reviews}&exp=${provider.exp}&price=${provider.price}`} 
                key={provider.id} 
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:shadow-md transition group"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FDF0F5] to-[#F48FB1] flex-shrink-0 flex items-center justify-center text-[#9B1D54] relative overflow-hidden">
                  <span className="font-bold text-3xl group-hover:scale-110 transition">{provider.name.charAt(0)}</span>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#00897B] rounded-full border-2 border-white flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-[#C2185B] bg-[#FDF0F5] px-2 py-1 rounded-md">{provider.category}</span>
                    <span className="font-bold text-[#2D1B2E] text-sm">{provider.price}</span>
                  </div>
                  <h3 className="font-bold text-[#2D1B2E] text-lg leading-tight mb-1">{provider.name}</h3>
                  
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <div className="flex items-center text-[#E8A020] bg-orange-50 px-2 py-0.5 rounded-full">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-bold ml-1">{provider.rating} ({provider.reviews})</span>
                    </div>
                    <span className="flex items-center text-slate-500 text-xs font-semibold"><MapPin size={12} className="mr-1"/> {provider.distance}</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center py-20 opacity-40">
                <Search size={64} className="mx-auto mb-4" />
                <p className="font-bold">Aucun résultat trouvé</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FLOATING MAP TOGGLE BUTTON */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button 
          onClick={() => setIsMapView(!isMapView)}
          className="bg-[#2D1B2E] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_10px_25px_rgba(45,27,46,0.4)] hover:scale-105 transition"
        >
          {isMapView ? <><List size={20}/> Voir la liste</> : <><Map size={20}/> Carte</>}
        </button>
      </div>

      {/* FILTER BOTTOM SHEET */}
      {showFilters && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-[#2D1B2E]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#2D1B2E]">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto hide-scrollbar pb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-[#2D1B2E]">Prix maximum</label>
                  <span className="font-bold text-[#9B1D54]">{priceRange} DT</span>
                </div>
                <input type="range" min="10" max="300" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#9B1D54]" />
              </div>

              <div>
                <label className="font-bold text-[#2D1B2E] block mb-3">Note minimum</label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5, 4.9].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setMinRating(star)}
                      className={`flex-1 py-2 rounded-xl border flex justify-center items-center gap-1 font-bold transition ${minRating === star ? 'bg-[#FFFBEB] border-[#E8A020] text-[#E8A020]' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      {star === 0 ? 'Toutes' : star} <Star size={14} fill={minRating === star && star !== 0 ? 'currentColor' : 'transparent'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-[#2D1B2E]">Expérience minimum</label>
                  <span className="font-bold text-[#9B1D54]">{experience} ans</span>
                </div>
                <input type="range" min="0" max="20" value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#9B1D54]" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-[#2D1B2E]">Distance max</label>
                  <span className="font-bold text-[#9B1D54]">{distance} km</span>
                </div>
                <input type="range" min="1" max="50" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#9B1D54]" />
              </div>

              <button onClick={() => setShowFilters(false)} className="w-full bg-[#9B1D54] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#9B1D54]/30 hover:bg-[#C2185B] transition mt-4">
                Afficher les résultats ({filteredProviders.length})
              </button>
            </div>
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
