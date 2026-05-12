'use client';

import { useState } from 'react';
import { Plus, Edit2, PauseCircle, Trash2, ArrowLeft, Droplet, Zap, Home, Scissors, Wrench, Car, Camera, X, UploadCloud, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const INITIAL_SERVICES = [
  { id: 1, title: 'Réparation Fuite d\'Eau', category: 'Plomberie', priceMin: 50, priceMax: 150, isActive: true },
  { id: 2, title: 'Installation Chauffe-eau', category: 'Plomberie', priceMin: 120, priceMax: 300, isActive: false },
];

const CATEGORIES = [
  { name: 'Plomberie', icon: <Droplet size={20} /> },
  { name: 'Électricité', icon: <Zap size={20} /> },
  { name: 'Ménage', icon: <Home size={20} /> },
  { name: 'Coiffure', icon: <Scissors size={20} /> },
  { name: 'Bricolage', icon: <Wrench size={20} /> },
  { name: 'Taxi', icon: <Car size={20} /> },
];

const TUNISIAN_GOVERNORATES = ['Ariana', 'Ben Arous', 'Tunis', 'Sousse', 'Sfax', 'Nabeul'];
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ServicesPage() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Plomberie');
  const [priceMin, setPriceMin] = useState(30);
  const [priceMax, setPriceMax] = useState(100);
  const [experience, setExperience] = useState(5);
  const [governorates, setGovernorates] = useState<string[]>(['Tunis']);
  
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: true }), {})
  );

  const toggleStatus = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const deleteService = (id: number) => {
    if (confirm("Supprimer ce service définitivement ?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleAddSpecialty = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && specialtyInput.trim()) {
      e.preventDefault();
      if (!specialties.includes(specialtyInput.trim())) {
        setSpecialties([...specialties, specialtyInput.trim()]);
      }
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (tag: string) => {
    setSpecialties(specialties.filter(s => s !== tag));
  };

  const toggleGovernorate = (gov: string) => {
    setGovernorates(prev => prev.includes(gov) ? prev.filter(g => g !== gov) : [...prev, gov]);
  };

  const toggleAvailability = (day: string) => {
    setAvailability(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newService = {
      id: Date.now(),
      title: title || 'Nouveau Service',
      category: selectedCategory,
      priceMin,
      priceMax,
      isActive: true
    };
    setServices([newService, ...services]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] font-sans pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white p-6 pb-12 rounded-b-[40px] shadow-lg relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/prestataire" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Mes Services</h1>
        </div>
        <p className="text-[#E0D4FF] text-sm max-w-sm">
          Gérez vos prestations, tarifs et disponibilités pour attirer plus de clients.
        </p>
      </header>

      {/* Main Content */}
      <main className="px-6 -mt-6 relative z-20 space-y-4">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_rgba(79,61,138,0.08)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            {/* Status indicator line */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${service.isActive ? 'bg-[#059669]' : 'bg-slate-300'}`}></div>
            
            <div className="flex justify-between items-start pl-2">
              <div>
                <span className="inline-block px-2.5 py-1 bg-[#F3F0FF] text-[#4F3D8A] rounded-md text-xs font-bold mb-2">
                  {service.category}
                </span>
                <h3 className="font-bold text-lg text-[#1E1B3A] leading-tight">{service.title}</h3>
                <p className="text-sm font-semibold text-[#D4A017] mt-1">{service.priceMin} DT - {service.priceMax} DT</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${service.isActive ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-slate-100 text-slate-500'}`}>
                  {service.isActive ? 'Actif' : 'En pause'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pl-2 pt-2 border-t border-slate-50 mt-1">
              <button className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 transition flex items-center justify-center">
                <Edit2 size={16} className="mr-2" /> Éditer
              </button>
              <button onClick={() => toggleStatus(service.id)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center ${service.isActive ? 'bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]' : 'bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]'}`}>
                <PauseCircle size={16} className="mr-2" /> {service.isActive ? 'Pauser' : 'Activer'}
              </button>
              <button onClick={() => deleteService(service.id)} className="w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-6 w-16 h-16 bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(79,61,138,0.4)] hover:scale-105 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      {/* ADD SERVICE BOTTOM SHEET (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1E1B3A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#1E1B3A]">Ajouter un service</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
              
              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-2">Titre du service</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Réparation chauffe-eau" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA]" />
              </div>

              {/* CategoryPicker */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Catégorie</label>
                <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                  {CATEGORIES.map(cat => (
                    <button key={cat.name} type="button" onClick={() => setSelectedCategory(cat.name)}
                      className={`flex flex-col items-center min-w-[80px] p-3 rounded-2xl border transition ${selectedCategory === cat.name ? 'border-[#4F3D8A] bg-[#F3F0FF] text-[#4F3D8A]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#A78BFA]'}`}>
                      {cat.icon}
                      <span className="text-xs font-bold mt-2">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PriceRangeSlider (Inputs for web) */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Fourchette de prix (DT)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-3 text-slate-400 font-bold">Min</span>
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-semibold focus:outline-none focus:border-[#A78BFA]" />
                  </div>
                  <span className="text-slate-400 font-bold">-</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-3 text-slate-400 font-bold">Max</span>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-semibold focus:outline-none focus:border-[#A78BFA]" />
                  </div>
                </div>
              </div>

              {/* ExperienceCounter */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Années d'expérience</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setExperience(Math.max(0, experience - 1))} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xl text-[#4F3D8A] hover:bg-slate-200">-</button>
                  <div className="flex-1 text-center font-bold text-2xl text-[#1E1B3A]">{experience} <span className="text-sm font-medium text-slate-500">ans</span></div>
                  <button onClick={() => setExperience(experience + 1)} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xl text-[#4F3D8A] hover:bg-slate-200">+</button>
                </div>
              </div>

              {/* GovernorateMultiSelect */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Zones d'intervention</label>
                <div className="flex flex-wrap gap-2">
                  {TUNISIAN_GOVERNORATES.map(gov => (
                    <button key={gov} type="button" onClick={() => toggleGovernorate(gov)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition ${governorates.includes(gov) ? 'bg-[#4F3D8A] text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                      {gov} {governorates.includes(gov) && <CheckCircle2 size={14} className="inline ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* SpecialtyTagInput */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Tags de compétences (Appuyez sur Entrée)</label>
                <div className="border border-slate-200 rounded-xl p-3 focus-within:border-[#A78BFA]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {specialties.map(spec => (
                      <span key={spec} className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3F0FF] text-[#4F3D8A] rounded-full text-sm font-bold">
                        {spec} <button onClick={() => removeSpecialty(spec)}><X size={14} className="text-[#A78BFA] hover:text-[#4F3D8A]" /></button>
                      </span>
                    ))}
                  </div>
                  <input type="text" value={specialtyInput} onChange={(e) => setSpecialtyInput(e.target.value)} onKeyDown={handleAddSpecialty} placeholder="Ex: Chauffage central, Cuivre..." className="w-full outline-none text-sm font-medium" />
                </div>
              </div>

              {/* PortfolioPhotoGrid */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Photos de vos réalisations (Portfolio)</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="col-span-1 aspect-square border-2 border-dashed border-[#A78BFA]/50 rounded-2xl flex flex-col items-center justify-center text-[#7C5CBF] bg-[#F3F0FF]/50 hover:bg-[#F3F0FF] cursor-pointer transition">
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-bold">Ajouter</span>
                    <input type="file" className="hidden" multiple accept="image/*" />
                  </label>
                  {/* Placeholders for visuals */}
                  <div className="col-span-1 aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <UploadCloud size={24} />
                  </div>
                </div>
              </div>

              {/* AvailabilityHoursWidget */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1B3A] mb-3">Jours de disponibilité</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleAvailability(day)}
                      className={`py-3 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${availability[day] ? 'bg-[#D1FAE5] text-[#059669] border-transparent' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {day.substring(0, 3)}
                      {availability[day] && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-white sm:rounded-b-3xl">
              <button onClick={handleSave} className="w-full bg-gradient-to-r from-[#4F3D8A] to-[#7C5CBF] text-white py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_rgba(79,61,138,0.3)] hover:opacity-90 transition">
                Sauvegarder le service
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
