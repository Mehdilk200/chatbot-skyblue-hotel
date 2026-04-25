import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import apiService from '../services/apiService';
import { useCurrentUser, getUserDisplayName, getUserInitials, getUserRole } from '../hooks/useCurrentUser';

export default function AdminDashboard() {
  const user = useCurrentUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiService.getStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const statCards = stats
    ? [
        {
          icon: 'fa-bed', label: 'Total Rooms', value: stats.total_rooms ?? stats.rooms ?? '—',
          color: 'var(--primary)', bg: 'rgba(10,36,99,0.08)'
        },
        {
          icon: 'fa-check-circle', label: 'Available', value: stats.available_rooms ?? stats.available ?? '—',
          color: 'var(--success)', bg: 'rgba(16,185,129,0.08)'
        },
        {
          icon: 'fa-calendar-check', label: 'Reservations', value: stats.total_reservations ?? stats.reservations ?? '—',
          color: 'var(--secondary)', bg: 'rgba(62,146,204,0.08)'
        },
        {
          icon: 'fa-percentage', label: 'Occupancy', value: stats.occupancy_rate != null ? `${Math.round(stats.occupancy_rate)}%` : '—',
          color: 'var(--accent)', bg: 'rgba(255,159,28,0.08)'
        },
      ]
    : [];

  return (
    <div className="admin-container" style={{ display: 'flex' }}>
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Dashboard</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Welcome back — here's what's happening today</p>
          </div>
          <div className="header-right">
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{getUserDisplayName(user)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getUserRole(user)}</div>
              </div>
              <div className="user-avatar" style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {getUserInitials(user)}
              </div>
            </div>
          </div>
        </header>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
            Loading stats…
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: '12px', padding: '1.5rem', color: 'var(--error)', marginBottom: '2rem' }}>
            <i className="fas fa-exclamation-triangle"></i> Could not load stats: {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {statCards.map((card, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: '20px', padding: '2rem',
                  boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center',
                  gap: '1.5rem', border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: card.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    <i className={`fas ${card.icon}`} style={{ fontSize: '1.5rem', color: card.color }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 600 }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary)' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { icon: 'fa-bed', label: 'Manage Rooms', href: '/admin/rooms', color: 'var(--primary)' },
                  { icon: 'fa-calendar-check', label: 'Operations', href: '/admin/operations', color: 'var(--secondary)' },
                  { icon: 'fa-robot', label: 'AI Concierge', href: '/assistant', color: 'var(--success)' },
                  { icon: 'fa-home', label: 'View Hotel Site', href: '/', color: 'var(--accent)' },
                ].map((action, i) => (
                  <a key={i} href={action.href} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
                    padding: '1.5rem', borderRadius: '16px', border: '2px solid rgba(0,0,0,0.06)',
                    textDecoration: 'none', color: 'var(--text)', transition: 'all 0.3s ease',
                    background: 'var(--light)', textAlign: 'center'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.background = 'var(--light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <i className={`fas ${action.icon}`} style={{ fontSize: '1.8rem', color: action.color }}></i>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
