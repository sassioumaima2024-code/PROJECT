'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Clock, Star, DollarSign, Image as ImageIcon, CheckCircle, XCircle, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const MOCK_APPOINTMENT = {
  id: 101,
  client: { name: 'Ahmed Ben Ali', rating: 4.8, initial: 'A' },
  service: 'Réparation Fuite Chauffe-eau',
  date: '2024-11-20',
  time: '14:30',
  address: 'Résidence les Jasmins, Lac 2, Tunis',
  description: 'Fuite importante au niveau du groupe de sécurité. J\'ai dû couper l\'eau générale.',
  budget: '80 DT - 120 DT',
  status: 'pending', // 'pending', 'confirmed', 'in_progress', 'completed'
};

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Demandé' },
  { key: 'confirmed', label: 'Confirmé' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminé' },
];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [showAlternative, setShowAlternative] = useState(false);
  const [showRefuseInput, setShowRefuseInput] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState(MOCK_APPOINTMENT.status);

  // Month info
  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  // Generate a mock calendar grid for the current month
  const renderCalendar = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

    for (let i = 1; i <= daysInMonth; i++) {
      let statusColor = 'bg-slate-50 border-slate-100';
      let textColor = 'text-slate-600';

      if (isCurrentMonth && i === today.getDate()) {
        statusColor = 'bg-[#E0D4FF] border-[#4F3D8A]';
        textColor = 'text-[#4F3D8A] font-bold';
      }

      if (selectedDate === i) {
        statusColor = 'bg-[#4F3D8A] text-white';
        textColor = 'text-white font-bold';
      }

      days.push(
        <button 
          key={i} 
          onClick={() => setSelectedDate(i)}
          className={`flex flex-col items-center justify-center aspect-square rounded-xl border transition ${statusColor}`}
        >
          <span className={textColor}>{i}</span>
        </button>
      );
    }
    return days;
  };

  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.key === appointmentStatus);
  const progressWidth = `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%`;

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white p-6 pb-8 shadow-lg relative z-10 rounded-b-[40px]">
        <div className="flex items-center gap-4">
          <Link href="/prestataire" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Mon Agenda</h1>
        </div>
      </header>

      <main className="px-6 -mt-4 relative z-20 space-y-6">
        
        {/* CALENDAR WIDGET */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1E1B3A] capitalize">{monthName} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#F3F0FF] hover:text-[#4F3D8A] transition"><ChevronLeft size={18} /></button>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#F3F0FF] hover:text-[#4F3D8A] transition"><ChevronRight size={18} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
            <div>LUN</div><div>MAR</div><div>MER</div><div>JEU</div><div>VEN</div><div>SAM</div><div>DIM</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {[...Array(adjustedFirstDay)].map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
            {renderCalendar()}
          </div>

          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Dispo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Occupé</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> En attente</span>
          </div>
        </div>

        {/* APPOINTMENT DETAIL CARD */}
        {selectedDate === 20 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header / Client Info */}
            <div className="bg-[#F3F0FF] p-5 flex items-start justify-between border-b border-[#A78BFA]/20">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#4F3D8A] to-[#A78BFA] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                  {MOCK_APPOINTMENT.client.initial}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1E1B3A]">{MOCK_APPOINTMENT.client.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#D4A017] mt-0.5">
                    <Star size={14} fill="currentColor" /> {MOCK_APPOINTMENT.client.rating}/5
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                appointmentStatus === 'pending' ? 'bg-[#FEF3C7] text-[#D97706]' : 
                appointmentStatus === 'confirmed' ? 'bg-[#E0D4FF] text-[#4F3D8A]' : 
                appointmentStatus === 'in_progress' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#D1FAE5] text-[#059669]'
              }`}>
                {TIMELINE_STEPS.find(s => s.key === appointmentStatus)?.label}
              </span>
            </div>

            {/* STATUS TIMELINE */}
            <div className="px-5 py-6 border-b border-slate-100">
              <div className="flex justify-between relative">
                <div className="absolute top-3 left-6 right-6 h-1 bg-slate-100 z-0 rounded-full"></div>
                {/* Progress bar */}
                <div className="absolute top-3 left-6 h-1 bg-[#4F3D8A] z-0 rounded-full transition-all duration-500" style={{ width: progressWidth }}></div>
                
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors border-2 ${isCompleted ? 'bg-[#4F3D8A] text-white border-[#4F3D8A]' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {index + 1}
                      </div>
                      <span className={`text-[10px] font-bold ${isCompleted ? 'text-[#4F3D8A]' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Service & Time */}
              <div>
                <h4 className="font-bold text-[#1E1B3A] mb-2">{MOCK_APPOINTMENT.service}</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center text-sm font-semibold bg-[#F3F0FF] text-[#4F3D8A] px-3 py-1.5 rounded-lg"><CalendarIcon size={16} className="mr-2" /> Le 20 Nov 2024</span>
                  <span className="flex items-center text-sm font-semibold bg-[#F3F0FF] text-[#4F3D8A] px-3 py-1.5 rounded-lg"><Clock size={16} className="mr-2" /> À 14:30</span>
                </div>
              </div>

              {/* Address & Map Mock */}
              <div>
                <p className="flex items-start text-sm text-slate-600 font-medium mb-3">
                  <MapPin size={18} className="mr-2 text-[#D4A017] flex-shrink-0 mt-0.5" /> 
                  {MOCK_APPOINTMENT.address}
                </p>
                <div className="w-full h-32 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=36.83,10.23&zoom=14&size=600x300&sensor=false')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                  <MapPin size={32} className="text-[#DC2626] mb-1 relative z-10 drop-shadow-md" />
                  <span className="text-xs font-bold text-slate-500 relative z-10">Carte Google Maps</span>
                </div>
              </div>

              {/* Description & Photos */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description du besoin</h5>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{MOCK_APPOINTMENT.description}</p>
                
                {/* Photos Carousel Mock */}
                <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                  {[1, 2].map((img) => (
                    <div key={img} className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-300">
                      <ImageIcon size={24} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between bg-[#FFFBEB] p-4 rounded-xl border border-[#FDE68A]">
                <span className="text-sm font-bold text-[#92400E]">Budget proposé :</span>
                <span className="text-lg font-extrabold text-[#D97706] flex items-center"><DollarSign size={18} /> {MOCK_APPOINTMENT.budget}</span>
              </div>
            </div>

            {/* ACTION BUTTON ROW */}
            {appointmentStatus === 'pending' && (
              <div className="p-5 bg-slate-50 border-t border-slate-100">
                {!showAlternative && !showRefuseInput ? (
                  <div className="flex gap-2">
                    <button onClick={() => setShowRefuseInput(true)} className="flex-[0.7] flex flex-col items-center justify-center p-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                      <XCircle size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Refuser</span>
                    </button>
                    <button onClick={() => setShowAlternative(true)} className="flex-1 flex flex-col items-center justify-center p-3 bg-white text-[#4F3D8A] border border-[#A78BFA] rounded-xl hover:bg-[#F3F0FF] transition">
                      <RefreshCw size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Proposer autre heure</span>
                    </button>
                    <button onClick={() => setAppointmentStatus('confirmed')} className="flex-1 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#10B981] to-[#059669] text-white rounded-xl shadow-lg shadow-[#059669]/30 hover:opacity-90 transition">
                      <CheckCircle size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Accepter</span>
                    </button>
                  </div>
                ) : showAlternative ? (
                  <div className="animate-in fade-in duration-300">
                    <h5 className="font-bold text-[#1E1B3A] mb-3 text-sm">Proposer un autre créneau</h5>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4F3D8A]" />
                      <input type="time" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4F3D8A]" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAlternative(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-xl">Annuler</button>
                      <button onClick={() => { setShowAlternative(false); alert("Nouvelle proposition envoyée"); }} className="flex-1 bg-[#4F3D8A] text-white font-bold text-sm rounded-xl">Envoyer la proposition</button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <h5 className="font-bold text-[#1E1B3A] mb-3 text-sm">Motif du refus</h5>
                    <textarea placeholder="Indiquez pourquoi vous ne pouvez pas accepter ce RDV..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 h-20 mb-3"></textarea>
                    <div className="flex gap-2">
                      <button onClick={() => setShowRefuseInput(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-xl">Annuler</button>
                      <button onClick={() => { setShowRefuseInput(false); setAppointmentStatus('cancelled'); }} className="flex-1 bg-[#EF4444] text-white font-bold text-sm rounded-xl">Confirmer le refus</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Status change demo buttons */}
            {appointmentStatus === 'confirmed' && (
              <div className="p-5 border-t border-slate-100 bg-[#F3F0FF] flex justify-center">
                <button onClick={() => setAppointmentStatus('in_progress')} className="bg-[#4F3D8A] text-white font-bold px-6 py-3 rounded-xl shadow-lg w-full">Démarrer (Arrivé sur place)</button>
              </div>
            )}
            {appointmentStatus === 'in_progress' && (
              <div className="p-5 border-t border-slate-100 bg-[#DBEAFE] flex justify-center">
                <button onClick={() => setAppointmentStatus('completed')} className="bg-[#2563EB] text-white font-bold px-6 py-3 rounded-xl shadow-lg w-full">Marquer comme Terminé</button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">Sélectionnez une date (ex: 20 Nov) pour voir les rendez-vous.</p>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
