'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';

interface Service {
  id: number;
  title: string;
  category: string;
  price_min: number;
  price_max: number;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/services').then((data) => {
      if (Array.isArray(data)) setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b1c1c', marginBottom: '24px' }}>
        Gestion des services
      </h1>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Chargement...</p>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fff1f2' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>ID</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Titre</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Categorie</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Prix min</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Prix max</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>#{service.id}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{service.title}</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>{service.category}</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>{service.price_min} DT</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>{service.price_max} DT</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: service.is_active ? '#d1fae5' : '#fee2e2',
                      color: service.is_active ? '#065f46' : '#991b1b',
                    }}>
                      {service.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9b1c1c' }}>
              Aucun service disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
}