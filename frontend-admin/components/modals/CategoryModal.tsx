"use client";
import { useState, useEffect } from 'react';
import { apiPost, apiPatch } from '../../lib/api';

interface CategoryModalProps {
  onClose: () => void;
  onSuccess: (updatedCat: any) => void;
  initialData?: any; // If provided, we are in Edit mode
}

export default function CategoryModal({ onClose, onSuccess, initialData }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        icon: initialData.icon || '📁'
      });
    }
  }, [initialData]);

  const icons = ['📁', '🛠️', '🔌', '🚿', '🧹', '🎨', '🍳', '🚗', '💻', '📷', '👗', '💇', '🏗️', '📐', '🛡️', '⚡'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let res;
    if (isEdit) {
      res = await apiPatch(`/admin/categories/${initialData.id}`, formData);
    } else {
      res = await apiPost('/admin/categories', formData);
    }

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onSuccess({ ...formData, id: isEdit ? initialData.id : res.id, is_active: true });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] w-full max-w-lg overflow-hidden animate-scale-in border border-white/20">
        <div className="p-10 border-b border-slate-50 flex justify-between items-start bg-slate-50/30 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {isEdit ? 'Modifier' : 'Nouvelle'} <span className="text-primary">Catégorie</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {isEdit ? `Modification de CAT-${initialData.id.toString().padStart(3, '0')}` : "Élargissez les domaines d'expertise"}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all duration-300 relative z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl text-xs font-bold animate-shake flex items-center gap-3">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs-bold text-slate-400 ml-4">Nom de la Catégorie</label>
              <input
                required
                type="text"
                placeholder="Ex: Plomberie, Électricité..."
                className="premium-input w-full"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs-bold text-slate-400 ml-4">Description</label>
              <textarea
                rows={3}
                placeholder="Décrivez brièvement les services inclus..."
                className="premium-input w-full resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs-bold text-slate-400 ml-4">Icône Représentative</label>
              <div className="grid grid-cols-8 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${formData.icon === icon ? 'bg-primary text-white shadow-lg scale-110' : 'bg-white hover:bg-slate-100 text-slate-400'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-5 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all flex-shrink-0"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-gradient-to-r from-primary to-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  {isEdit ? 'Mettre à jour' : 'Créer la catégorie'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
