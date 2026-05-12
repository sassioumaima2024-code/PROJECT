'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';

interface Appointment {
  id: number;
  client_name: string;
  provider_name: string;
  service: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      const data = await apiGet(`/admin/appointments?status=${filter === 'all' ? '' : filter}`);
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiPatch(`/admin/appointments/${id}`, { status });
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: status as Appointment['status'] } : apt
      ));
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-rose-800">Gestion des Rendez-vous</h1>
        <p className="text-gray-600 mt-2">Gérer et suivre tous les rendez-vous</p>
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
          Tous
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'pending'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En attente
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'confirmed'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Confirmés
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'completed'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Terminés
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prestataire</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date et Heure</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prix</th>
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
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Aucun rendez-vous
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{appointment.client_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{appointment.provider_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{appointment.service || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{appointment.appointment_date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{(appointment.price || 0).toFixed(2)} TND</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                          className="text-green-600 hover:text-green-800 font-semibold"
                        >
                          Confirmer
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Terminer
                        </button>
                      )}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Annuler
                        </button>
                      )}
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