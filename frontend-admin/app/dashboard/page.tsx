'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    appointments: 0,
    services: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await apiGet('/admin/users');
        const appointments = await apiGet('/admin/appointments');
        const services = await apiGet('/services');
        setStats({
          users: Array.isArray(users) ? users.length : 0,
          appointments: Array.isArray(appointments) ? appointments.length : 0,
          services: Array.isArray(services) ? services.length : 0,
        });
      } catch (e) {
        console.error(e);
      }
    };
    loadStats();
  }, []);

  const cards = [
    { label: 'Utilisateurs', value: stats.users, icon: '👥', color: 'bg-blue-50 border-blue-200' },
    { label: 'Réservations', value: stats.appointments, icon: '📅', color: 'bg-green-50 border-green-200' },
    { label: 'Services', value: stats.services, icon: '🔧', color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-rose-800 mb-2">Tableau de bord</h1>
      <p className="text-gray-500 mb-8">Bienvenue sur le panel d'administration SERVICY</p>

      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border-2 ${card.color} p-6 shadow-sm`}
          >
            <div className="text-4xl mb-3">{card.icon}</div>
            <div className="text-3xl font-bold text-gray-800">{card.value}</div>
            <div className="text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}