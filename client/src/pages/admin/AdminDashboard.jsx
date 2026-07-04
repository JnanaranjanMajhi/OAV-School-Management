import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, FileSpreadsheet, Calendar, Image, Download, ScrollText } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/school-info/admin-stats'),
      api.get('/logs?limit=8'),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setStats(results[0].value.data.data || {});
      if (results[1].status === 'fulfilled') setLogs(results[1].value.data.data || []);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Teachers', value: stats.teachers, icon: BookOpen, color: '#4f46e5', bg: 'rgba(79,70,229,0.15)' },
    { label: 'Students', value: stats.students, icon: Users, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    { label: 'Result Batches', value: stats.results, icon: FileSpreadsheet, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Events', value: stats.events, icon: Calendar, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Gallery Images', value: stats.gallery, icon: Image, color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
    { label: 'Downloads', value: stats.downloads, icon: Download, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  ];

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79,70,229,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(79,70,229,0.15)' }}>
            <Users size={24} color="#4f46e5" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Welcome back, {user?.name}! 👋</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Here's an overview of your school system.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-3" style={{ display: 'grid', marginBottom: '2.5rem', gap: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card-elevated" style={{ display: 'flex', alignItems: 'center', padding: '2rem', gap: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-input)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '50%', height: 24, background: 'var(--bg-input)', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '70%', height: 12, background: 'var(--bg-input)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-3" style={{ display: 'grid', marginBottom: '2.5rem', gap: '1.5rem' }}>
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div 
                key={label} 
                className="card-elevated" 
                style={{ display: 'flex', alignItems: 'center', padding: '2rem', gap: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.08)'; }} 
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={28} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, marginBottom: '0.2rem' }}>{value ?? '—'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-elevated" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(79,70,229,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <ScrollText size={20} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Activity</h3>
              </div>
              {logs.length === 0 ? <div className="empty-state"><p>No activity yet.</p></div> : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {logs.map((log, i) => (
                    <div 
                      key={log._id} 
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '1rem 0', 
                        borderBottom: i !== logs.length - 1 ? '1px solid var(--border-light)' : 'none',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.userRole === 'admin' ? 'var(--primary)' : 'var(--accent)' }} />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{log.action.replace(/_/g, ' ')}</span>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>• by <span style={{ fontWeight: 500 }}>{log.userName}</span></span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className={`badge ${log.userRole === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize', fontWeight: 600, padding: '0.2rem 0.6rem' }}>{log.userRole}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </>
      )}
    </>
  );
}
