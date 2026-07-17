import { useState, useEffect } from 'react';
import { SERVER_URL } from '../../api/axios';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { GraduationCap, AlertTriangle } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';


export default function TeachersPage() {
  usePageTitle('Our Teachers');
  const [teachers, setTeachers] = useState([]);
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    api.get('/school-info').then(r => setInfo(r.data.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/users/public/teachers')
      .then(r => setTeachers(r.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load teachers'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div style={{ padding: '3rem 0', background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, transparent 70%)' }}>
          <div className="container">
            <div className="section-tag">Our Educators</div>
            <h1>Meet Our <span className="gradient-text">Teachers</span></h1>
          </div>
        </div>
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          {info.principalName && (
            <div className="card-elevated" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', padding: '2.5rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at top, rgba(79,70,229,0.05) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', overflow: 'hidden', border: '4px solid var(--bg-card)', boxShadow: '0 0 0 4px rgba(79,70,229,0.3), 0 10px 20px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {info.principalPhoto ? <img src={info.principalPhoto.startsWith('http') ? info.principalPhoto : `${SERVER_URL}${info.principalPhoto}`} alt={info.principalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <GraduationCap size={40} color="white" />}
                </div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.15rem' }}>{info.principalName}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Principal</div>
                {info.principalQualification && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{info.principalQualification}</p>}
                {info.principalExperience && <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{info.principalExperience} experience</p>}
                {info.principalAchievements && <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.15rem', fontWeight: 500 }}>🏆 {info.principalAchievements}</p>}
                {info.principalBio && <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginTop: '0.75rem', fontStyle: 'italic', lineHeight: 1.4, maxWidth: '600px', margin: '0.75rem auto 0' }}>"{info.principalBio}"</p>}
                
                {info.principalMessage && (
                  <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1rem', lineHeight: '1.5' }}>"{info.principalMessage}"</p>
                )}
              </div>
            </div>
          )}
          {loading ? (
            <div className="page-center"><div className="spinner" /></div>
          ) : error ? (
            <div className="page-center" style={{ color: 'var(--danger)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <AlertTriangle size={32} />
              <p>{error}</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="empty-state"><p>No teachers listed yet.</p></div>
          ) : (
            <div className="grid grid-4" style={{ display: 'grid' }}>
              {teachers.map(t => (
                <div key={t._id} className="teacher-card">
                  <div className="teacher-avatar">
                    {t.photo ? <img src={t.photo.startsWith('http') ? t.photo : `${SERVER_URL}${t.photo}`} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : t.name?.[0]?.toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{t.name}</h3>
                  {t.subject && <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{t.subject}</span>}
                  {t.qualification && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.qualification}</p>}
                  {t.experience && <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{t.experience} experience</p>}
                  {t.achievements && <p style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: '0.25rem', fontWeight: 500 }}>🏆 {t.achievements}</p>}
                  {t.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '0.75rem', fontStyle: 'italic', lineHeight: 1.4 }}>"{t.bio}"</p>}
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
