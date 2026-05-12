"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { apiGet, apiPatch } from '../../../lib/api';
import AddUserModal from '../../../components/modals/AddUserModal';
import Link from 'next/link';

export default function PrestatairesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await apiGet('/admin/users');
    if (Array.isArray(data)) {
      setUsers(data.filter((u: any) => u.role === 'prestataire'));
    }
    setLoading(false);
  };

  const toggleUserStatus = async (id: number) => {
    const data = await apiPatch(`/admin/users/${id}/toggle`, {});
    if (!data.error) {
      setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    }
  };

  const validateProvider = async (id: number) => {
    const data = await apiPatch(`/admin/providers/${id}/validate`, {});
    if (!data.error) {
      // Re-fetch to get updated verification status
      fetchData();
    }
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher un prestataire...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Prestataires de Services</h1>
          <p className="text-slate-400 font-medium mt-1">Gérez et validez les comptes des professionnels inscrits.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-8 py-4 bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          Ajouter un Prestataire
        </button>
      </div>

      {showAddModal && (
        <AddUserModal 
          role="prestataire" 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchData} 
        />
      )}

      {filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun prestataire trouvé</h3>
          <p className="text-slate-400">Aucun prestataire ne correspond à votre recherche "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map((user) => (
            <div key={user.id} className="premium-card p-8 group transition-all hover:border-teal-100 relative">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl uppercase">
                  {user.name ? user.name[0] : user.email[0]}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.is_active ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {user.is_active ? 'Actif' : 'Suspendu'}
                  </span>
                  {!user.is_verified && (
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                      Vérification Requise
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">{user.name || user.email.split('@')[0]}</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">{user.email}</p>
              
              <div className="flex flex-col space-y-3">
                {!user.is_verified ? (
                  <button 
                    onClick={() => validateProvider(user.id)}
                    className="w-full py-3 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
                  >
                    Valider le Compte
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className={`w-full py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all ${user.is_active ? 'bg-rose-600 shadow-rose-100 hover:bg-rose-700' : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700'}`}
                  >
                    {user.is_active ? 'Suspendre' : 'Réactiver'}
                  </button>
                )}
                <Link href={`/users/prestataires/${user.id}`} className="w-full">
                  <button className="w-full py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                    Voir Profil Détail
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
