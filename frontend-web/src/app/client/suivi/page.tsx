'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation2, Clock, PhoneCall, MessageCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SuiviGPSPage() {
  const [eta, setEta] = useState(14); // minutes
  const [isDelayed, setIsDelayed] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  // Mock: Reduce ETA every 5 seconds for demo, trigger delay if it hits 5
  useEffect(() => {
    if (!hasArrived && eta > 0) {
      const interval = setInterval(() => {
        setEta(prev => {
          if (prev === 10) setIsDelayed(true); // Mock delay logic
          if (prev <= 1) {
            setHasArrived(true);
            return 0;
          }
          return prev - 1;
        });
      }, 5000); // 5 seconds for faster demo
      return () => clearInterval(interval);
    }
  }, [hasArrived, eta]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans relative overflow-hidden flex flex-col">
      
      {/* 1. MOCK GOOGLE MAP WIDGET BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=36.83,10.23&zoom=15&size=1080x1920&maptype=roadmap&style=feature:all|element:geometry.fill|color:0xfdf0f5&style=feature:water|element:geometry|color:0xf48fb1')] bg-cover bg-center opacity-90">
        
        {/* Animated GPS "Ping" Overlay */}
        {!hasArrived && (
          <div className="absolute inset-0 bg-[#9B1D54]/5 pointer-events-none"></div>
        )}
        
        {/* JourneyPolyline (Mocked) */}
        {!hasArrived && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg" style={{ zIndex: 1 }}>
            <path d="M 150 400 Q 200 300 250 500 T 300 200" fill="none" stroke="#9B1D54" strokeWidth="6" strokeDasharray="12, 6" className="animate-pulse opacity-70" />
          </svg>
        )}

        {/* Map Markers */}
        {!hasArrived && (
          <>
            {/* ProviderMarker (Animated) */}
            <div className="absolute top-[400px] left-[130px] z-10 flex flex-col items-center animate-bounce duration-[2000ms]">
              <div className="bg-white p-1 rounded-full shadow-xl border-2 border-[#9B1D54] relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9B1D54] to-[#C2185B] rounded-full flex items-center justify-center text-white font-bold">
                  P
                </div>
                {/* Small car icon badge */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  <Navigation2 size={12} className="text-[#9B1D54]" />
                </div>
              </div>
              <div className="w-10 h-3 bg-black/20 rounded-[100%] blur-sm mt-1"></div>
            </div>

            {/* Client Destination Marker */}
            <div className="absolute top-[180px] left-[280px] z-10 flex flex-col items-center">
              <div className="bg-[#2D1B2E] p-3 rounded-full shadow-lg border-2 border-white">
                <MapPin size={24} className="text-white" />
              </div>
              <div className="bg-white px-2 py-1 mt-2 rounded-md shadow-md text-[10px] font-bold text-[#2D1B2E]">Domicile</div>
            </div>
          </>
        )}
      </div>

      {/* HEADER CONTROLS */}
      <header className="relative z-20 p-6 flex justify-between items-start">
        <Link href="/client" className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#2D1B2E] shadow-lg hover:bg-white transition">
          <ArrowLeft size={24} />
        </Link>
        
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#059669]" />
          <span className="font-bold text-[#2D1B2E] text-xs">Suivi Sécurisé</span>
        </div>
      </header>

      {/* LATE ALERT BANNER */}
      {isDelayed && !hasArrived && (
        <div className="relative z-20 mx-6 mt-2">
          <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-2xl shadow-lg flex gap-3 items-start animate-in slide-in-from-top-4 duration-500">
            <div className="bg-[#F59E0B] p-2 rounded-full text-white shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h4 className="font-bold text-[#92400E] text-sm">Le prestataire a pris du retard</h4>
              <p className="text-xs text-[#B45309] font-medium mt-1 leading-relaxed">
                En raison de la circulation, l'arrivée est retardée d'environ 10 minutes. Merci de votre patience.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ETA CHIP */}
      {!hasArrived && (
        <div className="relative z-20 mx-auto mt-auto mb-6">
          <div className="bg-white px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(155,29,84,0.3)] flex items-center gap-4 border-2 border-[#9B1D54]/10 animate-in slide-in-from-bottom-4">
            <div className="bg-[#FDF0F5] p-3 rounded-full animate-pulse">
              <Clock size={24} className="text-[#9B1D54]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Arrivée estimée dans</p>
              <p className="text-3xl font-black text-[#9B1D54] leading-none mt-1">{eta} min</p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SLIDING PANEL */}
      <div className="mt-auto relative z-20 px-4 pb-6">
        <div className="bg-white rounded-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

          {!hasArrived ? (
            <>
              {/* Provider Info Row */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#FDF0F5] text-[#9B1D54] flex items-center justify-center font-bold text-2xl relative border-2 border-white shadow-md">
                  P
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#2D1B2E]">Plomberie Express</h2>
                  <p className="text-slate-500 font-medium text-sm flex items-center gap-1 mt-1">
                    <span className="text-[#E8A020]">★ 4.9</span> • En route vers vous
                  </p>
                </div>
              </div>

              {/* Vehicle Info (Optional) */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Véhicule utilitaire</p>
                  <p className="font-bold text-[#2D1B2E] mt-1">Peugeot Partner Blanche</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-[#2D1B2E] shadow-sm">
                  123 TUN 4567
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-[0.3] flex flex-col items-center justify-center py-4 bg-[#FDF0F5] text-[#9B1D54] rounded-2xl font-bold hover:bg-[#FCE4EC] transition border border-[#F48FB1]/50">
                  <MessageCircle size={24} className="mb-1" />
                  <span className="text-[10px] uppercase">Message</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#9B1D54] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#9B1D54]/30 hover:bg-[#C2185B] transition">
                  <PhoneCall size={22} /> Appeler
                </button>
              </div>
            </>
          ) : (
            /* HAS ARRIVED VIEW */
            <div className="animate-in slide-in-from-bottom-8 duration-500 text-center py-4">
              <div className="w-24 h-24 bg-[#D1FAE5] rounded-full flex items-center justify-center text-[#059669] mx-auto mb-6 shadow-inner">
                <MapPin size={40} className="animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-[#2D1B2E] mb-2">Le prestataire est là !</h3>
              <p className="text-slate-500 font-medium mb-8">Plomberie Express est arrivé(e) à votre adresse. L'intervention va pouvoir commencer.</p>
              
              <Link href="/client" className="w-full flex items-center justify-center gap-3 py-4 bg-[#2D1B2E] text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition">
                Fermer
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
