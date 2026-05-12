"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('http://127.0.0.1:8000/api/admin/reviews', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const deleteReview = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div></AdminLayout>;

  const filteredReviews = reviews.filter(r => 
    (r.comment?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (r.client?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (r.provider?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    r.id.toString().includes(searchQuery)
  );

  return (
    <AdminLayout onSearch={setSearchQuery} searchPlaceholder="Rechercher un avis...">
      <div className="flex justify-between items-center mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Avis</h1>
          <p className="text-slate-400 font-medium mt-1">Consultez et modérez les avis laissés par les clients.</p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Note</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Commentaire</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Prestataire</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredReviews.map((review) => (
              <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-bold text-slate-400 text-xs">#{review.id}</td>
                <td className="p-6 font-bold text-amber-500 text-lg">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </td>
                <td className="p-6 text-sm text-slate-600 max-w-xs truncate">
                  {review.comment || <span className="italic text-slate-400">Aucun commentaire</span>}
                </td>
                <td className="p-6">
                   <p className="text-xs font-bold text-slate-800">C: {review.client || 'N/A'}</p>
                   <p className="text-[10px] text-teal-600 font-medium">P: {review.provider || 'N/A'}</p>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => deleteReview(review.id)} 
                    className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm shadow-rose-100"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  Aucun avis ne correspond à "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
