'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Camera, User, Mail, Phone, MapPin, Map as MapIcon, 
  Heart, Star, Moon, Globe, Bell, Shield, Fingerprint, Trash2, LogOut, X, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

// Mock Data
const FAVORITES = [
  { id: 1, name: 'Plomberie Express', category: 'Plomberie', rating: 4.9 },
  { id: 2, name: 'ElectroFix', category: 'Électricité', rating: 4.8 },
  { id: 3, name: 'Pro Ménage', category: 'Nettoyage', rating: 4.6 },
  { id: 4, name: 'Jardinage TN', category: 'Jardinier', rating: 4.7 },
];

export default function ClientProfilePage() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    sms: false,
    promos: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserInfo({
          firstName: data.nomCommercial || 'Utilisateur',
          lastName: '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nom_commercial: userInfo.firstName,
          phone: userInfo.phone,
          address: userInfo.address
        })
      });
      
      if (res.ok) {
        alert("Profil mis à jour dans la base de données !");
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/');
  };

  // Handlers
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`min-h-screen font-sans pb-24 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#FDF0F5] text-[#2D1B2E]'}`}>
      
      {/* HEADER */}
      <header className={`px-6 pt-12 pb-24 relative rounded-b-[40px] shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center gap-4 mb-4">
          <Link href="/client" className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Mon Profil</h1>
        </div>
      </header>

      <main className="px-6 -mt-16 relative z-20 space-y-6">
        
        {/* 1. ProfileAvatar & EditableInfoForm */}
        <section className={`rounded-3xl p-6 shadow-lg border relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#9B1D54] to-[#F48FB1] flex items-center justify-center text-white text-3xl font-black shadow-lg border-4 border-white">
                {userInfo.firstName.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-[#9B1D54] rounded-full flex items-center justify-center shadow-md border border-slate-100 hover:bg-slate-50 transition">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold mt-3">{userInfo.firstName} {userInfo.lastName}</h2>
            <p className="text-sm font-semibold text-[#C2185B]">Client Membre</p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nom</label>
                <div className={`flex items-center px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <User size={16} className="text-slate-400 mr-2" />
                  <input type="text" name="firstName" value={userInfo.firstName} onChange={handleInfoChange} className="w-full bg-transparent outline-none text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Prénom</label>
                <div className={`flex items-center px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <input type="text" name="lastName" value={userInfo.lastName} onChange={handleInfoChange} className="w-full bg-transparent outline-none text-sm font-medium" />
                </div>
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
              <div className={`flex items-center px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <Mail size={16} className="text-slate-400 mr-2" />
                <input type="email" name="email" value={userInfo.email} onChange={handleInfoChange} className="w-full bg-transparent outline-none text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Téléphone</label>
              <div className={`flex items-center px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <Phone size={16} className="text-slate-400 mr-2" />
                <input type="tel" name="phone" value={userInfo.phone} onChange={handleInfoChange} className="w-full bg-transparent outline-none text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Adresse principale</label>
              <div className={`flex items-center px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <MapPin size={16} className="text-[#C2185B] mr-2" />
                <input type="text" name="address" value={userInfo.address} onChange={handleInfoChange} className="w-full bg-transparent outline-none text-sm font-medium" />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleUpdate}
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 bg-[#9B1D54] hover:bg-[#831846] text-white rounded-xl font-bold shadow-lg shadow-[#9B1D54]/30 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Chargement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </section>

        {/* 2. FavoritesSection */}
        <section>
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <Heart size={20} className="mr-2 text-[#9B1D54]" fill="#9B1D54" /> Mes Favoris
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {FAVORITES.map(fav => (
              <div key={fav.id} className={`p-4 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-[#FCE4EC] text-[#C2185B] rounded-full flex items-center justify-center font-bold text-sm">
                    {fav.name.charAt(0)}
                  </div>
                  <Heart size={16} className="text-[#9B1D54]" fill="#9B1D54" />
                </div>
                <h4 className="font-bold text-sm leading-tight mb-1">{fav.name}</h4>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{fav.category}</span>
                  <span className="flex items-center text-xs font-bold text-[#E8A020]"><Star size={10} fill="currentColor" className="mr-0.5" />{fav.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Preferences (Dark Mode, Lang, Notifs) */}
        <section className={`rounded-3xl p-2 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          
          <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00897B] flex items-center justify-center"><Moon size={20} /></div>
              <div>
                <h4 className="font-bold text-sm">Mode Sombre</h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Thème de l'application</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#00897B]' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] text-[#1E88E5] flex items-center justify-center"><Globe size={20} /></div>
              <div>
                <h4 className="font-bold text-sm">Langue</h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Français (FR)</p>
              </div>
            </div>
            <button className="text-[#9B1D54] text-sm font-bold">Changer</button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] text-[#FFA000] flex items-center justify-center"><Bell size={20} /></div>
              <h4 className="font-bold text-sm">Notifications</h4>
            </div>
            <div className="space-y-3 pl-14">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Push (Rappels RDV)</span>
                <button onClick={() => toggleNotif('push')} className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${notifications.push ? 'bg-[#9B1D54]' : 'bg-slate-300'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${notifications.push ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>SMS (Urgences)</span>
                <button onClick={() => toggleNotif('sms')} className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${notifications.sms ? 'bg-[#9B1D54]' : 'bg-slate-300'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${notifications.sms ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* 4. SecuritySection */}
        <section className={`rounded-3xl p-2 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="p-4 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FCE4EC] text-[#D81B60] flex items-center justify-center"><Shield size={20} /></div>
            <h4 className="font-bold text-sm">Sécurité</h4>
          </div>
          
          <div className="px-4 pb-2 space-y-4">
            <button className="w-full flex items-center justify-between text-left group">
              <div>
                <span className="block text-sm font-bold">Changer le mot de passe</span>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dernière modif : il y a 2 mois</span>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-[#9B1D54] transition" />
            </button>
            
            <div className="flex items-center justify-between py-2 border-y border-dashed border-slate-200">
              <div className="flex items-center gap-2">
                <Fingerprint size={18} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'} />
                <span className="text-sm font-bold">Connexion Biométrique</span>
              </div>
              <button className="w-12 h-6 rounded-full p-1 transition-colors duration-300 bg-[#00897B]">
                <div className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-6" />
              </button>
            </div>
            
            <button className="w-full flex items-center justify-between text-left text-red-500 hover:bg-red-50 p-2 -ml-2 rounded-xl transition">
              <div className="flex items-center gap-2">
                <Trash2 size={18} />
                <span className="text-sm font-bold">Supprimer mon compte</span>
              </div>
            </button>
          </div>
        </section>

        {/* 5. LogoutButton */}
        <button 
          onClick={() => setShowLogoutDialog(true)}
          className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl font-bold text-lg transition ${isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <LogOut size={20} /> Se déconnecter
        </button>
      </main>

      {/* LOGOUT DIALOG */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 px-6">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            <h3 className={`text-xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-[#2D1B2E]'}`}>Déconnexion</h3>
            <p className={`text-center text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Êtes-vous sûr de vouloir vous déconnecter de votre compte SERVICY ?</p>
            
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutDialog(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                Annuler
              </button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/30">
                Oui, déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
