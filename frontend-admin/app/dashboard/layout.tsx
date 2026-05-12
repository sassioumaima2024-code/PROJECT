'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) router.push('/login');
  }, [router]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Utilisateurs', href: '/dashboard/users' },
    { label: 'Reservations', href: '/dashboard/appointments' },
    { label: 'Services', href: '/dashboard/services' },
  ];

  const sidebarStyle = { width: '256px', backgroundColor: '#9b1c1c', color: 'white', display: 'flex' as const, flexDirection: 'column' as const };
  const mainStyle = { flex: 1, padding: '32px', backgroundColor: '#fdf2f8' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <div style={{ padding: '24px', borderBottom: '1px solid #7f1d1d' }}>
          <h1 style={{ fontWeight: 'bold', fontSize: '20px' }}>SERVICY</h1>
          <p style={{ fontSize: '12px', color: '#fca5a5' }}>Administration</p>
        </div>
        <nav style={{ flex: 1, padding: '16px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const linkStyle = {
              display: 'block',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '8px',
              fontWeight: '500',
              textDecoration: 'none',
              backgroundColor: active ? 'white' : 'transparent',
              color: active ? '#9b1c1c' : '#fecaca',
              cursor: 'pointer',
            };
            return (
              <div key={item.href} style={linkStyle} onClick={() => router.push(item.href)}>
                {item.label}
              </div>
            );
          })}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid #7f1d1d' }}>
          <button onClick={logout} style={{ width: '100%', padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '12px', color: '#fecaca', border: 'none', cursor: 'pointer' }}>
            Deconnexion
          </button>
        </div>
      </aside>
      <main style={mainStyle}>
        {children}
      </main>
    </div>
  );
}