import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { apiGet } from '../../lib/api';

interface AdminLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onSearch, searchPlaceholder }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/admin/dashboard/stats').then(data => {
      if (data.alerts) setAlerts(data.alerts);
    });
  }, []);

  return (
    <div className="flex bg-[#f8fafc] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Global Professional Header */}
        <header className="flex justify-between items-center mb-10 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 sticky top-6 z-50">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#9B1D54] to-[#C2185B] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary/20 text-white font-black">
              S
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Système SERVICY</p>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Bonjour, Ghada</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className={`flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 transition-all focus-within:ring-4 focus-within:ring-primary/10 ${onSearch ? 'w-80' : 'opacity-50'}`}>
              <span className="ml-3 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder={searchPlaceholder || "Rechercher..."} 
                onChange={(e) => onSearch && onSearch(e.target.value)}
                disabled={!onSearch}
                className="bg-transparent border-none focus:ring-0 text-sm px-4 py-2 w-full font-medium text-slate-600 outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-slate-100 relative active:scale-95"
                >
                  <span className="text-xl">🔔</span>
                  {alerts.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-6 w-96 bg-white rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.15)] border border-slate-100 p-8 z-[100] animate-fade-in text-slate-800">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Notifications</h4>
                      <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest">
                        {alerts.length} Nouvelles
                      </span>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {alerts.map((alert: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-50 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group">
                          <p className="text-sm font-black mb-1 text-slate-800 group-hover:text-primary transition-colors">{alert.title}</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{alert.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-black text-slate-800">Ghada Admin</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">En ligne</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-primary flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-105 transition-all border border-white">
                  G
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
