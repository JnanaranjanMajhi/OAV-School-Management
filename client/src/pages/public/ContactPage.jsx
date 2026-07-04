import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

export default function ContactPage() {
  usePageTitle('Contact Us');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    api.get('/school-info')
      .then(r => setInfo(r.data.data || {}))
      .catch(err => setError(err.message || 'Failed to load contact info'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (error) return <div className="page-center" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!info) return null;

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div style={{ padding: '3rem 0', background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.1) 0%, transparent 70%)' }}>
          <div className="container">
            <div className="section-tag">Get In Touch</div>
            <h1>Contact <span className="gradient-text">Us</span></h1>
          </div>
        </div>
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'start' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: MapPin, label: 'Address', value: [info.address, info.city, info.state].filter(Boolean).join(', '), color1: 'rgba(79,70,229,0.15)', color2: 'rgba(16,185,129,0.15)', stroke: '#4f46e5' },
                { icon: Phone, label: 'Phone', value: info.phone, color1: 'rgba(16,185,129,0.15)', color2: 'rgba(6,182,212,0.15)', stroke: '#10b981' },
                { icon: Mail, label: 'Email', value: info.email, color1: 'rgba(6,182,212,0.15)', color2: 'rgba(139,92,246,0.15)', stroke: '#06b6d4' },
                { icon: Globe, label: 'Website', value: info.website, color1: 'rgba(139,92,246,0.15)', color2: 'rgba(79,70,229,0.15)', stroke: '#8b5cf6', isLink: true },
              ].map(({ icon: Icon, label, value, color1, color2, stroke, isLink }) => value && (
                  <div
                  key={label}
                  className="card-elevated"
                  style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${color1}, ${color2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color1}` }}>
                    <Icon size={20} color={stroke} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>
                      {isLink ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{value.replace('https://', '').replace('http://', '')}</a> : value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-elevated" style={{ flex: '2 1 400px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', height: 380, padding: '0.5rem', background: 'var(--bg-card)' }}>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '100%', position: 'relative' }}>
                {info.mapEmbedUrl ? (
                  <iframe src={info.mapEmbedUrl} width="100%" height="100%" style={{ border: 0, filter: 'var(--map-filter)', transition: 'filter 0.3s ease' }} allowFullScreen loading="lazy" title="School Location" />
                ) : (
                  <div style={{ height: '100%', background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <MapPin size={40} />
                    <p style={{ marginLeft: '0.75rem', fontSize: '1.1rem' }}>Map not configured</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer info={info} />
    </div>
  );
}
