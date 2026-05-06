'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../../lib/api';

interface User {
  id: number;
  email: string;
  role: string;
  phone: string;
  is_active: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/admin/users').then((data) => {
      if (Array.isArray(data)) setUsers(data);
      setLoading(false);
    });
  }, []);

  const toggleActive = async (id: number, current: boolean) => {
    await apiPatch(`/admin/users/${id}/toggle`, { is_active: !current });
    setUsers(users.map((u) => u.id === id ? { ...u, is_active: !current } : u));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-rose-800 mb-6">Gestion des utilisateurs</h1>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-rose-50">
              <tr>
                <th className="px-6 py-4 text-left text-rose-800 font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-rose-800 font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-rose-800 font-semibold">Rôle</th>
                <th className="px-6 py-4 text-left text-rose-800 font-semibold">Téléphone</th>
                <th className="px-6 py-4 text-left text-rose-800 font-semibold">Statut</th>
                <th className="px-6 py-4 text-left text-rose-800 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-pink-50">
                  <td className="px-6 py-4 text-gray-600">#{user.id}</td>
                  <td className="px-6 py-4 font-medium">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'prestataire' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(user.id, user.is_active)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        user.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.is_active ? 'Suspendre' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}