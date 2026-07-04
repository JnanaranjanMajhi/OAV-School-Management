import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Video, ExternalLink, AlertTriangle } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

export default function OnlineClassesPage() {
  usePageTitle('Online Classes');
  const [classes, setClasses] = useState([]);
  const [info, setInfo] = useState({});
  const [cls, setCls] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    api.get('/school-info').then(r => setInfo(r.data.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    const q = cls ? `?class=${cls}` : '';
    api.get(`/online-classes${q}`)
      .then(r => setClasses(r.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load online classes'))
      .finally(() => setLoading(false));
  }, [cls]);

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div style={{ padding: '3rem 0', background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.1) 0%, transparent 70%)' }}>
          <div className="container">
            <div className="section-tag">Virtual Learning</div>
            <h1>Online <span className="gradient-text">Classes &amp; Tests</span></h1>
          </div>
        </div>
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '2rem', maxWidth: 300 }}>
            <input className="form-input" placeholder="Filter by class (e.g. Class 10)" value={cls} onChange={e => { setCls(e.target.value); setLoading(true); }} />
          </div>
          {loading ? (
            <div className="page-center"><div className="spinner" /></div>
          ) : error ? (
            <div className="page-center" style={{ color: 'var(--danger)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <AlertTriangle size={32} />
              <p>{error}</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="empty-state"><p>No online classes scheduled.</p></div>
          ) : (
            <div className="grid grid-3" style={{ display: 'grid' }}>
              {classes.map(c => (
                <div key={c._id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={18} color="var(--warning)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.subject}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info">{c.class}</span>
                    {c.platform && <span className="badge badge-warning">{c.platform}</span>}
                  </div>
                  {c.scheduledAt && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>📅 {new Date(c.scheduledAt).toLocaleString()}</div>}
                  {c.description && <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{c.description}</p>}
                  <a href={c.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm w-full" style={{ justifyContent: 'center' }}>
                    <ExternalLink size={13} /> Join Class
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
