'use client';

import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Star, MessageSquare, Camera, X, CheckCircle2, ChevronRight, UploadCloud } from 'lucide-react';
import Link from 'next/link';

const MOCK_APPOINTMENTS = [
  { id: 1, provider: 'Plomberie Express', category: 'Plomberie', status: 'en_cours', date: 'Aujourd\'hui, 14:30', amount: '80 DT', isRated: false },
  { id: 2, provider: 'Ahmed B. Artisan', category: 'Électricité', status: 'termine', date: '12 Nov 2024', amount: '45 DT', isRated: false },
  { id: 3, provider: 'Nettoyage Pro', category: 'Ménage', status: 'termine', date: '05 Nov 2024', amount: '60 DT', isRated: true },
  { id: 4, provider: 'ElectroFix', category: 'Électricité', status: 'annule', date: '01 Nov 2024', amount: '-', isRated: false },
];

export default function HistoriquePage() {
  const [activeTab, setActiveTab] = useState<'en_cours' | 'passes' | 'annules'>('passes');
  const [ratingSheetOpen, setRatingSheetOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // Rating States
  const [globalRating, setGlobalRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [criteria, setCriteria] = useState({ ponctualite: 3, pro: 3, qualite: 3, prix: 3 });
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Computed data
  const filteredAppointments = MOCK_APPOINTMENTS.filter(app => {
    if (activeTab === 'en_cours') return app.status === 'en_cours' || app.status === 'confirme';
    if (activeTab === 'passes') return app.status === 'termine';
    return app.status === 'annule';
  });

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'confirme': return { label: 'Confirmé', color: 'bg-[#D1FAE5] text-[#059669]' };
      case 'en_cours': return { label: 'En cours', color: 'bg-[#FEF3C7] text-[#D97706]' };
      case 'termine': return { label: 'Terminé', color: 'bg-slate-200 text-slate-600' };
      case 'annule': return { label: 'Annulé', color: 'bg-[#FEE2E2] text-[#DC2626]' };
      default: return { label: 'Inconnu', color: 'bg-slate-100 text-slate-500' };
    }
  };

  const openRating = (app: any) => {
    if (app.isRated) return;
    setSelectedAppt(app);
    setGlobalRating(0);
    setHoverRating(0);
    setComment('');
    setIsSubmitted(false);
    setRatingSheetOpen(true);
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalRating <= 2 && comment.trim().length === 0) {
      alert("Veuillez laisser un commentaire pour expliquer cette mauvaise note.");
      return;
    }
    // Simulate submission
    setIsSubmitted(true);
    setTimeout(() => {
      setRatingSheetOpen(false);
      // In real app, update the appointment state to 'isRated: true'
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDF0F5] font-sans relative flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white px-6 pt-12 pb-4 shadow-sm z-10">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/client" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-[#2D1B2E]">Mes Réservations</h1>
        </div>

        {/* ReservationsTabBar */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {[
            { id: 'en_cours', label: 'En cours' },
            { id: 'passes', label: 'Passés' },
            { id: 'annules', label: 'Annulés' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition ${activeTab === tab.id ? 'bg-[#9B1D54] text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* LIST VIEW */}
      <main className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Calendar size={64} className="mx-auto mb-4 text-[#C2185B]" />
            <p className="font-bold text-[#2D1B2E]">Aucune réservation</p>
          </div>
        ) : (
          filteredAppointments.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            return (
              <div key={app.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-[#FDF0F5] text-[#9B1D54] flex items-center justify-center font-bold text-xl">
                      {app.provider.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D1B2E] leading-tight">{app.provider}</h3>
                      <p className="text-xs font-semibold text-slate-400">{app.category}</p>
                    </div>
                  </div>
                  {/* StatusBadge */}
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="flex items-center text-xs font-bold text-slate-500 mb-1"><Clock size={12} className="mr-1" /> {app.date}</p>
                    <p className="font-black text-[#9B1D54] text-lg">{app.amount}</p>
                  </div>
                  
                  {/* Rating Logic */}
                  {app.status === 'termine' && (
                    <button 
                      onClick={() => openRating(app)}
                      disabled={app.isRated}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center transition ${app.isRated ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#FDF0F5] text-[#C2185B] hover:bg-[#FCE4EC]'}`}
                    >
                      {app.isRated ? <><CheckCircle2 size={14} className="mr-1"/> Avis laissé</> : <><Star size={14} className="mr-1" /> Noter</>}
                    </button>
                  )}
                  {app.status === 'en_cours' && (
                    <button className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2D1B2E] text-white flex items-center">
                      Suivre <ChevronRight size={14} className="ml-1" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* RATING BOTTOM SHEET */}
      {ratingSheetOpen && selectedAppt && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-[#2D1B2E]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-[#2D1B2E]">Évaluer la prestation</h2>
              <button onClick={() => setRatingSheetOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            {isSubmitted ? (
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center text-[#059669] mb-4 animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-[#2D1B2E] mb-2">Merci !</h3>
                <p className="text-slate-500 font-medium">Votre avis a été publié avec succès. Il aidera d'autres utilisateurs.</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#FDF0F5] text-[#9B1D54] rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                    {selectedAppt.provider.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg text-[#2D1B2E]">{selectedAppt.provider}</h3>
                  <p className="text-sm font-medium text-slate-400">{selectedAppt.category} • {selectedAppt.date}</p>
                </div>

                {/* InteractiveStars */}
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setGlobalRating(star)}
                      className={`transition-transform duration-200 ${hoverRating >= star || globalRating >= star ? 'scale-110' : 'scale-100'}`}
                    >
                      <Star size={40} className={hoverRating >= star || globalRating >= star ? 'text-[#E8A020] fill-[#E8A020]' : 'text-slate-200 fill-slate-200'} />
                    </button>
                  ))}
                </div>

                {globalRating > 0 && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    
                    {/* CriteriaSliders */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                      <h4 className="font-bold text-sm text-[#2D1B2E]">Détail de la note (optionnel)</h4>
                      
                      {[
                        { key: 'ponctualite', label: 'Ponctualité' },
                        { key: 'pro', label: 'Professionnalisme' },
                        { key: 'qualite', label: 'Qualité du travail' },
                        { key: 'prix', label: 'Rapport Qualité/Prix' }
                      ].map(crit => (
                        <div key={crit.key}>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600">{crit.label}</span>
                            <span className="text-[#9B1D54]">{criteria[crit.key as keyof typeof criteria]}/5</span>
                          </div>
                          <input 
                            type="range" min="1" max="5" 
                            value={criteria[crit.key as keyof typeof criteria]} 
                            onChange={(e) => setCriteria({...criteria, [crit.key]: Number(e.target.value)})}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#9B1D54]" 
                          />
                        </div>
                      ))}
                    </div>

                    {/* CommentField */}
                    <div>
                      <label className="flex items-center text-sm font-bold text-[#2D1B2E] mb-2">
                        <MessageSquare size={16} className="mr-2 text-[#C2185B]" /> 
                        Votre commentaire {globalRating <= 2 && <span className="text-red-500 ml-1">* requis</span>}
                      </label>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Partagez votre expérience avec ce prestataire..."
                        className={`w-full bg-slate-50 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B1D54]/30 h-24 ${globalRating <= 2 && comment.trim() === '' ? 'border-red-300' : 'border-slate-200'}`}
                      />
                    </div>

                    {/* BeforeAfterPhotos */}
                    <div>
                      <label className="flex items-center text-sm font-bold text-[#2D1B2E] mb-2">
                        <Camera size={16} className="mr-2 text-[#C2185B]" /> Photos (Avant / Après)
                      </label>
                      <div className="flex gap-3">
                        <label className="flex-1 aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition">
                          <UploadCloud size={24} className="text-slate-400 mb-1" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Avant</span>
                          <input type="file" className="hidden" accept="image/*" />
                        </label>
                        <label className="flex-1 aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition">
                          <UploadCloud size={24} className="text-slate-400 mb-1" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Après</span>
                          <input type="file" className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>

                    {/* SubmitRatingButton */}
                    <button 
                      onClick={handleSubmitRating}
                      className="w-full py-4 bg-[#9B1D54] hover:bg-[#C2185B] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#9B1D54]/30 transition"
                    >
                      Publier mon avis
                    </button>
                  </div>
                )}
              </div>
            )}
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
