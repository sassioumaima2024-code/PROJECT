'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation2, Clock, PhoneCall, ShieldAlert, Navigation, StopCircle, Play } from 'lucide-react';
import Link from 'next/link';

export default function GPSPage() {
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [eta, setEta] = useState(12); // minutes
  const [timer, setTimer] = useState(0); // seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ETA Mock Countdown logic (simulate geolocator ping every 30s)
  useEffect(() => {
    if (isGpsActive && !hasArrived && eta > 0) {
      const interval = setInterval(() => {
        setEta(prev => prev > 1 ? prev - 1 : 0);
      }, 30000); // Reduce ETA every 30s for demo
      return () => clearInterval(interval);
    }
  }, [isGpsActive, hasArrived, eta]);

  // ServiceStartTimer logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleArrival = () => {
    setHasArrived(true);
    setIsGpsActive(false);
    setIsTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans relative overflow-hidden flex flex-col">
      
      {/* 1. MOCK GOOGLE MAP WIDGET BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=36.83,10.23&zoom=15&size=1080x1920&maptype=roadmap&style=feature:all|element:geometry.fill|color:0xf4f4f4&style=feature:water|element:geometry|color:0xa3ccff')] bg-cover bg-center">
        
        {/* Animated GPS "Ping" Overlay when active */}
        {isGpsActive && (
          <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>
        )}
        
        {/* Route Polyline (Mocked with an SVG overlay) */}
        {isGpsActive && !hasArrived && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg" style={{ zIndex: 1 }}>
            <path d="M 150 400 Q 200 300 250 500 T 300 200" fill="none" stroke="#4F3D8A" strokeWidth="6" strokeDasharray="10, 5" className="animate-pulse" />
          </svg>
        )}

        {/* Map Markers */}
        {!hasArrived && (
          <>
            {/* Prestataire Marker */}
            <div className="absolute top-[400px] left-[130px] z-10 flex flex-col items-center animate-bounce">
              <div className="bg-[#4F3D8A] p-2 rounded-full shadow-lg border-2 border-white">
                <Navigation size={24} className="text-white transform rotate-45" />
              </div>
              <div className="w-16 h-4 bg-black/20 rounded-[100%] blur-sm mt-1"></div>
            </div>

            {/* Client Marker */}
            <div className="absolute top-[180px] left-[280px] z-10 flex flex-col items-center">
              <div className="bg-[#DC2626] p-2 rounded-full shadow-lg border-2 border-white">
                <MapPin size={28} className="text-white" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* HEADER & TOP CONTROLS */}
      <header className="relative z-20 p-6 flex justify-between items-start">
        <Link href="/prestataire" className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#1E1B3A] shadow-lg hover:bg-white transition">
          <ArrowLeft size={24} />
        </Link>
        
        {/* 2. GPSToggleCard */}
        {!hasArrived && (
          <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
            <span className="font-bold text-[#1E1B3A] text-sm">Partage GPS</span>
            <button 
              onClick={() => setIsGpsActive(!isGpsActive)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 shadow-inner ${isGpsActive ? 'bg-[#059669]' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isGpsActive ? 'translate-x-6 text-[#059669]' : 'translate-x-0 text-slate-400'}`}>
                {isGpsActive ? <Navigation2 size={14} /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
              </div>
            </button>
          </div>
        )}
      </header>

      {/* FLOATING ETA CHIP */}
      {isGpsActive && !hasArrived && (
        <div className="relative z-20 mx-auto mt-4">
          <div className="bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white px-6 py-3 rounded-full shadow-[0_10px_25px_rgba(79,61,138,0.5)] flex items-center gap-3 border border-white/20 animate-in slide-in-from-top-4">
            <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#E0D4FF]">Arrivée estimée</p>
              <p className="text-lg font-extrabold leading-none">{eta} minutes</p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SLIDING PANEL */}
      <div className="mt-auto relative z-20 px-4 pb-6">
        
        {/* Urgent Floating Action if not arrived */}
        {!hasArrived && (
          <div className="flex justify-end mb-4">
            <button className="bg-white p-4 rounded-full shadow-lg text-[#DC2626] hover:bg-red-50 transition border border-red-100 flex items-center justify-center gap-2">
              <ShieldAlert size={24} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-slate-100">
          
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

          {/* Client Info Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-[#F3F0FF] text-[#4F3D8A] rounded-full text-xs font-bold mb-2">Intervention en cours</span>
              <h2 className="text-2xl font-bold text-[#1E1B3A]">Youssef T.</h2>
              <p className="text-slate-500 font-medium mt-1">Réparation Fuite Chauffe-eau</p>
            </div>
            <button className="w-14 h-14 bg-[#ECFDF5] text-[#059669] rounded-full flex items-center justify-center shadow-sm hover:bg-[#D1FAE5] transition">
              <PhoneCall size={24} />
            </button>
          </div>

          {!hasArrived ? (
            <>
              {/* Destination Address */}
              <div className="flex items-start gap-4 mb-6">
                <div className="mt-1 p-2 bg-[#FEF3C7] rounded-full text-[#D97706]">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Destination</p>
                  <p className="text-base font-bold text-[#1E1B3A] mt-0.5">Résidence les Jasmins</p>
                  <p className="text-sm text-slate-500">Lac 2, Tunis</p>
                </div>
              </div>

              {/* 4. ArrivalConfirmButton */}
              <button 
                onClick={handleArrival}
                disabled={!isGpsActive}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex justify-center items-center gap-3 transition-all ${isGpsActive ? 'bg-[#4F3D8A] text-white hover:bg-[#3B2D6E]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                Je suis arrivé <Navigation2 size={20} />
              </button>
              {!isGpsActive && <p className="text-center text-xs text-slate-400 mt-3 font-medium">Activez le partage GPS pour indiquer votre approche.</p>}
            </>
          ) : (
            /* 5. ServiceStartTimer & Actions */
            <div className="animate-in slide-in-from-bottom-8 duration-500">
              <div className="bg-[#F8FAFC] rounded-3xl p-8 flex flex-col items-center justify-center border border-slate-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F3D8A]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Chronomètre Prestation</h3>
                <div className="text-5xl font-black text-[#1E1B3A] tracking-tight font-mono mb-6">
                  {formatTime(timer)}
                </div>
                
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)} 
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isTimerRunning ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'}`}
                  >
                    {isTimerRunning ? <><PauseCircle size={20}/> Pause</> : <><Play size={20}/> Reprendre</>}
                  </button>
                  <button 
                    className="flex-1 bg-[#DC2626] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:bg-red-700 transition"
                  >
                    <StopCircle size={20} /> Terminer
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Custom icon for Pause since it's not strictly exported as PauseCircle sometimes
function PauseCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="10" y1="15" x2="10" y2="9"></line>
      <line x1="14" y1="15" x2="14" y2="9"></line>
    </svg>
  );
}
