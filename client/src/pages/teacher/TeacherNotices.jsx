import { useState, useEffect } from 'react';
import { SERVER_URL } from '../../api/axios';
import api from '../../api/axios';
import { Bell, Download, FileText, Calendar, ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';

export default function TeacherNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    api.get('/notices?role=teacher')
      .then((r) => setNotices(r.data.data || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245,158,11,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(245,158,11,0.15)' }}>
            <Bell size={24} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Notices & Circulars</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Official communications and documents from the school.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : notices.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Bell size={48} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Notices Right Now</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no active notices for teachers at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {notices.map((notice) => (
            <div 
              key={notice._id} 
              className="card-elevated"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1.75rem',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all 0.3s ease',
              }}
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))', 
                  color: '#ef4444',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  flexShrink: 0
                }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'Outfit', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                      {notice.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 500 }}>
                    <Calendar size={12} />
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {(notice.body || notice.content) && (
                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.6, 
                    display: '-webkit-box', 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                  }}>
                    {notice.body || notice.content}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px dashed var(--border)' }}>
                {notice.targetRole ? (
                  <span style={{ 
                    background: 'var(--bg-input)', 
                    color: 'var(--text-muted)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {notice.targetRole === 'all' ? 'Everyone' : notice.targetRole}
                  </span>
                ) : <span />}
                
                {notice.file ? (
                  <a
                    href={notice.file.startsWith('http') ? notice.file : `${SERVER_URL}${notice.file.startsWith('/') ? '' : '/'}${notice.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 10px rgba(79,70,229,0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                  >
                    <Download size={16} /> Download
                  </a>
                ) : (
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      fontSize: '0.85rem', 
                      color: 'var(--primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedNotice && (
        <Modal title={selectedNotice.title} onClose={() => setSelectedNotice(null)}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <Calendar size={14} />
              {new Date(selectedNotice.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {selectedNotice.body || selectedNotice.content}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
