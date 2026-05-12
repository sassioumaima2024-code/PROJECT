"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { apiGet, apiDelete } from '../../lib/api';
import CategoryModal from '../../components/modals/CategoryModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await apiGet('/admin/categories');
    if (Array.isArray(data)) setCategories(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;
    const res = await apiDelete(`/admin/categories/${id}`);
    if (!res.error) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleEdit = (cat: any) => {
    setSelectedCategory(cat);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleSuccess = (updatedCat: any) => {
    if (selectedCategory) {
      // Update existing
      setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
    } else {
      // Add new
      setCategories([...categories, updatedCat]);
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
          onClick={handleAdd}
          className="px-8 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          Nouvelle Catégorie
        </button>
      </div>

      {showModal && (
        <CategoryModal 
          initialData={selectedCategory}
          onClose={() => setShowModal(false)} 
          onSuccess={handleSuccess} 
        />
      )}

      {filteredCategories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-fade-in">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">🔍</div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Aucune catégorie</h3>
          <p className="text-slate-400 font-medium max-w-xs mx-auto">Aucune catégorie ne correspond à votre recherche "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, idx) => (
            <div key={cat.id} className="premium-card p-8 group animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {cat.icon || '📁'}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="w-10 h-10 bg-slate-50 hover:bg-white hover:shadow-lg rounded-xl text-slate-400 hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-slate-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="w-10 h-10 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl text-rose-400 transition-all flex items-center justify-center border border-transparent"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed line-clamp-2 min-h-[40px]">{cat.description || "Aucune description fournie."}</p>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Référence</p>
                  <p className="text-[11px] font-bold text-slate-500 tracking-wider">CAT-{cat.id.toString().padStart(3, '0')}</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Actif</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
