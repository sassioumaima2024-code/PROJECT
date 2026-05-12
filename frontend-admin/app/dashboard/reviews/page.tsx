'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';

interface Review {
  id: number;
  reviewer: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
}

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flagged'>('all');

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      const data = await apiGet(`/admin/reviews?flagged=${filter === 'flagged'}`);
      setReviews(data.data || []);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm('Supprimer cet avis?')) {
      try {
        await apiDelete(`/admin/reviews/${id}`);
        setReviews(reviews.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-rose-800">Modération des Avis</h1>
        <p className="text-gray-600 mt-2">Gérer et modérer les avis des clients</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous les avis
        </button>
        <button
          onClick={() => setFilter('flagged')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'flagged'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Signalés
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Auteur</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Commentaire</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucun avis
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{review.reviewer}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1">
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {review.is_flagged && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🚩 Signalé
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
