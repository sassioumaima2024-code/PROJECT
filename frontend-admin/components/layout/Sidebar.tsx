import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: '📊' },
    { name: 'Prestataires', href: '/users/prestataires', icon: '👷' },
    { name: 'Clients', href: '/users/clients', icon: '👤' },
    { name: 'Services', href: '/services', icon: '🛠️' },
    { name: 'Rendez-vous', href: '/appointments', icon: '📅' },
    { name: 'Avis', href: '/reviews', icon: '⭐' },
    { name: 'Catégories', href: '/categories', icon: '📁' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 sidebar-glass text-white h-screen fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-8 text-center border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-widest text-white">SERVICY</h1>
        <p className="text-teal-200 text-xs font-semibold uppercase mt-1 tracking-widest">Admin Dashboard</p>
      </div>
      <nav className="mt-10 px-6 space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/5"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-semibold text-sm tracking-wide">{item.name}</span>
          </Link>
        ))}
        {/* New Item */}
        <Link
          href="/governorates"
          className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/5"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">📍</span>
          <span className="font-semibold text-sm tracking-wide">Gouvernorats</span>
        </Link>
      </nav>
      <div className="mt-12 px-6 pb-10">
        <button 
          onClick={handleLogout}
          className="w-full p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
