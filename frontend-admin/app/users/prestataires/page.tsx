"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function PrestatairesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data.filter((u: any) => u.role === 'prestataire'));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const toggleUserStatus = async (id: number) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/users/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, is_active: data.is_active } : u));
      }
    } catch (err) {
      console.error(err);
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
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun prestataire trouvé</h3>
          <p className="text-slate-400">Aucun prestataire ne correspond à votre recherche "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map((user) => (
            <div key={user.id} className="premium-card p-8 group transition-all hover:border-teal-100">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl uppercase">
                  {user.name ? user.name[0] : user.email[0]}
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.is_active ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {user.is_active ? 'Actif' : 'Suspendu'}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">{user.name || user.email.split('@')[0]}</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">{user.email}</p>
              <div className="flex space-x-3">
                {!user.is_active ? (
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className="flex-1 py-3 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
                  >
                    Valider
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className="flex-1 py-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                  >
                    Suspendre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
