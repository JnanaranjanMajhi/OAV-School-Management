import { useState, useEffect } from 'react';
import { SERVER_URL } from '../../api/axios';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { PlayCircle, AlertTriangle } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

export default function GalleryPage() {
  usePageTitle('Gallery');
  const [items, setItems] = useState([]);
  const [info, setInfo] = useState({});
  const [tab, setTab] = useState('Gallery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { 
    api.get('/school-info').then(r => setInfo(r.data.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    api.get(`/gallery?category=${tab}`)
      .then(r => setItems(r.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load gallery'))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div style={{ padding: '3rem 0', background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.1) 0%, transparent 70%)' }}>
          <div className="container">
            <div className="section-tag">Visual Memories</div>
            <h1>School <span className="gradient-text">Gallery</span></h1>
          </div>
        </div>
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {['Gallery', 'Achievement'].map(t => (
              <button 
                key={t} 
                onClick={() => { setTab(t); setLoading(true); }} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: tab === t ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '-0.5rem'
                }}
              >
                {t === 'Gallery' ? '🖼️ Gallery' : '🏆 Achievements'}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="page-center"><div className="spinner" /></div>
          ) : error ? (
            <div className="page-center" style={{ color: 'var(--danger)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <AlertTriangle size={32} />
              <p>{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state"><p>No images yet.</p></div>
          ) : (
            <div className="gallery-grid">
              {items.map(item => (
                <div key={item._id} className="gallery-item" onClick={() => setLightbox(item)} style={{ cursor: 'pointer' }}>
                  {item.image?.match(/\.(mp4|webm|ogg)$/i) ? (
                    <>
                      <video src={`${SERVER_URL}${item.image}`} muted loop playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.8)', zIndex: 1 }}>
                        <PlayCircle size={48} strokeWidth={1.5} />
                      </div>
                    </>
                  ) : (
                    <img src={`${SERVER_URL}${item.image}`} alt={item.caption} loading="lazy" />
                  )}
                  <div className="gallery-item-overlay">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            {lightbox.image?.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={`${SERVER_URL}${lightbox.image}`} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
            ) : (
              <img src={`${SERVER_URL}${lightbox.image}`} alt={lightbox.caption} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
            )}
            <div style={{ textAlign: 'center', marginTop: '0.75rem', color: 'white', fontWeight: 600 }}>{lightbox.caption}</div>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -16, right: -16, background: 'var(--danger)', border: 'none', color: 'white', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
          </div>
        </div>
      )}
      <Footer info={info} />
    </div>
  );
}
