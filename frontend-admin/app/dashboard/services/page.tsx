'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  provider: string;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadServices();
  }, [filter]);

  const loadServices = async () => {
    try {
      const data = await apiGet(`/services?active=${filter === 'all' ? '' : filter === 'active'}`);
      setServices(data.data || []);
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await apiPatch(`/admin/services/${id}`, { is_active: !isActive });
      setServices(services.map(service => 
        service.id === id ? { ...service, is_active: !isActive } : service
      ));
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm('Supprimer ce service?')) {
      try {
        await apiDelete(`/admin/services/${id}`);
        setServices(services.filter(service => service.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-rose-800">Gestion des Services</h1>
        <p className="text-gray-600 mt-2">Gérer tous les services proposés sur la plateforme</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous les services
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'active'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Actifs
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'inactive'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Inactifs
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Catégorie</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prestataire</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prix</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Durée</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Aucun service
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{service.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.provider}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{service.price.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.duration} min</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(service.id, service.is_active)}
                        className={`font-semibold ${
                          service.is_active 
                            ? 'text-orange-600 hover:text-orange-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {service.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Supprimer
                      </button>
                    </div>
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