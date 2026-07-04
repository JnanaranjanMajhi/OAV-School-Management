import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Video, ExternalLink, Clock, BookOpen, Monitor, Calendar as CalendarIcon, User } from 'lucide-react';

const platformColors = {
  'zoom':         { bg: 'rgba(45,140,255,0.1)',   border: 'rgba(45,140,255,0.3)',   color: '#2d8cff', gradient: 'linear-gradient(135deg, #2d8cff, #1a73e8)' },
  'google meet':  { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)',   color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'microsoft teams': { bg: 'rgba(79,70,229,0.1)', border: 'rgba(79,70,229,0.3)', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  'youtube':      { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',    color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  'other':        { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.3)',   color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
};

const getPlatformStyle = (platform) =>
  platformColors[platform?.toLowerCase()] || platformColors.other;

export default function StudentOnlineClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const clsParam = user?.class ? `?class=${encodeURIComponent(user.class)}` : '';
    api.get(`/online-classes${clsParam}`)
      .then((r) => setClasses(r.data.data || []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [user]);

  const now = new Date();
  const upcoming = classes.filter((c) => new Date(c.date || c.scheduledAt) >= now).sort((a, b) => new Date(a.date || a.scheduledAt) - new Date(b.date || b.scheduledAt));
  const past = classes.filter((c) => new Date(c.date || c.scheduledAt) < now).sort((a, b) => new Date(b.date || b.scheduledAt) - new Date(a.date || a.scheduledAt));
  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <div className="section-header" style={{ marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="section-title">Online Classes</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Join your live sessions and view past recordings.</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setTab('upcoming')}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            border: 'none',
            background: tab === 'upcoming' ? 'var(--primary)' : 'var(--bg-input)',
            color: tab === 'upcoming' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'upcoming' ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          Upcoming Classes ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            border: 'none',
            background: tab === 'past' ? 'var(--text-muted)' : 'var(--bg-input)',
            color: tab === 'past' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'past' ? '0 4px 12px rgba(156, 163, 175, 0.3)' : 'none'
          }}
        >
          Past Classes ({past.length})
        </button>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Video size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No {tab} classes found</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no {tab} sessions scheduled for your class.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {displayed.map((cls) => {
            const isUpcoming = new Date(cls.date || cls.scheduledAt) >= now;
            const platStyle = getPlatformStyle(cls.platform);
            const classDate = new Date(cls.date || cls.scheduledAt);

            return (
              <div
                key={cls._id}
                className="card-elevated"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isUpcoming ? 1 : 0.8,
                  filter: isUpcoming ? 'none' : 'grayscale(0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px ${platStyle.bg}`;
                  e.currentTarget.style.borderColor = platStyle.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                {/* Top decorative bar matching platform */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: platStyle.gradient }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.75rem' }}>
                  <div style={{ background: platStyle.bg, color: platStyle.color, padding: '0.5rem', borderRadius: '10px', flexShrink: 0 }}>
                    <Video size={18} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {isUpcoming ? (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Upcoming
                      </span>
                    ) : (
                      <span style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Ended
                      </span>
                    )}
                    {cls.platform && (
                      <span style={{ color: platStyle.color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.3rem' }}>
                        {cls.platform}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Subject */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'Outfit', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                  {cls.title}
                </h3>
                {cls.subject && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <BookOpen size={12} /> <span style={{ fontWeight: 500 }}>{cls.subject}</span>
                  </div>
                )}

                {/* Description */}
                {cls.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                    {cls.description}
                  </p>
                )}
                {!cls.description && <div style={{ flex: 1, marginBottom: '1rem' }} />}

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>
                    <CalendarIcon size={14} color="var(--primary)" />
                    <span>
                      {classDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>
                    <Clock size={14} color="var(--accent)" />
                    <span>
                      {classDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {cls.teacher && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>
                      <User size={14} color="var(--success)" />
                      <span>{cls.teacher}</span>
                    </div>
                  )}
                </div>

                {/* Join button */}
                {cls.link && (
                  <a
                    href={cls.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: isUpcoming ? platStyle.gradient : 'var(--bg-input)',
                      color: isUpcoming ? '#fff' : 'var(--text)',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      border: isUpcoming ? 'none' : '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                      if(isUpcoming) e.currentTarget.style.opacity = '0.9';
                      else e.currentTarget.style.background = 'var(--border-light)';
                    }}
                    onMouseLeave={(e) => {
                      if(isUpcoming) e.currentTarget.style.opacity = '1';
                      else e.currentTarget.style.background = 'var(--bg-input)';
                    }}
                  >
                    {isUpcoming ? (
                      <>
                        <Video size={16} /> Join Live Class
                      </>
                    ) : (
                      <>
                        <ExternalLink size={16} /> View Recording / Link
                      </>
                    )}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
