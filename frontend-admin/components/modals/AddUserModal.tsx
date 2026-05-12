"use client";
import { useState } from 'react';
import { apiPost } from '../../lib/api';

interface AddUserModalProps {
  role: 'client' | 'prestataire';
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ role, onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiPost('/admin/users', { ...formData, role });
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] w-full max-w-lg overflow-hidden animate-scale-in border border-white/20">
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-start bg-slate-50/30 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
              Ajouter un <span className="text-primary">{role === 'prestataire' ? 'Prestataire' : 'Client'}</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Nouveau compte utilisateur SERVICY</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all duration-300 relative z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          {/* Decorative element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl text-xs font-bold animate-shake flex items-center gap-3">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-xs-bold text-slate-400 ml-4">Nom Complet / Commercial</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">👤</span>
                <input
                  required
                  type="text"
                  placeholder="Ex: Jean Dupont ou Plomberie Express"
                  className="premium-input w-full pl-12"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs-bold text-slate-400 ml-4">Adresse Email</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">✉️</span>
                <input
                  required
                  type="email"
                  placeholder="nom@exemple.com"
                  className="premium-input w-full pl-12"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs-bold text-slate-400 ml-4">Téléphone</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">📞</span>
                <input
                  required
                  type="tel"
                  placeholder="216 -- --- ---"
                  className="premium-input w-full pl-12"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs-bold text-slate-400 ml-4">Mot de passe temporaire</label>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 border-dashed">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm tracking-wide">{formData.password}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">L'utilisateur pourra changer son mot de passe</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-5 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all flex-shrink-0"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  Finaliser la création
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
