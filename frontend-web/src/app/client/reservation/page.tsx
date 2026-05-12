'use client';

import { useState } from 'react';
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, 
  MapPin, Camera, UploadCloud, DollarSign, CreditCard, Wallet, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const STEPS = [
  { id: 1, title: 'Date & Heure' },
  { id: 2, title: 'Besoin' },
  { id: 3, title: 'Adresse' },
  { id: 4, title: 'Confirmation' }
];

export default function ReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerName = searchParams.get('name') || 'Prestataire';
  const providerPrice = searchParams.get('price') || '50 DT / h';
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  
  // Form State
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (step < 4) {
      // Validations
      if (step === 1 && (!selectedDate || !selectedTime)) {
        alert("Veuillez choisir une date et une heure."); return;
      }
      if (step === 2 && !description.trim()) {
        alert("Veuillez décrire brièvement votre besoin."); return;
      }
      if (step === 3 && !address.trim()) {
        alert("Veuillez renseigner votre adresse d'intervention."); return;
      }
      setDirection('forward');
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection('backward');
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Votre demande a été envoyée au prestataire !");
      router.push('/client/historique'); // Redirect to history
    }, 2000);
  };

  // MOCK CALENDAR RENDER
  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      let isAvailable = i % 3 !== 0; // Fake availability logic
      days.push(
        <button 
          key={i} 
          disabled={!isAvailable}
          onClick={() => setSelectedDate(i)}
          className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
            selectedDate === i 
              ? 'bg-[#9B1D54] text-white shadow-md' 
              : isAvailable 
                ? 'bg-[#E0F2F1] text-[#00897B] hover:bg-[#B2DFDB]' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  // ANIMATION CLASSES
  const slideClass = direction === 'forward' 
    ? 'animate-in slide-in-from-right-8 fade-in duration-300' 
    : 'animate-in slide-in-from-left-8 fade-in duration-300';

  return (
    <div className="min-h-screen bg-[#FDF0F5] font-sans pb-24 flex flex-col relative overflow-hidden">
      
      {/* HEADER & STEPPER */}
      <header className="bg-white pt-12 pb-6 px-6 shadow-sm rounded-b-[40px] relative z-20">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => step > 1 ? prevStep() : router.back()} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#2D1B2E]">Réserver un RDV</h1>
            <p className="text-sm font-semibold text-[#9B1D54]">{providerName}</p>
          </div>
        </div>

        {/* StepperBar */}
        <div className="flex justify-between items-center relative px-2">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full"></div>
          {/* Progress Bar */}
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#9B1D54] -z-10 rounded-full transition-all duration-500" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>

          {STEPS.map((s) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
                  isCompleted ? 'bg-[#9B1D54] border-[#9B1D54] text-white' : 
                  isActive ? 'bg-white border-[#9B1D54] text-[#9B1D54]' : 
                  'bg-white border-slate-200 text-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : s.id}
                </div>
                {isActive && <span className="absolute -bottom-6 text-[10px] font-bold text-[#9B1D54] whitespace-nowrap">{s.title}</span>}
              </div>
            );
          })}
        </div>
      </header>

      {/* FORM CONTENT */}
      <main className="flex-1 px-6 pt-10 relative z-10">
        
        {/* ÉTAPE 1: CALENDAR VIEW */}
        {step === 1 && (
          <div key="step1" className={slideClass}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#2D1B2E] flex items-center"><CalendarIcon size={18} className="mr-2 text-[#9B1D54]" /> Novembre 2024</h2>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="aspect-square"></div><div className="aspect-square"></div>
                {renderCalendar()}
              </div>
              <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Disponible</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Occupé</span>
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4">
                <h3 className="font-bold text-[#2D1B2E] mb-4 text-sm flex items-center"><Clock size={16} className="mr-2 text-[#9B1D54]" /> Créneaux disponibles le {selectedDate} Nov</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['09:00', '10:30', '14:00', '15:30', '17:00'].map(time => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-xl text-sm font-bold border transition ${selectedTime === time ? 'bg-[#9B1D54] text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-[#9B1D54]'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 2: NEEDS FORM */}
        {step === 2 && (
          <div key="step2" className={slideClass}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              
              <div>
                <label className="font-bold text-[#2D1B2E] block mb-2 text-sm">Décrivez votre problème *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: J'ai une fuite importante sous le lavabo de la cuisine, l'eau coule en continu..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#9B1D54] h-32"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D1B2E] block mb-2 text-sm flex justify-between">
                  <span>Photos du problème</span>
                  <span className="text-slate-400 font-medium text-xs">Jusqu'à 5 photos</span>
                </label>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  <label className="w-20 h-20 flex-shrink-0 bg-[#FDF0F5] border-2 border-dashed border-[#F48FB1] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#FCE4EC] transition">
                    <Camera size={20} className="text-[#9B1D54] mb-1" />
                    <span className="text-[10px] font-bold text-[#9B1D54]">Ajouter</span>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
                  {/* Mock image slots */}
                  <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                    <UploadCloud size={20} />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2D1B2E] block mb-2 text-sm">Votre budget estimé (Optionnel)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold"><DollarSign size={18} /></span>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#9B1D54] font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">DT</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ÉTAPE 3: ADDRESS FORM */}
        {step === 3 && (
          <div key="step3" className={slideClass}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              
              <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3 rounded-xl flex gap-3 text-sm font-medium text-[#B45309]">
                <AlertCircle size={20} className="flex-shrink-0" />
                Le prestataire se déplacera à cette adresse. Soyez précis !
              </div>

              <div>
                <label className="font-bold text-[#2D1B2E] block mb-2 text-sm">Adresse d'intervention *</label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C2185B]"><MapPin size={18} /></span>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Numéro, nom de rue, ville..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#9B1D54] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2D1B2E] block mb-2 text-sm">Situer sur la carte</label>
                <div className="w-full h-48 bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200 overflow-hidden relative shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    style={{ border: 0 }}
                    src="https://www.google.com/maps?q=Tunis&output=embed" 
                    allowFullScreen
                    className="grayscale brightness-90 contrast-125 opacity-60"
                  ></iframe>
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="bg-[#2D1B2E] text-white p-2 rounded-full shadow-lg relative z-10 mb-1 border-2 border-white cursor-pointer hover:scale-110 transition pointer-events-auto">
                      <MapPin size={24} />
                    </div>
                    <div className="w-4 h-1 bg-black/30 rounded-[100%] blur-[2px] relative z-10"></div>
                  </div>
                  <span className="absolute bottom-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 shadow-sm z-10">
                    Glissez la carte pour ajuster
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ÉTAPE 4: CONFIRMATION */}
        {step === 4 && (
          <div key="step4" className={slideClass}>
            
            {/* RecapCard */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FDF0F5] to-transparent rounded-full -mr-16 -mt-16 z-0"></div>
              
              <h2 className="text-xl font-black text-[#2D1B2E] mb-6 relative z-10">Résumé de la demande</h2>
              
              <div className="space-y-4 relative z-10">
                <div className="flex gap-4 items-start border-b border-slate-50 pb-3 mb-3">
                  <div className="w-10 h-10 bg-[#9B1D54] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm"><DollarSign size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Tarif du prestataire</p>
                    <p className="font-bold text-[#9B1D54] text-lg">{providerPrice}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#FDF0F5] text-[#9B1D54] rounded-full flex items-center justify-center shrink-0"><CalendarIcon size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Date & Heure</p>
                    <p className="font-bold text-[#2D1B2E]">Le {selectedDate} Nov 2024 à {selectedTime}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#FDF0F5] text-[#9B1D54] rounded-full flex items-center justify-center shrink-0"><MapPin size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Adresse</p>
                    <p className="font-bold text-[#2D1B2E]">{address}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#FDF0F5] text-[#9B1D54] rounded-full flex items-center justify-center shrink-0"><DollarSign size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Budget estimé</p>
                    <p className="font-bold text-[#2D1B2E]">{budget ? `${budget} DT` : 'Non spécifié (Devis sur place)'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PaymentChoiceRow */}
            <div className="mb-6">
              <h3 className="font-bold text-[#2D1B2E] text-sm mb-3">Mode de paiement souhaité</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'cash' ? 'bg-[#FDF0F5] border-[#9B1D54] text-[#9B1D54]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <Wallet size={24} />
                  <span className="font-bold text-sm">Espèces</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${paymentMethod === 'card' ? 'bg-[#FDF0F5] border-[#9B1D54] text-[#9B1D54]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold text-sm">Carte bancaire</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <button 
          onClick={step === 4 ? handleSubmit : nextStep}
          disabled={isSubmitting || (step === 1 && (!selectedDate || !selectedTime))}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg ${
            isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 
            (step === 1 && (!selectedDate || !selectedTime)) ? 'bg-[#FCE4EC] text-[#F48FB1] shadow-none' : 
            'bg-[#9B1D54] hover:bg-[#831846] text-white shadow-[#9B1D54]/30'
          }`}
        >
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> Traitement...</>
          ) : (
            step === 4 ? 'Confirmer la réservation' : 'Étape suivante'
          )}
        </button>
      </div>

    </div>
  );
}
