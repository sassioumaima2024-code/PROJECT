'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Heart, CheckCircle2, Zap, Star, MapPin, Clock, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProviderProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const providerName = searchParams.get('name') || 'Prestataire';
  const category = searchParams.get('category') || 'Services';
  const rating = searchParams.get('rating') || '4.5';
  const reviewsCount = searchParams.get('reviews') || '0';
  const exp = searchParams.get('exp') || '2 ans';
  const price = searchParams.get('price') || '50 DT / h';
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/api/reviews/${id}`)
        .then(res => res.json())
        .then(resData => {
          setReviews(resData.data || []);
        })
        .catch(err => console.error("Error fetching reviews:", err));
    }
  }, [id]);

  const data = {
    portfolio: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=400",
      "https://images.unsplash.com/photo-1607472586893-edb57cb3b4e1?q=80&w=400",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=400"
    ],
    reviews: reviews.length > 0 ? reviews : [
      { client: "Client", comment: "Aucun avis pour le moment.", rating: 5 }
    ]
  };

  return (
    <div className="min-h-screen bg-[#FDF0F5] font-sans relative pb-28">
      
      {/* 1. HeroProfileHeader */}
      <div className="relative h-64 bg-slate-900">
        <img 
          src={data.portfolio[0]} 
          alt={providerName} 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* Top Navigation */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
              <Share2 size={18} />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)} 
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
            >
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-lg shrink-0 relative">
              <div className="w-full h-full bg-gradient-to-br from-[#9B1D54] to-[#F48FB1] rounded-xl flex items-center justify-center text-white font-black text-3xl">
                {providerName.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#10B981] border-2 border-white rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white leading-tight">{providerName}</h1>
              </div>
              <p className="text-slate-300 text-sm font-medium flex items-center gap-1">
                {category} • <Star size={14} className="text-[#E8A020] fill-[#E8A020]" /> {rating} ({reviewsCount} avis)
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="px-6 mt-6 space-y-6 relative z-10">
        
        {/* Badges Row */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DC2626] text-white rounded-lg text-xs font-bold shrink-0 shadow-sm shadow-red-500/20">
            <Zap size={14} className="fill-white" /> DISPONIBLE URGENCE
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8A020]/20 text-[#92400E] border border-[#E8A020]/30 rounded-lg text-xs font-bold shrink-0">
            <Clock size={14} /> {exp} d'expérience
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold shrink-0">
            <MapPin size={14} /> Tunis, Ariana
          </div>
        </div>

        {/* 5. AboutSection */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-black text-[#2D1B2E] mb-3">À propos</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Spécialiste en {category.toLowerCase()} avec {exp} d'expérience. Interventions de qualité garanties, travail soigné et respect des délais. Disponible pour répondre à vos besoins spécifiques.
          </p>
        </section>

        {/* 8. WorkingHoursTable */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-black text-[#2D1B2E] mb-4 flex items-center"><Calendar size={18} className="mr-2 text-[#9B1D54]" /> Horaires d'ouverture</h2>
          <div className="space-y-3">
            {[
              { day: 'Lundi - Vendredi', hours: '08:00 - 18:00', open: true },
              { day: 'Samedi', hours: '09:00 - 14:00', open: true },
              { day: 'Dimanche', hours: 'Fermé', open: false },
            ].map((schedule, i) => (
              <div key={i} className="flex justify-between items-center text-sm font-medium border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-600">{schedule.day}</span>
                <span className={schedule.open ? 'text-[#2D1B2E] font-bold' : 'text-slate-400 font-bold'}>{schedule.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. PortfolioGallery */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-[#2D1B2E]">Réalisations</h2>
            <button className="text-[#C2185B] text-sm font-bold">Voir tout</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 row-span-2 bg-slate-200 rounded-2xl aspect-[3/4] overflow-hidden">
              <img src={data.portfolio[0]} alt="Realisation" className="w-full h-full object-cover hover:scale-105 transition duration-500 cursor-pointer" />
            </div>
            <div className="col-span-1 bg-slate-200 rounded-2xl aspect-square overflow-hidden">
              <img src={data.portfolio[1]} alt="Realisation" className="w-full h-full object-cover hover:scale-105 transition duration-500 cursor-pointer" />
            </div>
            <div className="col-span-1 bg-slate-200 rounded-2xl aspect-square overflow-hidden relative cursor-pointer group">
              <img src={data.portfolio[2]} alt="Realisation" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-[#9B1D54]/80 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+4</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. RatingOverview & ReviewsList */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-black text-[#2D1B2E] mb-6">Avis Clients</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#2D1B2E]">{rating}</span>
              <div className="flex text-[#E8A020] my-1">
                <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
              </div>
              <span className="text-xs font-semibold text-slate-400">{reviews} avis</span>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const percent = star === 5 ? '85%' : star === 4 ? '10%' : star === 3 ? '5%' : '0%';
                return (
                  <div key={star} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>{star}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E8A020] rounded-full" style={{ width: percent }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {data.reviews.map((rev: any, idx: number) => (
              <div key={idx} className="border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FCE4EC] text-[#9B1D54] rounded-full flex items-center justify-center font-bold text-sm">{rev.client ? rev.client.charAt(0) : 'U'}</div>
                    <div>
                      <h4 className="font-bold text-[#2D1B2E] text-sm">{rev.client}</h4>
                      <p className="text-[10px] font-semibold text-slate-400">{rev.date || 'Avis récent'}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-[#FFFBEB] px-2 py-1 rounded-lg">
                    <Star size={12} className="text-[#D4A017] fill-[#D4A017] mr-1" />
                    <span className="text-xs font-bold text-[#92400E]">{rev.rating}.0</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {rev.comment}
                </p>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="bg-[#FDF0F5] text-[#9B1D54] px-2 py-1 rounded-md flex items-center"><Clock size={10} className="mr-1" /> Ponctuel</span>
                  <span className="bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded-md flex items-center"><CheckCircle size={10} className="mr-1" /> Propre</span>
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">
              Afficher les {reviewsCount} avis
            </button>
          </div>
        </section>
      </main>

      {/* 9. StickyBookingBar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Tarif moyen</p>
          <p className="text-xl font-black text-[#2D1B2E]">{price}</p>
        </div>
        <Link 
          href={`/client/reservation?name=${providerName}&price=${price}`} 
          className="bg-[#9B1D54] hover:bg-[#831846] text-white px-8 py-3.5 rounded-2xl font-bold text-lg shadow-lg shadow-[#9B1D54]/30 transition"
        >
          Réserver
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
