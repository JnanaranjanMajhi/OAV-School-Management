import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Megaphone, Pin, Clock } from 'lucide-react';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then((r) => {
        const all = r.data.data || [];
        // Filter for student-visible announcements
        const filtered = all.filter(
          (a) => a.targetRole === 'all' || a.targetRole === 'student'
        );
        // Sort pinned first, then by date
        filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setAnnouncements(filtered);
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title">Announcements</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Important updates, alerts, and news from the administration.</p>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : announcements.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'rgba(79,70,229,0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Megaphone size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No New Announcements</h3>
          <p style={{ color: 'var(--text-muted)' }}>You're all caught up! No recent announcements to show.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.75rem' }}>
          {announcements.map((a) => (
            <div 
              key={a._id} 
              className="card-elevated"
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                padding: '2rem',
                border: 'none',
                background: a.isPinned ? 'linear-gradient(to bottom right, var(--bg-card), rgba(245, 158, 11, 0.05))' : 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: a.isPinned ? '0 10px 30px rgba(245, 158, 11, 0.1)' : 'var(--shadow-md)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: a.isPinned ? '4px solid var(--warning)' : '4px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                if (!a.isPinned) {
                  e.currentTarget.style.borderLeftColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                } else {
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(245, 158, 11, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                if (!a.isPinned) {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                } else {
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.1)';
                }
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    padding: '0.6rem', 
                    background: a.isPinned ? 'rgba(245, 158, 11, 0.15)' : 'rgba(79, 70, 229, 0.1)', 
                    borderRadius: '12px',
                    color: a.isPinned ? 'var(--warning)' : 'var(--primary)'
                  }}>
                    {a.isPinned ? <Pin size={22} /> : <Megaphone size={22} />}
                  </div>
                  <div>
                    {a.isPinned && (
                      <div style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.1rem' }}>
                        Pinned
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 500 }}>
                      <Clock size={12} />
                      {new Date(a.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: a.targetRole === 'all' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
                  color: a.targetRole === 'all' ? '#0891b2' : '#7c3aed', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {a.targetRole === 'all' ? 'Everyone' : 'Students'}
                </div>
              </div>

              {/* Body */}
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'Outfit', lineHeight: 1.3, marginBottom: '0.85rem' }}>
                {a.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-line' }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
