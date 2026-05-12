'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';

interface Provider {
  id: number;
  email: string;
  nom_commercial: string;
  rating: number;
  is_active: boolean;
  is_verified: boolean;
  bad_ratings_count: number;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProviders();
  }, [filter]);

  const loadProviders = async () => {
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const data = await apiGet(`/admin/providers${query}`);
      setProviders(data.data || []);
    } catch (error) {
      console.error('Erreur chargement prestataires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (providerId: number) => {
    try {
      await apiPatch(`/admin/providers/${providerId}/validate`, {});
      loadProviders();
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  const handleSuspend = async (providerId: number) => {
    const reason = prompt('Raison de la suspension:');
    if (reason) {
      try {
        await apiPatch(`/admin/providers/${providerId}/suspend`, { reason });
        loadProviders();
      } catch (error) {
        console.error('Erreur suspension:', error);
      }
    }
  };

  const filteredProviders = providers.filter((p) =>
    p.nom_commercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-rose-800">Gestion des Prestataires</h1>
        <p className="text-gray-600 mt-2">Gérer les comptes et valider les inscriptions</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />

        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'suspended', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f === 'all' && 'Tous'}
              {f === 'active' && '✓ Actifs'}
              {f === 'suspended' && '✗ Suspendus'}
              {f === 'pending' && '⏳ En attente'}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mauvaises notes</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : filteredProviders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun prestataire trouvé
                </td>
              </tr>
            ) : (
              filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{provider.nom_commercial}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{provider.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="flex items-center gap-1">
                      {'⭐'.repeat(Math.floor(provider.rating || 0))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        provider.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {provider.is_active ? '✓ Actif' : '✗ Suspendu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`${
                        provider.bad_ratings_count >= 10
                          ? 'text-red-600 font-bold'
                          : 'text-gray-600'
                      }`}
                    >
                      {provider.bad_ratings_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {!provider.is_verified && (
                      <button
                        onClick={() => handleValidate(provider.id)}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        Valider
                      </button>
                    )}
                    {provider.is_active && (
                      <button
                        onClick={() => handleSuspend(provider.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Suspendre
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
