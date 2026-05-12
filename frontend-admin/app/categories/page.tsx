"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetch('http://127.0.0.1:8000/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
          throw new Error('Non autorisé');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    const name = window.prompt('Nom de la nouvelle catégorie :');
    if (!name) return;
    const description = window.prompt('Description :') || '';
    const icon = window.prompt('Icône (Emoji) :') || '📁';

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/categories', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, icon })
      });
      if (res.ok) {
        const newCat = await res.json();
        // Backend returns {message, id}
        setCategories([...categories, { id: newCat.id, name, description, icon, is_active: true }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  const filteredCategories = categories.filter(cat => 
    (cat.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (cat.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher une catégorie...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Catégories</h1>
          <p className="text-slate-400 font-medium mt-1">Gérez les domaines d'expertise disponibles sur SERVICY.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-light transition-all flex items-center space-x-3 uppercase text-xs tracking-widest"
        >
          <span className="text-xl">+</span>
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune catégorie trouvée</h3>
          <p className="text-slate-400">Aucune catégorie ne correspond à votre recherche "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, idx) => (
            <div key={cat.id} className="premium-card p-8 group animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform">
                  {cat.icon || '📁'}
                </div>
                <div className="flex space-x-2">
                  <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all">✏️</button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-3 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-300 hover:text-rose-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{cat.name}</h3>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed line-clamp-2">{cat.description || "Aucune description fournie."}</p>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">ID: #{cat.id}</p>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  Disponible
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
