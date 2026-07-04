import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, Megaphone, Image, Download,
  FileSpreadsheet, BookOpen, Settings, MapPin, ScrollText, LogOut,
  Menu, X, GraduationCap, ClipboardList, Bell, Video, CheckSquare, MessageSquare, Globe, ChevronDown, Shield
} from 'lucide-react';
import Navbar from './Navbar';
import { SERVER_URL } from '../api/axios';

const adminLinks = [
  { section: 'Overview', items: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/logs', icon: ScrollText, label: 'Activity Logs' },
  ]},
  { section: 'Content', items: [
    { to: '/admin/school-info', icon: Settings, label: 'School Info' },
    { to: '/admin/events', icon: Calendar, label: 'Events' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/admin/notices', icon: Bell, label: 'Notices' },
    { to: '/admin/gallery', icon: Image, label: 'Gallery' },
    { to: '/admin/downloads', icon: Download, label: 'Downloads' },
    { to: '/admin/results', icon: FileSpreadsheet, label: 'Results' },
    { to: '/admin/online-classes', icon: Video, label: 'Online Classes' },
    { to: '/admin/grievances', icon: MessageSquare, label: 'Grievance Box' },
  ]},

  { section: 'Users', items: [
    { to: '/admin/admins', icon: Shield, label: 'Admins' },
    { to: '/admin/teachers', icon: BookOpen, label: 'Teachers' },
    { to: '/admin/students', icon: Users, label: 'Students' },
  ]},
  { section: 'Site', items: [
    { to: '/admin/contact', icon: MapPin, label: 'Contact Info' },
  ]},
];

const teacherLinks = [
  { section: 'Overview', items: [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Manage', items: [
    { to: '/teacher/attendance', icon: CheckSquare, label: 'Attendance' },
    { to: '/teacher/events', icon: Calendar, label: 'Events' },
    { to: '/teacher/results', icon: FileSpreadsheet, label: 'Upload Results' },
    { to: '/teacher/notices', icon: Bell, label: 'Notices' },
    { to: '/teacher/online-classes', icon: Video, label: 'Online Classes' },
    { to: '/teacher/grievances', icon: MessageSquare, label: 'Grievance Box' },
  ]},
  { section: 'View', items: [
    { to: '/teacher/students', icon: Users, label: 'Student List' },
  ]},
];

const studentLinks = [
  { section: 'Overview', items: [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'My Info', items: [
    { to: '/student/profile', icon: Settings, label: 'My Profile' },
    { to: '/student/attendance', icon: CheckSquare, label: 'My Attendance' },
    { to: '/student/results', icon: FileSpreadsheet, label: 'My Results' },
    { to: '/student/events', icon: Calendar, label: 'Events' },
    { to: '/student/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/student/notices', icon: Bell, label: 'Notices' },
    { to: '/student/downloads', icon: Download, label: 'Downloads' },
    { to: '/student/online-classes', icon: Video, label: 'Online Classes' },
    { to: '/student/grievances', icon: MessageSquare, label: 'Help & Grievances' },
  ]},
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_expanded');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  useEffect(() => {
    localStorage.setItem('sidebar_expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const sidebarRef = useRef(null);
  const mainRef = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const links = user?.role === 'admin' 
    ? [
        { isHeader: true, title: 'Admin Panel' },
        ...adminLinks.map(group => ({
          ...group,
          id: `admin-${group.section}`
        })),
        { isHeader: true, title: 'Teacher Panel' },
        ...teacherLinks.map(group => ({
          ...group,
          id: `teacher-${group.section}`
        }))
      ]
    : user?.role === 'teacher' ? teacherLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <Navbar />
      <div className="dash-layout">
        {/* Sidebar */}
        <aside 
          className={`sidebar${open ? ' open' : ''}`}
        >
          <div 
            ref={sidebarRef}
            className="sidebar-scroll"
          >
            <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', overflow: 'hidden', boxShadow: '0 4px 10px rgba(79,70,229,0.2)' }}>
              {user?.photo ? (
                <img src={user.photo.startsWith('http') ? user.photo : `${SERVER_URL}${user.photo}`} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0).toUpperCase() || <Users size={30} />
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }} className="gradient-text">
              {user?.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize', marginTop: '0.2rem', letterSpacing: '0.05em' }}>
              {user?.role === 'admin' ? 'Admin Panel' : `${user?.role} Portal`}
            </div>
          </div>
        </div>

        {links.map((group, idx) => {
          if (group.isHeader) {
            return (
              <div key={`header-${idx}`} style={{ 
                padding: '1.5rem 1.5rem 0.5rem', 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase', 
                marginTop: idx === 0 ? '0' : '0.5rem' 
              }}>
                {group.title}
              </div>
            );
          }
          const sectionId = group.id || group.section;
          return (
            <div key={`${sectionId}-${idx}`} className="sidebar-section">
              <div 
                className="sidebar-label" 
                onClick={() => toggleSection(sectionId)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                {group.section}
                <ChevronDown size={14} style={{ transform: expandedSections[sectionId] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </div>
              <div style={{ 
                maxHeight: expandedSections[sectionId] ? '600px' : '0px', 
                overflow: 'hidden', 
                transition: 'max-height 0.35s ease-in-out' 
              }}>
                {group.items.map(item => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
                    <item.icon size={16} /> {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ padding: '1.5rem', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} aria-label="Logout">
            <LogOut size={15} /> Logout
          </button>
        </div>
          </div>
      </aside>

      {/* Main content */}
      <main className="dash-main" ref={mainRef}>
        {/* Mobile topbar */}
        <div className="hamburger" style={{ width: '100%', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'flex-start' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} 
            onClick={() => setOpen(!open)}
            aria-label="Toggle Dashboard Menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Dashboard Menu</span>
          </button>
        </div>
        {children || <Outlet />}
        
      </main>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}
      </div>
    </>
  );
}
