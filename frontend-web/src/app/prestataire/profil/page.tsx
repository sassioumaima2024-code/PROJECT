'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Star, Edit2, Share2, Globe, MessageCircle, Clock, ShieldCheck, MapPin, ThumbsUp, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/');
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [profileRes, reviewsRes] = await Promise.all([
          fetch('http://localhost:8000/api/profile', { headers }),
          fetch('http://localhost:8000/api/provider/reviews', { headers })
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9FF]">
        <div className="w-12 h-12 border-4 border-[#4F3D8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = profile || {
    nomCommercial: 'Prestataire',
    categories: [],
    governorates: [],
    profilePhoto: null,
    averageRating: 0
  };
  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans pb-24">
      
      {/* 1. ProfileHeroSection */}
      <div className="relative bg-white shadow-sm mb-6 pb-6 rounded-b-[40px]">
        {/* Cover Photo */}
        <div className="h-40 bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] w-full relative">
          <Link href="/prestataire" className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-10">
            <ArrowLeft size={20} />
          </Link>
          
          {/* Share Buttons */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
              <Globe size={18} />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>

        {/* Avatar & Info */}
        <div className="px-6 relative -mt-16 text-center flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-lg mb-4 flex items-center justify-center relative">
            <span className="text-4xl font-bold text-[#4F3D8A]">
              {user.nomCommercial ? user.nomCommercial.charAt(0) : 'P'}
            </span>
            {/* Verified Badge */}
            {user.isVerified && (
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#10B981] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <CheckCircle2 size={16} className="text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-black text-[#1E1B3A]">{user.nomCommercial}</h1>
          <p className="text-[#7C5CBF] font-bold text-sm mb-2">{Array.isArray(user.categories) ? user.categories.join(', ') : user.categories}</p>
          
          <div className="flex items-center justify-center gap-4 text-sm font-semibold text-slate-600 mb-4">
            <span className="flex items-center"><MapPin size={16} className="mr-1 text-[#D4A017]" /> {Array.isArray(user.governorates) ? user.governorates.join(', ') : user.governorates}</span>
            <span className="flex items-center"><Star size={16} className="mr-1 text-[#D4A017] fill-[#D4A017]" /> {user.averageRating || '0.0'} ({reviews.length} avis)</span>
          </div>

          {/* DocumentStatusCard */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] text-[#059669] rounded-full text-xs font-bold border border-[#A7F3D0]">
            <ShieldCheck size={16} /> Documents vérifiés par SERVICY
          </div>
        </div>
      </div>

      <main className="px-6 space-y-6">
        
        {/* 2. EditableInfoSection */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1E1B3A]">À propos</h2>
            <button className="text-[#4F3D8A] bg-[#F3F0FF] p-2 rounded-xl hover:bg-[#E0D4FF] transition">
              <Edit2 size={16} />
            </button>
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
            {user.description || "Aucune description fournie."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Téléphone</p>
              <p className="font-bold text-[#1E1B3A]">{user.phone || "Non renseigné"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Expérience</p>
              <p className="font-bold text-[#1E1B3A]">{user.experience || "10"} Ans</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Tarif horaire moyen</p>
              <p className="font-bold text-[#1E1B3A]">{user.hourlyRate || "50 DT - 80 DT"}</p>
            </div>
          </div>
        </section>

        {/* 3. PortfolioMasonryGrid */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1E1B3A]">Réalisations</h2>
            <button className="text-[#4F3D8A] bg-[#F3F0FF] p-2 rounded-xl hover:bg-[#E0D4FF] transition">
              <Edit2 size={16} />
            </button>
          </div>
          
          {user.portfolio && user.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1 row-span-2 bg-slate-200 rounded-2xl aspect-[2/3] overflow-hidden">
                <img src={user.portfolio[0].startsWith('http') ? user.portfolio[0] : `http://localhost:8000${user.portfolio[0]}`} alt="Portfolio 1" className="w-full h-full object-cover" />
              </div>
              {user.portfolio.length > 1 && (
                <div className="col-span-1 bg-slate-200 rounded-2xl aspect-square overflow-hidden">
                  <img src={user.portfolio[1].startsWith('http') ? user.portfolio[1] : `http://localhost:8000${user.portfolio[1]}`} alt="Portfolio 2" className="w-full h-full object-cover" />
                </div>
              )}
              {user.portfolio.length > 2 && (
                <div className="col-span-1 bg-slate-200 rounded-2xl aspect-square overflow-hidden relative">
                  <img src={user.portfolio[2].startsWith('http') ? user.portfolio[2] : `http://localhost:8000${user.portfolio[2]}`} alt="Portfolio 3" className="w-full h-full object-cover" />
                  {user.portfolio.length > 3 && (
                    <div className="absolute inset-0 bg-[#4F3D8A]/80 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">+{user.portfolio.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400 font-bold">Aucune réalisation pour le moment</p>
            </div>
          )}
        </section>

        {/* 4. ReviewsListSection */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#1E1B3A]">Avis Clients ({reviews.length})</h2>
          </div>

          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7C5CBF] to-[#A78BFA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {rev.client ? rev.client.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E1B3A] text-sm">{rev.client}</h4>
                        <p className="text-xs font-semibold text-slate-400">Avis récent</p>
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
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 font-medium">
                Aucun avis pour le moment
              </div>
            )}
            
            {reviews.length > 5 && (
              <button className="w-full py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition">
                Voir tous les avis
              </button>
            )}
          </div>
        </section>

        {/* 5. LogoutButton */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 flex items-center justify-center gap-2 bg-white text-red-500 border border-red-100 rounded-2xl font-bold text-lg hover:bg-red-50 transition shadow-sm"
        >
          <LogOut size={20} /> Se déconnecter
        </button>

      </main>
    </div>
  );
}
