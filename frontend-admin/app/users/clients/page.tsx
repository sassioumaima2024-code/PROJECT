"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { apiGet, apiPatch } from '../../../lib/api';
import AddUserModal from '../../../components/modals/AddUserModal';

export default function ClientsPage() {
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
      setUsers(data.filter((u: any) => u.role === 'client'));
    }
    setLoading(false);
  };

  const toggleUserStatus = async (id: number) => {
    const data = await apiPatch(`/admin/users/${id}/toggle`, {});
    if (!data.error) {
      setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    }
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher un client...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Clients</h1>
          <p className="text-slate-400 font-medium mt-1">Consultez et gérez la liste des utilisateurs du service.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-8 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          Ajouter un Client
        </button>
      </div>

      {showAddModal && (
        <AddUserModal 
          role="client" 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchData} 
        />
      )}

      <div className="premium-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs uppercase">
                      {user.name ? user.name[0] : user.email[0]}
                    </div>
                    <span className="font-bold text-slate-800">{user.name || user.email.split('@')[0]}</span>
                  </div>
                </td>
                <td className="p-6 text-slate-500 text-sm">{user.email}</td>
                <td className="p-6 text-slate-500 text-sm">{user.phone || 'Non renseigné'}</td>
                <td className="p-6">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {user.is_active ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className={`${user.is_active ? 'text-rose-500' : 'text-emerald-500'} font-bold text-xs uppercase tracking-widest hover:underline`}
                  >
                    {user.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  Aucun client ne correspond à "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
