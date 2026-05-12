'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, Briefcase, TrendingUp, User, MapPin, Clock, Star, AlertTriangle, CheckCircle, XCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function PrestataireDashboard() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const [userName, setUserName] = useState('Prestataire');
  const [stats, setStats] = useState({ today: 0, month: 0, rating: 0 });
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/');
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token || role !== 'prestataire') {
        router.push('/login?role=provider');
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [profileRes, statsRes, apptsRes] = await Promise.all([
          fetch('http://localhost:8000/api/profile', { headers }),
          fetch('http://localhost:8000/api/provider/stats', { headers }),
          fetch('http://localhost:8000/api/provider/appointments', { headers })
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setUserName(data.nomCommercial || 'Prestataire');
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (apptsRes.ok) {
          const apptsData = await apptsRes.json();
          const appointments = apptsData.data || [];
          
          const upcoming = appointments.find((a: any) => 
            a.status.toLowerCase() === 'confirmed' || 
            a.status.toLowerCase() === 'in_progress'
          );
          setNextAppointment(upcoming);
          
          const pending = appointments.filter((a: any) => 
            a.status.toLowerCase() === 'pending'
          );
          setPendingRequests(pending);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    
    fetchAllData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans pb-24">
      
      {/* 1. WelcomeBanner & NotificationBell */}
      <header className="bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white pt-12 pb-24 px-6 rounded-b-[40px] relative shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full border-2 border-[#D4A017] flex items-center justify-center overflow-hidden backdrop-blur-sm">
              {/* Photo placeholder */}
              <span className="font-bold text-xl text-white">{userName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-[#E0D4FF] text-sm font-medium">Bonjour,</p>
              <h1 className="text-2xl font-bold">{userName}</h1>
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map((star, i) => (
                  <Star key={i} size={14} fill={i < Math.round(stats.rating) ? "#D4A017" : "transparent"} className={i < Math.round(stats.rating) ? "text-[#D4A017]" : "text-[#D4A017]/30"} />
                ))}
                <span className="ml-1 text-sm font-semibold text-[#D4A017]">{stats.rating}</span>
              </div>
            </div>
          </div>
          
          <Link href="/prestataire/notifications" className="relative w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition">
            <Bell size={24} className="text-white" />
            <span className="absolute top-2 right-3 w-3 h-3 bg-[#DC2626] rounded-full border-2 border-[#4F3D8A]"></span>
          </Link>
        </div>
      </header>

      {/* 2. StatsRow (3 cartes) */}
      <div className="px-6 -mt-16 relative z-10 grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-[4px] border-[#D4A017] flex flex-col items-center">
          <span className="text-3xl font-extrabold text-[#1E1B3A]">{stats.today}</span>
          <span className="text-[10px] uppercase text-[#7C5CBF] font-bold text-center mt-1">Aujourd'hui</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-[4px] border-[#D4A017] flex flex-col items-center">
          <span className="text-3xl font-extrabold text-[#1E1B3A]">{stats.month}</span>
          <span className="text-[10px] uppercase text-[#7C5CBF] font-bold text-center mt-1">Ce Mois</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md border-l-[4px] border-[#D4A017] flex flex-col items-center">
          <span className="text-3xl font-extrabold text-[#1E1B3A]">{stats.rating}</span>
          <span className="text-[10px] uppercase text-[#7C5CBF] font-bold text-center mt-1">Note Globale</span>
        </div>
      </div>

      <main className="px-6 space-y-8">
        
        {/* 3. AvailabilityToggle (Switch ON/OFF) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1E1B3A]">Disponible maintenant</h2>
            <p className="text-sm text-slate-500 mt-1">Recevoir les alertes d'urgence</p>
          </div>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${isAvailable ? 'bg-[#059669]' : 'bg-slate-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-8' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 4. UpcomingAppointmentCard */}
        <div>
          <h2 className="text-xl font-bold text-[#1E1B3A] mb-4">Prochain Rendez-vous</h2>
          {nextAppointment ? (
            <div className="bg-gradient-to-br from-[#4F3D8A] to-[#A78BFA] rounded-3xl p-6 text-white shadow-lg shadow-[#4F3D8A]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3 border border-white/30">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#D4A017] mr-1.5 animate-pulse"></span>
                    {nextAppointment.status.toLowerCase() === 'confirmed' ? 'Confirmé' : 'En cours'}
                  </span>
                  <h3 className="text-xl font-bold leading-tight">{nextAppointment.service?.title}</h3>
                  <p className="text-[#E0D4FF] mt-1 flex items-center font-medium">
                    <User size={16} className="mr-2"/> {nextAppointment.client?.name}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 relative z-10 bg-black/10 rounded-2xl p-4 border border-white/10">
                <p className="flex items-center text-sm font-semibold"><Clock size={18} className="mr-3 text-[#D4A017]"/> {nextAppointment.scheduledAt}</p>
                <p className="flex items-center text-sm font-semibold"><MapPin size={18} className="mr-3 text-[#D4A017]"/> {nextAppointment.client?.address || 'Adresse non spécifiée'}</p>
              </div>

              <button className="w-full bg-white text-[#4F3D8A] py-3 rounded-xl font-bold shadow-md hover:bg-slate-50 transition flex items-center justify-center">
                Démarrer la prestation
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Calendar size={32} />
              </div>
              <p className="text-slate-500 font-bold">Aucun rendez-vous prévu</p>
              <p className="text-xs text-slate-400 mt-1">Vos futures missions apparaîtront ici</p>
            </div>
          )}
        </div>

        {/* 5. PendingRequestsList */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1E1B3A]">Demandes en attente ({pendingRequests.length})</h2>
            <Link href="/prestataire/demandes" className="text-[#4F3D8A] text-sm font-bold">Voir tout</Link>
          </div>

          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((appt) => (
                <div key={appt.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#4F3D8A] font-bold text-lg">
                        {appt.client?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E1B3A]">{appt.client?.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">Demande reçue</p>
                      </div>
                    </div>
                    <span className="text-[#4F3D8A] font-bold text-sm">{appt.budget || '0'} DT</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-5 bg-slate-50 p-3 rounded-xl">
                    <span className="flex items-center gap-1"><Clock size={14} className="text-[#7C5CBF]"/> {appt.scheduledAt}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-[#7C5CBF]"/> {appt.client?.address || 'Adresse...'}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-[#4F3D8A] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#4F3D8A]/20 transition">Accepter</button>
                    <button className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Refuser</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">Aucune demande en attente</p>
              </div>
            )}
          </div>
        </div>

        {/* 6. QuickNavGrid */}
        <div>
          <h2 className="text-xl font-bold text-[#1E1B3A] mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/prestataire/agenda" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:border-[#A78BFA] hover:shadow-md transition group">
              <div className="w-14 h-14 bg-[#F3F0FF] rounded-2xl flex items-center justify-center mb-3 text-[#4F3D8A] group-hover:scale-110 transition-transform">
                <Calendar size={28} />
              </div>
              <span className="font-semibold text-[#1E1B3A]">Agenda</span>
            </Link>
            <Link href="/prestataire/services" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:border-[#A78BFA] hover:shadow-md transition group">
              <div className="w-14 h-14 bg-[#F3F0FF] rounded-2xl flex items-center justify-center mb-3 text-[#4F3D8A] group-hover:scale-110 transition-transform">
                <Briefcase size={28} />
              </div>
              <span className="font-semibold text-[#1E1B3A]">Mes Services</span>
            </Link>
            <Link href="/prestataire/revenus" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:border-[#A78BFA] hover:shadow-md transition group">
              <div className="w-14 h-14 bg-[#F3F0FF] rounded-2xl flex items-center justify-center mb-3 text-[#4F3D8A] group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <span className="font-semibold text-[#1E1B3A]">Revenus</span>
            </Link>
            <Link href="/prestataire/profil" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:border-[#A78BFA] hover:shadow-md transition group">
              <div className="w-14 h-14 bg-[#F3F0FF] rounded-2xl flex items-center justify-center mb-3 text-[#4F3D8A] group-hover:scale-110 transition-transform">
                <User size={28} />
              </div>
              <span className="font-semibold text-[#1E1B3A]">Mon Profil</span>
            </Link>
          </div>
        </div>

        {/* 7. Logout Button */}
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
