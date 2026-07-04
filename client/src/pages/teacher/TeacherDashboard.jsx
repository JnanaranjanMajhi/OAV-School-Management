import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Bell, Users, Video, Edit2, Save, ArrowRight } from 'lucide-react';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { SERVER_URL } from '../../api/axios';

export default function TeacherDashboard() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '', qualification: '', experience: '', achievements: '' });
  const [photo, setPhoto] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/events').catch(() => ({ data: { count: 0 } })),
      api.get('/notices?role=teacher').catch(() => ({ data: { count: 0 } })),
      api.get('/users?role=student').catch(() => ({ data: { count: 0 } })),
      api.get('/online-classes').catch(() => ({ data: { count: 0 } })),
    ]).then(([e, n, s, oc]) => {
      setStats({
        events: e.data.count || 0,
        notices: n.data.count || 0,
        students: s.data.count || 0,
        onlineClasses: oc.data.count || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'My Students', value: stats.students, icon: Users, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', to: '/teacher/students', desc: 'Manage your students and records' },
    { label: 'Online Classes', value: stats.onlineClasses, icon: Video, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', to: '/teacher/online-classes', desc: 'Schedule and manage live sessions' },
    { label: 'Notices', value: stats.notices, icon: Bell, color: '#ec4899', bg: 'rgba(236,72,153,0.15)', to: '/teacher/notices', desc: 'View official school circulars' },
    { label: 'Events', value: stats.events, icon: Calendar, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', to: '/teacher/events', desc: 'Check upcoming activities' },
  ];

  const openProfile = () => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      qualification: user?.qualification || '',
      experience: user?.experience || '',
      achievements: user?.achievements || '',
    });
    setPhoto(null);
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      const { data } = await api.put('/users/update-profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated successfully');
      updateUser(data.data);
      setShowProfileModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      {/* Welcome Banner */}
      <div className="card-elevated" style={{ 
        padding: '1.5rem 2rem', 
        marginBottom: '1.5rem', 
        borderRadius: 'var(--radius-lg)', 
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(15px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit' }}>Welcome back, {user?.name}! 👋</h2>
          <p style={{ margin: '0.2rem 0 0', opacity: 0.9, fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
            Here's your teacher dashboard overview. Manage your students, online classes, and keep your profile up to date.
          </p>
        </div>

        <button 
          onClick={openProfile}
          style={{ 
            position: 'relative', 
            zIndex: 1,
            background: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '20px', 
            fontWeight: 600, 
            fontSize: '0.85rem',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: '2px' }} />
        Overview & Quick Access
      </h3>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="card-elevated" style={{ height: 110, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'var(--bg-input)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: 16, background: 'var(--bg-input)', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '40%', height: 12, background: 'var(--bg-input)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {statCards.map(({ label, value, icon: Icon, color, bg, to, desc }) => (
            <Link key={label} to={to} style={{ textDecoration: 'none' }}>
              <div className="card-elevated" style={{ height: '100%', padding: '1.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: 'none', transition: 'all 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                
                {/* Number Badge */}
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', fontWeight: 800, color: color, opacity: 0.3, fontFamily: 'Outfit', lineHeight: 1 }}>
                  {value ?? '0'}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: color }}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text)' }}>{label}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0, paddingRight: '1rem' }}>{desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.85rem', color: color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Manage {label} <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showProfileModal && (
        <Modal title="Edit Profile" onClose={() => setShowProfileModal(false)} wide>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
                <input className="form-input" style={{ background: 'var(--bg)' }} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
                <input className="form-input" style={{ background: 'var(--bg)' }} value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Qualification</label>
                <input className="form-input" style={{ background: 'var(--bg)' }} placeholder="e.g. M.Sc., B.Ed." value={profileForm.qualification} onChange={e => setProfileForm(p => ({ ...p, qualification: e.target.value }))} />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Experience</label>
                <input className="form-input" style={{ background: 'var(--bg)' }} placeholder="e.g. 5 Years" value={profileForm.experience} onChange={e => setProfileForm(p => ({ ...p, experience: e.target.value }))} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Achievements</label>
              <textarea className="form-input" style={{ background: 'var(--bg)' }} rows="2" placeholder="Any notable achievements..." value={profileForm.achievements} onChange={e => setProfileForm(p => ({ ...p, achievements: e.target.value }))} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Biography</label>
              <textarea className="form-input" style={{ background: 'var(--bg)' }} rows="3" placeholder="Tell students a bit about yourself..." value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Profile Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                {photo ? (
                  <img src={URL.createObjectURL(photo)} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                ) : user?.photo ? (
                  <img src={user.photo.startsWith('http') ? user.photo : `${SERVER_URL}${user.photo}`} alt="Current" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" className="form-input" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} onChange={e => setPhoto(e.target.files[0])} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Select a square image for best results.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowProfileModal(false)}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleProfileSave} 
                disabled={savingProfile}
                style={{ padding: '0.6rem 2rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 15px rgba(79,70,229,0.3)' }}
              >
                {savingProfile ? <div className="spinner-sm spinner" /> : <><Save size={16} /> Save Profile</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
