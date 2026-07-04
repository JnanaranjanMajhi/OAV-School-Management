import { useState, useEffect } from 'react';
import api, { SERVER_URL } from '../../api/axios';
import { Calendar, MapPin, Clock, ArrowRight, Activity, ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    api.get('/events?upcoming=true')
      .then((r) => setEvents(r.data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return { day: d.getDate(), month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear() };
  };

  return (
    <>
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title">Upcoming Events</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Stay informed about school activities, holidays, and special programs.</p>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Calendar size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Events Scheduled</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no upcoming events at the moment. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {events.map((ev) => {
            const { day, month } = formatDate(ev.date);
            const endDate = ev.endDate ? new Date(ev.endDate) : null;
            const startDate = new Date(ev.date);
            const today = new Date();
            
            // Normalize today for accurate date comparison without time
            const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endNorm = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : startNorm;
            
            const isPast = endNorm < todayNorm;
            const isOngoing = startNorm <= todayNorm && endNorm >= todayNorm;
            
            let statusBadge = { label: 'Upcoming', bg: 'var(--primary)', color: 'white' };
            if (isPast) statusBadge = { label: 'Past', bg: 'var(--bg-input)', color: 'var(--text-muted)' };
            else if (isOngoing) statusBadge = { label: 'Ongoing', bg: 'var(--success)', color: 'white' };

            const imageUrl = ev.image ? (ev.image.startsWith('http') ? ev.image : `${SERVER_URL}${ev.image}`) : null;

            return (
              <div 
                key={ev._id} 
                className="card-elevated hover-scale" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: 0, 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isPast ? 0.75 : 1,
                  filter: isPast ? 'grayscale(0.3)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedEvent(ev)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'var(--primary-light)';
                  const img = e.currentTarget.querySelector('.event-img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  const img = e.currentTarget.querySelector('.event-img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* Image Header Area */}
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden', background: imageUrl ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt={ev.title} 
                      className="event-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                    />
                  )}
                  {/* Overlay Gradient for readability if there is an image */}
                  {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />}
                  
                  {/* Floating Date Badge */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    left: '1rem', 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1.1
                  }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'Outfit' }}>{day}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{month}</span>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {isOngoing && <Activity size={10} />}
                    {statusBadge.label}
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)', fontFamily: 'Outfit', lineHeight: 1.3 }}>{ev.title}</h3>
                  
                  {ev.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ev.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 500 }}>
                        <Clock size={14} color="var(--primary-light)" /> 
                        {startDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {endDate && startNorm.getTime() !== endNorm.getTime() && ` — ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`}
                      </div>
                      
                      {ev.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 500 }}>
                          <MapPin size={14} color="var(--accent)" /> 
                          {ev.location}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Details <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedEvent && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <div style={{ padding: '1.5rem' }}>
            {selectedEvent.image && (
              <img 
                src={selectedEvent.image.startsWith('http') ? selectedEvent.image : `${SERVER_URL}${selectedEvent.image}`} 
                alt={selectedEvent.title} 
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} 
              />
            )}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500, background: 'var(--bg)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <Calendar size={16} color="var(--primary)" />
                {new Date(selectedEvent.date).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              
              {selectedEvent.endDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500, background: 'var(--bg)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <Clock size={16} color="var(--accent)" />
                  Until {new Date(selectedEvent.endDate).toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              )}

              {selectedEvent.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500, background: 'var(--bg)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <MapPin size={16} color="#ec4899" />
                  {selectedEvent.location}
                </div>
              )}
            </div>
            
            <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {selectedEvent.description || "No additional details available."}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
