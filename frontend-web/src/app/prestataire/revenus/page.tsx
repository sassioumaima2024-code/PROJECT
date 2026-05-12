'use client';

import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, CalendarCheck, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function RevenusPage() {
  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white p-6 pb-20 shadow-lg relative z-10 rounded-b-[40px]">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/prestataire" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Revenus & Statistiques</h1>
        </div>
      </header>

      <main className="px-6 -mt-12 relative z-20 space-y-6">

        {/* 1. Global Revenue Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase mb-2">Revenus ce mois</p>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-black text-[#1E1B3A]">1,450 <span className="text-xl text-slate-400">DT</span></h2>
            <div className="flex items-center text-[#059669] bg-[#D1FAE5] px-3 py-1.5 rounded-full font-bold text-sm">
              <TrendingUp size={16} className="mr-1" /> +12%
            </div>
          </div>
          
          {/* Mock Chart SVG (RevenueChart) */}
          <div className="mt-8 flex items-end justify-between h-32 gap-2">
            {[40, 60, 30, 80, 50, 100, 70].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end" style={{ height: '100px' }}>
                  <div className={`w-full rounded-t-lg transition-all duration-1000 ${i === 5 ? 'bg-[#D4A017]' : 'bg-[#A78BFA]'}`} style={{ height: `${height}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. StatsKPIRow */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#ECFDF5] text-[#059669] rounded-full flex items-center justify-center mb-2"><CheckCircle size={18} /></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Acceptation</p>
            <p className="text-xl font-black text-[#1E1B3A]">95%</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#F3F0FF] text-[#4F3D8A] rounded-full flex items-center justify-center mb-2"><CalendarCheck size={18} /></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Complétés</p>
            <p className="text-xl font-black text-[#1E1B3A]">42</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-[#FEF2F2] text-[#DC2626] rounded-full flex items-center justify-center mb-2"><XCircle size={18} /></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Annulation</p>
            <p className="text-xl font-black text-[#1E1B3A]">2%</p>
          </div>
        </div>

        {/* 3. RatingRadarChart (Mock via Circular Progress) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-[#1E1B3A] mb-6 flex items-center"><BarChart2 size={18} className="mr-2 text-[#4F3D8A]" /> Qualité de service</h3>
          
          <div className="flex justify-between items-center px-4">
            {/* Ponctualité */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#F3F0FF] border-t-[#D4A017] border-r-[#D4A017] flex items-center justify-center mb-2 transform -rotate-45">
                <span className="transform rotate-45 font-black text-[#1E1B3A]">4.9</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Ponctuel</span>
            </div>
            
            {/* Qualité */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#F3F0FF] border-t-[#4F3D8A] border-r-[#4F3D8A] border-b-[#4F3D8A] flex items-center justify-center mb-2">
                <span className="font-black text-[#1E1B3A] text-xl">4.8</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Qualité</span>
            </div>
            
            {/* Pro */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#F3F0FF] border-t-[#059669] border-r-[#059669] flex items-center justify-center mb-2">
                <span className="font-black text-[#1E1B3A]">4.7</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Pro</span>
            </div>
          </div>
        </div>

        {/* 4. TopServicesCard */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-[#1E1B3A] mb-4">Services les plus demandés</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#1E1B3A] text-sm">Réparation Fuite Chauffe-eau</p>
                <p className="text-xs font-medium text-slate-400">24 réservations</p>
              </div>
              <span className="font-bold text-[#4F3D8A]">57%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-[#4F3D8A] rounded-full" style={{ width: '57%' }}></div></div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-bold text-[#1E1B3A] text-sm">Débouchage Canalisation</p>
                <p className="text-xs font-medium text-slate-400">12 réservations</p>
              </div>
              <span className="font-bold text-[#A78BFA]">28%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-[#A78BFA] rounded-full" style={{ width: '28%' }}></div></div>
          </div>
        </div>

        {/* 5. BadRatingsAlert (Alerte si >= 10) */}
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <div className="bg-[#DC2626] p-2 rounded-full text-white shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#991B1B]">Avertissement Compte</h4>
            <p className="text-sm text-[#B91C1C] mt-1 font-medium">Vous avez reçu <strong>8 mauvaises notes</strong> récemment. Si vous atteignez 10, votre compte pourrait être suspendu. Veuillez vérifier vos retours clients.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
