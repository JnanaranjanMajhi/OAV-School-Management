import { useState, useEffect } from 'react';
import { SERVER_URL } from '../../api/axios';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const CATS = ['all', 'syllabus', 'notice', 'result', 'form', 'other'];

export default function DownloadsPage() {
  usePageTitle('Downloads');
  const [items, setItems] = useState([]);
  const [info, setInfo] = useState({});
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    api.get('/school-info').then(r => setInfo(r.data.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    const q = cat !== 'all' ? `?category=${cat}` : '';
    api.get(`/downloads${q}`)
      .then(r => setItems(r.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load downloads'))
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div style={{ padding: '3rem 0', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, transparent 70%)' }}>
          <div className="container">
            <div className="section-tag">Resources</div>
            <h1>Downloads <span className="gradient-text">&amp; Resources</span></h1>
          </div>
        </div>
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {CATS.map(c => (
              <button 
                key={c} 
                onClick={() => { setCat(c); setLoading(true); }} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '0.5rem 0', 
                  fontSize: '1.05rem', 
                  fontWeight: 600,
                  color: cat === c ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: cat === c ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                  marginBottom: '-0.5rem'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="page-center" style={{ minHeight: '30vh' }}><div className="spinner" /></div>
          ) : error ? (
            <div className="page-center" style={{ minHeight: '30vh', color: 'var(--danger)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <AlertTriangle size={32} />
              <p>{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="page-center" style={{ minHeight: '30vh', color: 'var(--text-muted)' }}>
              No downloads found for this category.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(item => (
                <div 
                  key={item._id} 
                  className="card-elevated" 
                  style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} 
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)'; }} 
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(16,185,129,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(79,70,229,0.2)' }}>
                      <FileText size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{item.title}</div>
                      {item.description && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.description}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem' }}>
                        <span className="badge badge-info" style={{ background: 'rgba(6,182,212,0.1)', color: '#0891b2', border: 'none', padding: '0.2rem 0.75rem', fontWeight: 600 }}>{item.category}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <a href={`${SERVER_URL}${item.fileUrl}`} download={item.fileName} className="btn" style={{ flexShrink: 0, padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, boxShadow: '0 8px 20px rgba(79,70,229,0.25)' }}>
                    <Download size={18} style={{ marginRight: '0.5rem' }} /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer info={info} />
    </div>
  );
}
