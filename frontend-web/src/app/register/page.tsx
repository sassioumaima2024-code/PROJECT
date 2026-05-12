'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRegister, apiVerifyOtp } from '@/lib/api';
import Link from 'next/link';
import { User, Briefcase, ArrowLeft, UploadCloud, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const TUNISIAN_GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 
  'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 
  'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
];

const CATEGORIES = [
  'Plomberie', 'Électricité', 'Ménage', 'Coiffure', 'Taxi', 
  'Bricolage', 'Baby-sitter', 'Déménagement', 'Informatique', 
  'Peinture', 'Photographie', 'Traiteur', 'Jardinage'
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client'; 
  const isClient = role === 'client';
  
  const totalSteps = isClient ? 2 : 3;
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    nom_commercial: '',
    address: '',
    description: '',
    gouvernorats: [] as string[],
    categories: [] as string[],
  });

  const [files, setFiles] = useState<{
    profile_photo: File | null;
    cin_document: File | null;
    certificate_document: File | null;
  }>({
    profile_photo: null,
    cin_document: null,
    certificate_document: null,
  });

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Theme colors
  const theme = isClient 
    ? { 
        bg: 'bg-blue-100', text: 'text-blue-600', shadow: 'shadow-blue-200', 
        btn: 'bg-blue-600 hover:bg-blue-700', ring: 'focus:ring-blue-500',
        activeStep: 'bg-blue-600', inactiveStep: 'bg-blue-100'
      }
    : { 
        bg: 'bg-[#F3F0FF]', text: 'text-[#4F3D8A]', shadow: 'shadow-[#A78BFA]', 
        btn: 'bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] hover:from-[#7C5CBF] hover:to-[#A78BFA]', 
        ring: 'focus:ring-[#A78BFA]',
        activeStep: 'bg-[#4F3D8A]', inactiveStep: 'bg-[#E0D4FF]'
      };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const toggleSelection = (item: string, field: 'gouvernorats' | 'categories') => {
    setFormData(prev => {
      const list = prev[field];
      if (list.includes(item)) return { ...prev, [field]: list.filter(i => i !== item) };
      return { ...prev, [field]: [...list, item] };
    });
  };

  const submitRegistration = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      // If we have files, we must send FormData
      if (!isClient && (files.profile_photo || files.cin_document || files.certificate_document)) {
        const payload = new FormData();
        payload.append('role', 'prestataire');
        payload.append('email', formData.email);
        payload.append('password', formData.password);
        payload.append('phone', formData.phone);
        payload.append('nom_commercial', formData.nom_commercial);
        payload.append('address', formData.address);
        payload.append('description', formData.description);
        payload.append('gouvernorats', JSON.stringify(formData.gouvernorats));
        payload.append('categories', JSON.stringify(formData.categories));
        
        if (files.profile_photo) payload.append('profile_photo', files.profile_photo);
        if (files.cin_document) payload.append('cin_document', files.cin_document);
        if (files.certificate_document) payload.append('certificate_document', files.certificate_document);
        
        response = await apiRegister(payload);
      } else {
        const payload = { ...formData, role: isClient ? 'client' : 'prestataire' };
        response = await apiRegister(payload);
      }
      
      if (response.id) {
        setStep(isClient ? 2 : 3); // Move to OTP step
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte.');
    }
    setLoading(false);
  };

  const submitOtp = async () => {
    setLoading(true);
    setError('');
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Code OTP invalide (6 chiffres requis)');
      setLoading(false);
      return;
    }
    
    try {
      await apiVerifyOtp(formData.email, code);
      // On success, redirect to login
      router.push(`/login?role=${role}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification.');
    }
    setLoading(false);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !isClient) {
      setStep(2); // Go to Docs step for Provider
    } else if (step === 1 && isClient) {
      submitRegistration(); // Client has only 2 steps: Info -> API Call -> OTP
    } else if (step === 2 && !isClient) {
      if (!files.cin_document || !files.certificate_document) {
        setError('Veuillez télécharger les documents obligatoires (CIN et Certificat).');
        return;
      }
      submitRegistration(); // Provider: Info -> Docs -> API Call -> OTP
    } else if (step === totalSteps) {
      submitOtp();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${theme.bg} ${theme.text} ${theme.shadow}`}>
          {isClient ? <User size={32} /> : <Briefcase size={32} />}
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isClient ? 'text-slate-900' : 'text-[#4F3D8A]'}`}>
          Inscription {isClient ? 'Client' : 'Prestataire'}
        </h1>
        
        {/* STEPPER INDICATOR */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i + 1 ? theme.activeStep + ' text-white' : theme.inactiveStep + ' ' + theme.text}`}>
                {step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              {i < totalSteps - 1 && <div className={`w-12 h-1 transition-colors ${step > i + 1 ? theme.activeStep : theme.inactiveStep}`} />}
            </div>
          ))}
        </div>
        <p className="text-slate-500 mt-3 font-medium">
          {step === 1 && "Informations personnelles"}
          {step === 2 && !isClient && "Documents & Certifications"}
          {step === totalSteps && "Vérification OTP"}
        </p>
      </div>

      <form onSubmit={handleNextStep} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
        
        {/* ÉTAPE 1 : INFORMATIONS */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={!isClient ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{isClient ? 'Nom & Prénom' : 'Nom Commercial / Entreprise'}</label>
                <input type="text" name="nom_commercial" value={formData.nom_commercial} onChange={handleChange} required
                  className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-slate-500 font-bold border-r border-slate-200 pr-3">+216</span>
                  </div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required maxLength={8} pattern="[0-9]{8}" placeholder="22 123 456"
                    className={`w-full border border-slate-200 rounded-xl pl-20 pr-4 py-3 focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50 font-medium tracking-wide`} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse principale *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Ex: Résidence Jasmins, Ariana"
                  className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50`} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6}
                  className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50`} />
              </div>
              {!isClient && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Présentation / À propos *</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                    required 
                    placeholder="Décrivez votre expérience, vos spécialités et pourquoi les clients devraient vous choisir..."
                    className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50 h-32`} 
                  />
                </div>
              )}
            </div>

            {!isClient && (
              <>
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Catégories de services</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => toggleSelection(cat, 'categories')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${formData.categories.includes(cat) ? theme.activeStep + ' text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Zones d'intervention (Gouvernorats)</label>
                  <div className="flex flex-wrap gap-2 h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50 hide-scrollbar">
                    {TUNISIAN_GOVERNORATES.map(gov => (
                      <button key={gov} type="button" onClick={() => toggleSelection(gov, 'gouvernorats')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${formData.gouvernorats.includes(gov) ? theme.activeStep + ' text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        {gov}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ÉTAPE 2 : DOCUMENTS (Uniquement Prestataire) */}
        {step === 2 && !isClient && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-4 flex gap-3 text-[#BF360C] text-sm font-medium mb-6">
              <AlertTriangle className="flex-shrink-0" size={20} />
              <p>Pour garantir la qualité de notre plateforme, nous vérifions l'identité et les qualifications de chaque prestataire.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Photo de profil (Recommandé)</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                  <UploadCloud size={32} className="mb-2" />
                  <p className="text-sm font-medium">{files.profile_photo ? files.profile_photo.name : "Cliquez ou glissez une image"}</p>
                </div>
                <input type="file" name="profile_photo" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Document d'identité (CIN/Passeport) *</label>
              <label className="flex items-center justify-between w-full p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 text-slate-600">
                  <FileText size={24} className={files.cin_document ? "text-[#4F3D8A]" : ""} />
                  <span className="font-medium text-sm">{files.cin_document ? files.cin_document.name : "Sélectionner un fichier (PDF, JPG)"}</span>
                </div>
                <input type="file" name="cin_document" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Certificat professionnel (Diplôme, Patente) *</label>
              <label className="flex items-center justify-between w-full p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 text-slate-600">
                  <FileText size={24} className={files.certificate_document ? "text-[#4F3D8A]" : ""} />
                  <span className="font-medium text-sm">{files.certificate_document ? files.certificate_document.name : "Sélectionner un fichier (PDF, JPG)"}</span>
                </div>
                <input type="file" name="certificate_document" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : VÉRIFICATION OTP */}
        {step === totalSteps && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-6">
            <h3 className="text-xl font-bold text-slate-900">Vérification de votre compte</h3>
            <p className="text-slate-500 text-sm">
              Un code à 6 chiffres a été envoyé à <strong>{formData.phone}</strong>
            </p>
            
            <div className="flex justify-center gap-2 md:gap-4 my-8">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const newOtp = [...otpCode];
                    newOtp[idx] = val;
                    setOtpCode(newOtp);
                    if (val && idx < 5) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-transparent focus:ring-4 ${theme.ring} bg-white shadow-sm`}
                />
              ))}
            </div>
            
            <p className="text-sm font-medium text-slate-500">
              Vous n'avez pas reçu le code ? <span className="text-[#A78BFA] cursor-pointer hover:underline">Renvoyer</span> (00:59)
            </p>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-center">{error}</div>}

        <div className="flex gap-4 pt-4">
          {step > 1 && step < totalSteps && (
            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
              Retour
            </button>
          )}
          <button type="submit" disabled={loading} className={`flex-1 text-white rounded-xl py-3.5 font-bold text-lg transition disabled:opacity-70 shadow-lg ${theme.btn} ${theme.shadow}`}>
            {loading ? 'Traitement...' : step === totalSteps ? 'Valider le compte' : 'Continuer'}
          </button>
        </div>
      </form>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FAF9FF] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-[#A78BFA] blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-[#D4A017] blur-3xl opacity-10 pointer-events-none" />

      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-[#4F3D8A] font-medium transition">
          <ArrowLeft size={20} className="mr-2" />
          Retour à l'accueil
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10 pb-20">
        <Suspense fallback={<div className="text-[#4F3D8A] font-medium">Chargement...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
