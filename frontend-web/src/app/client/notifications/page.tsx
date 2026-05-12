'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle2, MessageSquare, AlertCircle, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
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
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'message': return <MessageSquare size={20} className="text-blue-500" />;
      case 'alert': return <AlertCircle size={20} className="text-red-500" />;
      default: return <Bell size={20} className="text-[#9B1D54]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF0F5] font-sans pb-24">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-[40px] flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-[#2D1B2E]">Notifications</h1>
      </header>

      <main className="px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-8 h-8 border-4 border-[#9B1D54] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold">Chargement...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer relative ${notif.isRead ? 'bg-white/60 border-slate-100 grayscale-[0.5]' : 'bg-white border-[#F48FB1] shadow-md shadow-[#9B1D54]/5'}`}
              >
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-[#9B1D54] rounded-full"></div>
                )}
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-100' : 'bg-[#FDF0F5]'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${notif.isRead ? 'text-slate-500' : 'text-[#2D1B2E]'}`}>{notif.title}</h3>
                    <p className={`text-xs leading-relaxed mb-2 ${notif.isRead ? 'text-slate-400' : 'text-slate-600'}`}>{notif.body}</p>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center"><Clock size={10} className="mr-1" /> {notif.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <Bell size={64} className="mx-auto mb-4" />
            <p className="font-bold">Aucune notification pour le moment</p>
          </div>
        )}
      </main>
    </div>
  );
}
