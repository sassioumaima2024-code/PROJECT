'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiLogin(email, password);
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_role', data.user.role);
        if (data.user.role === 'admin') {
          router.push('/dashboard');
        } else {
          setError('Acces refuse - compte admin requis');
        }
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#9B1D54] to-[#C2185B] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-200">
            <span className="text-white text-5xl font-black">S</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">SERVICY</h1>
          <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mt-2">Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rose-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-800 bg-pink-50"
              placeholder="admin@servicy.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-800 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-800 bg-pink-50"
              placeholder="........"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9B1D54] text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-[#C2185B] transition-all shadow-xl shadow-rose-100 disabled:opacity-50"
          >
            {loading ? 'Authentification...' : 'Accéder au Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}