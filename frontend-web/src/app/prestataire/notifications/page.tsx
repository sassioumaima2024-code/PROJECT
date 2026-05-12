'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle2, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProviderNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans pb-24">
      <header className="bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white px-6 pt-12 pb-6 shadow-sm rounded-b-[40px] flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black">Notifications Prestataire</h1>
      </header>

      <main className="px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-8 h-8 border-4 border-[#4F3D8A] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold">Chargement...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative ${notif.isRead ? 'bg-white/60 border-slate-100 opacity-60' : 'bg-white border-[#A78BFA] shadow-md'}`}
              >
                {!notif.isRead && (
                  <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-[#4F3D8A] rounded-full border-2 border-white"></div>
                )}
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-100' : 'bg-[#F3F0FF]'}`}>
                    <Bell size={20} className={notif.isRead ? 'text-slate-400' : 'text-[#4F3D8A]'} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${notif.isRead ? 'text-slate-500' : 'text-[#1E1B3A]'}`}>{notif.title}</h3>
                    <p className={`text-xs leading-relaxed mb-2 ${notif.isRead ? 'text-slate-400' : 'text-slate-600'}`}>{notif.body}</p>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center"><Clock size={12} className="mr-1" /> {notif.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <Bell size={64} className="mx-auto mb-4" />
            <p className="font-bold">Aucune alerte</p>
          </div>
        )}
      </main>
    </div>
  );
}
