'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';

interface Appointment {
  id: number;
  status: string;
  description: string;
  scheduled_at: string;
  client: string;
  provider: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/admin/appointments').then((data) => {
      if (Array.isArray(data)) setAppointments(data);
      setLoading(false);
    });
  }, []);

  const statusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'in_progress': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'completed': return { backgroundColor: '#d1fae5', color: '#065f46' };
      default: return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  const statusLabel = (status: string) => {
    switch(status) {
      case 'confirmed': return 'Confirmee';
      case 'cancelled': return 'Annulee';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminee';
      default: return 'En attente';
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b1c1c', marginBottom: '24px' }}>
        Gestion des reservations
      </h1>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Chargement...</p>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fff1f2' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>ID</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Client</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Prestataire</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Description</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#9b1c1c' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>#{appt.id}</td>
                  <td style={{ padding: '16px 24px' }}>{appt.client}</td>
                  <td style={{ padding: '16px 24px' }}>{appt.provider}</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>{appt.description}</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280' }}>{appt.scheduled_at}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      ...statusColor(appt.status)
                    }}>
                      {statusLabel(appt.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9b1c1c' }}>
              Aucune reservation
            </div>
          )}
        </div>
      )}
    </div>
  );
}