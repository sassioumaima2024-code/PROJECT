'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiLogin } from '@/lib/api';
import Link from 'next/link';
import { User, Briefcase, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client'; // default to client
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isClient = role === 'client';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiLogin(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        
        // Verify role matches requested platform
        if (isClient && data.user.role !== 'client') {
          setError("Ce compte n'est pas un compte client.");
          setLoading(false);
          return;
        }
        if (!isClient && data.user.role !== 'prestataire') {
          setError("Ce compte n'est pas un compte prestataire.");
          setLoading(false);
          return;
        }
        
        // Redirect to respective dashboard
        router.push(`/${data.user.role}`);
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
          isClient ? 'bg-blue-100 text-blue-600 shadow-blue-200' : 'bg-indigo-100 text-indigo-600 shadow-indigo-200'
        }`}>
          {isClient ? <User size={32} /> : <Briefcase size={32} />}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Espace {isClient ? 'Client' : 'Prestataire'}
        </h1>
        <p className="text-slate-500">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition"
            placeholder={isClient ? "jean.dupont@email.com" : "contact@entreprise.com"}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white rounded-xl py-3.5 font-bold text-lg transition disabled:opacity-70 shadow-lg ${
            isClient 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-slate-600 text-sm">
            Vous n'avez pas de compte ?{' '}
            <Link href={`/register?role=${role}`} className={`font-bold hover:underline ${isClient ? 'text-blue-600' : 'text-primary-600'}`}>
              S'inscrire
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-indigo-100 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-blue-100 blur-3xl opacity-50 pointer-events-none" />

      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 font-medium transition">
          <ArrowLeft size={20} className="mr-2" />
          Retour à l'accueil
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Suspense fallback={<div className="text-slate-500 font-medium">Chargement...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
