import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Calendar, Megaphone, Bell, Download, Video, ArrowRight } from 'lucide-react';

const quickLinks = [
  {
    to: '/student/results',
    icon: FileSpreadsheet,
    label: 'My Results',
    desc: 'View your exam results and subject-wise marks',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
  },
  {
    to: '/student/events',
    icon: Calendar,
    label: 'Events',
    desc: 'Check upcoming school events and activities',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
  },
  {
    to: '/student/announcements',
    icon: Megaphone,
    label: 'Announcements',
    desc: 'Read important announcements from the school',
    color: '#4f46e5',
    bg: 'rgba(79,70,229,0.15)',
  },
  {
    to: '/student/notices',
    icon: Bell,
    label: 'Notices',
    desc: 'View notices and circulars for students',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
  },
  {
    to: '/student/downloads',
    icon: Download,
    label: 'Downloads',
    desc: 'Download study materials and documents',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
  },
  {
    to: '/student/online-classes',
    icon: Video,
    label: 'Online Classes',
    desc: 'Join scheduled online classes and lectures',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.15)',
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [attendance, setAttendance] = useState({ percentage: 0, totalPresent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, ev, ann] = await Promise.all([
          api.get('/attendance/student/me').catch(() => ({ data: { data: { stats: { percentage: 0, totalPresent: 0 } } } })),
          api.get('/events?upcoming=true').catch(() => ({ data: { data: [] } })),
          api.get('/announcements').catch(() => ({ data: { data: [] } })),
        ]);
        
        
        if (attRes.data?.data?.stats) {
          setAttendance(attRes.data.data.stats);
        }

        setUpcomingEvents((ev.data.data || []).slice(0, 3));
        const filtered = (ann.data.data || []).filter(
          (a) => a.targetRole === 'all' || a.targetRole === 'student'
        );
        setAnnouncements(filtered.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Welcome Banner */}
      <div className="card-elevated" style={{ 
        padding: '1.5rem 2rem', 
        marginBottom: '1.5rem', 
        borderRadius: 'var(--radius-lg)', 
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(15px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit' }}>Welcome back, {user?.name}! 👋</h2>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.9, fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
            Here's your student portal. Access your results, upcoming events, and stay up to date with the latest announcements.
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: '2px' }} />
        Quick Access
      </h3>

      {/* Quick access cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {quickLinks.map(({ to, icon: Icon, label, desc, color, bg }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card-elevated" style={{ height: '100%', padding: '1.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: color }}>
                  <Icon size={26} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text)' }}>{label}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.85rem', color: color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                View {label} <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
        
        {/* Special Attendance Card */}
        <Link to="/student/attendance" style={{ textDecoration: 'none' }}>
          <div className="card-elevated" style={{ height: '100%', padding: '1.75rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.02))', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ position: 'relative', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(34,197,94,0.2)" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--success)" strokeWidth="3" strokeDasharray={`${attendance.percentage}, 100`} />
                  </svg>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>{attendance.percentage}%</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text)' }}>My Attendance</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>Track your daily presence and history</p>
                </div>
              </div>
          </div>
        </Link>
      </div>

      {/* Recent highlights */}
      {!loading && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 4, height: 20, background: 'var(--warning)', borderRadius: '2px' }} />
            Recent Updates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            
            {/* Upcoming Events */}
            <div className="card-elevated" style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--warning)' }}>
                  <Calendar size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Upcoming Events</h3>
              </div>
              
              {upcomingEvents.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                   <Calendar size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                   <p style={{ fontSize: '0.9rem' }}>No upcoming events scheduled.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {upcomingEvents.map((ev) => (
                    <div key={ev._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.6rem', textAlign: 'center', minWidth: '55px' }}>
                         <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase' }}>{new Date(ev.date).toLocaleString('default', { month: 'short' })}</div>
                         <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{new Date(ev.date).getDate()}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{ev.time || 'All Day'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/student/events" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}>
                View All Events <ArrowRight size={16} />
              </Link>
            </div>

            {/* Recent Announcements */}
            <div className="card-elevated" style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                  <Megaphone size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Announcements</h3>
              </div>
              
              {announcements.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                   <Megaphone size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                   <p style={{ fontSize: '0.9rem' }}>No announcements to show.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {announcements.map((a) => (
                    <div key={a._id} style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
                      {a.isPinned && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: 'var(--accent)' }} />}
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {a.isPinned && <span style={{ fontSize: '0.8rem' }}>📌</span>} {a.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                        {a.body?.length > 80 ? a.body.slice(0, 80) + '...' : a.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/student/announcements" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}>
                View All Announcements <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </>
      )}
    </>
  );
}
