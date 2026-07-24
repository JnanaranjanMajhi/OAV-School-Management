import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Share2, Globe, Video } from 'lucide-react';

export default function Footer({ info }) {
  const s = info || {};
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="flex items-center gap-1 mb-2" style={{ fontSize: '1.2rem', fontFamily: 'Outfit', fontWeight: 800 }}>
              <GraduationCap size={22} color="#818cf8" />
              <span className="gradient-text">{s.schoolName || 'Whispering Pines School'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 260 }}>
              {s.tagline || 'Whispering Pines School — Excellence in Every Step'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {s.socialLinks?.facebook && <a href={s.socialLinks.facebook} className="footer-social"><Share2 size={18} /></a>}
              {s.socialLinks?.instagram && <a href={s.socialLinks.instagram} className="footer-social"><Globe size={18} /></a>}
              {s.socialLinks?.youtube && <a href={s.socialLinks.youtube} className="footer-social"><Video size={18} /></a>}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>Quick Links</h4>
            {[['/', 'Home'], ['/results', 'Results'], ['/gallery', 'Gallery'], ['/downloads', 'Downloads']].map(([to, label]) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>Academics</h4>
            {[['/teachers', 'Teachers'], ['/contact', 'Contact Us'], ['/login', 'Login Portal']].map(([to, label]) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {s.address && <span className="flex items-center gap-1"><MapPin size={13} />{s.address}</span>}
              {s.phone && <span className="flex items-center gap-1"><Phone size={13} />{s.phone}</span>}
              {s.email && <span className="flex items-center gap-1"><Mail size={13} />{s.email}</span>}
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span>© {new Date().getFullYear()} {s.schoolName || 'Whispering Pines School'}. All rights reserved.</span>
            <span style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span>Established {s.establishedYear || '2019'} · {s.affiliation || 'CBSE'}</span>
              {s.website && <span>· <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Parent Organization: Whispering Pines Trust</a></span>}
            </span>
          </div>
          {isHomePage && (
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Developed by <a href="https://jnanaranjanmajhi.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Jnanaranjan Majhi</a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
