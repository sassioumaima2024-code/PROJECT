'use client';

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
// @ts-ignore
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalClients: number;
  totalAppointments: number;
  thisMonthAppointments: number;
  totalReviews: number;
  averageRating: number;
}

interface ChartData {
  month: string;
  appointments: number;
  revenue: number;
}

interface PieData {
  name: string;
  value: number;
}

const COLORS = ['#4F3D8A', '#7C5CBF', '#A78BFA', '#D4A017'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiGet('/admin/dashboard/stats');
      setStats(data);

      // Generate mock chart data
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
      setChartData(
        months.map((month, i) => ({
          month,
          appointments: Math.floor(Math.random() * 100 + 50),
          revenue: Math.floor(Math.random() * 5000 + 2000),
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12">Erreur de chargement</div>;
  }

  const kpiData = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 border-blue-200' },
    { label: 'Prestataires', value: stats.totalProviders, icon: '🔧', color: 'bg-purple-50 border-purple-200' },
    { label: 'Clients', value: stats.totalClients, icon: '👤', color: 'bg-green-50 border-green-200' },
    { label: 'RDV ce mois', value: stats.thisMonthAppointments, icon: '📅', color: 'bg-orange-50 border-orange-200' },
  ];

  const pieData = [
    { name: 'Prestataires', value: stats.totalProviders },
    { name: 'Clients', value: stats.totalClients },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-rose-800 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme SERVICY</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-white rounded-2xl border-2 ${kpi.color} p-6 shadow-sm hover:shadow-md transition`}
          >
            <div className="text-4xl mb-3">{kpi.icon}</div>
            <div className="text-3xl font-bold text-gray-800">{kpi.value}</div>
            <div className="text-gray-600 mt-1 text-sm">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Rendez-vous (6 derniers mois)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="#4F3D8A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Revenus (6 derniers mois)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#D4A017" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Répartition Utilisateurs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: PieData) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Résumé</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Avis</span>
              <span className="font-bold">{stats.totalReviews}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Note Moyenne</span>
              <span className="font-bold">{(stats.averageRating || 0).toFixed(1)} ⭐</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Total RDV</span>
              <span className="font-bold">{stats.totalAppointments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
