'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, ChevronRight, ShieldCheck, Zap, Star } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique désactivée pour laisser le choix du rôle à l'accueil
    /*
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      if (role === 'prestataire') router.push('/prestataire');
      else router.push('/client');
    }
    */
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary-100 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-rose-100 blur-3xl opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-6 lg:px-12 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">SERVICY</span>
        </div>
        <nav className="hidden md:flex gap-8 font-medium text-slate-600">
          <a href="#comment-ca-marche" className="hover:text-primary-600 transition">Comment ça marche</a>
          <a href="#avantages" className="hover:text-primary-600 transition">Avantages</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="text-center max-w-3xl mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6 border border-primary-100">
            Plateforme N°1 en Tunisie 🇹🇳
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Trouvez les meilleurs <br />
            <span className="gradient-text">professionnels</span> pour vos besoins
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            De la plomberie au ménage en passant par la coiffure, réservez des prestataires vérifiés en quelques clics ou proposez vos services à des milliers de clients.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
          {/* Client Card */}
          <Link href="/login?role=client" className="group">
            <div className="glass-card rounded-3xl p-8 hover-lift h-full border border-white/60 bg-white/40">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <User size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Je suis un Client</h2>
              <p className="text-slate-600 mb-8">
                Je cherche un professionnel de confiance pour un service à domicile, une urgence ou un rendez-vous planifié.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <ShieldCheck size={18} className="text-green-500" />
                  Profils vérifiés et notés
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Zap size={18} className="text-amber-500" />
                  Mode urgence pour les besoins immédiats
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Star size={18} className="text-primary-500" />
                  Système d'avis transparent
                </li>
              </ul>

              <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
                <span>Accéder à mon espace</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Provider Card */}
          <Link href="/login?role=provider" className="group">
            <div className="glass-card rounded-3xl p-8 hover-lift h-full border border-white/60 bg-white/40">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Je suis un Prestataire</h2>
              <p className="text-slate-600 mb-8">
                Je suis un professionnel et je souhaite proposer mes services, développer mon activité et gérer mes rendez-vous.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <ShieldCheck size={18} className="text-green-500" />
                  Gérez votre calendrier et disponibilités
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Zap size={18} className="text-amber-500" />
                  Recevez des alertes d'urgence locales
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Star size={18} className="text-primary-500" />
                  Construisez votre réputation
                </li>
              </ul>

              <div className="flex items-center justify-between text-primary-600 font-semibold group-hover:text-primary-700">
                <span>Créer mon profil pro</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
