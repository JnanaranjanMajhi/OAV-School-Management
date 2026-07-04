import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, LogIn, LayoutDashboard, UserPlus, Sun, Moon } from 'lucide-react';

const links = [
  { to: '/', label: 'Home' },
  { to: '/results', label: 'Results' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/downloads', label: 'Downloads' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide if scrolled down past 100px, show if scrolled up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const dashPath = user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'teacher' ? '/teacher/dashboard'
    : '/student/dashboard';

  return (
    <nav className={`navbar ${!show ? 'navbar-hidden' : ''}`} role="navigation" aria-label="Main Navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/logo.jpg" alt="OAV Logo" className="navbar-logo-img" />
          <div className="navbar-logo-text">
            <span className="navbar-logo-title">OAV Balarampur</span>
            <span className="navbar-logo-subtitle">Odisha Adarsha Vidyalaya</span>
          </div>
        </Link>

        <div className="navbar-links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={dashPath} className="btn btn-secondary btn-sm">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }} 
                className="btn btn-sm" 
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-outline btn-sm nav-btn-register">
                <UserPlus size={16} /> Register
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm nav-btn-login">
                <LogIn size={16} /> Login
              </Link>
            </>
          )}
          <button className="btn btn-sm" onClick={toggleTheme} aria-label="Toggle Theme" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle navigation menu" aria-expanded={open} aria-controls="mobile-menu">
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" style={{ background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border)', padding: '1rem' }} role="menu">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className="sidebar-link" onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
