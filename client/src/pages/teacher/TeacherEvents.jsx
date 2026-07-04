import { useState, useEffect } from 'react';
import api, { SERVER_URL } from '../../api/axios';
import { Calendar, MapPin, Clock, ArrowRight, Activity, ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';

export default function TeacherEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(236,72,153,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79,70,229,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(79,70,229,0.15)' }}>
            <Calendar size={24} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>School Events</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Discover upcoming activities and important dates.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Calendar size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Upcoming Events</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no events scheduled at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {events.map((ev) => {
            const startDate = new Date(ev.date);
            startDate.setHours(0,0,0,0);
            
            const endDate = ev.endDate ? new Date(ev.endDate) : new Date(ev.date);
            endDate.setHours(23,59,59,999);

            const isPast = endDate < now;
            const isOngoing = startDate <= now && endDate >= now;
            const isUpcoming = startDate > now;

            return (
              <div 
                key={ev._id} 
                className="card-elevated hover-scale"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  opacity: isPast ? 0.7 : 1,
                  filter: isPast ? 'grayscale(0.5)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedEvent(ev)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'var(--primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                {/* Image or Gradient Cover */}
                <div style={{ 
                  height: '140px', 
                  position: 'relative',
                  background: ev.image 
                    ? `url(${ev.image.startsWith('http') ? ev.image : `${SERVER_URL}${ev.image.startsWith('/') ? '' : '/'}${ev.image}`}) center/cover`
                    : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  overflow: 'hidden'
                }}>
                  {/* Floating Date Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    minWidth: '50px'
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {startDate.toLocaleString('default', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1f2937', lineHeight: 1, marginTop: '2px', fontFamily: 'Outfit' }}>
                      {startDate.getDate()}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: isOngoing ? 'rgba(16, 185, 129, 0.9)' : isUpcoming ? 'rgba(59, 130, 246, 0.9)' : 'rgba(107, 114, 128, 0.9)',
                    color: 'white',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {isOngoing && <Activity size={10} />}
                    {isOngoing ? 'Ongoing' : isUpcoming ? 'Upcoming' : 'Past'}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'Outfit', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                    {ev.title}
                  </h3>
                  
                  {ev.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ev.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {ev.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                          <MapPin size={14} color="var(--primary)" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.location}</span>
                        </div>
                      )}
                      
                      {ev.endDate && startDate.getTime() !== endDate.getTime() && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                          <Clock size={14} color="var(--accent)" />
                          <span>Until {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                src={selectedEvent.image.startsWith('http') ? selectedEvent.image : `${SERVER_URL}${selectedEvent.image.startsWith('/') ? '' : '/'}${selectedEvent.image}`} 
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
