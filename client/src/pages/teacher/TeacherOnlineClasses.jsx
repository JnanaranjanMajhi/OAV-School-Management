import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Save, ExternalLink, Clock, Video, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import Modal from '../../components/Modal';
import { CLASS_OPTIONS, SUBJECT_OPTIONS, SUBJECTS_BY_CLASS } from '../../utils/constants';

const emptyForm = { title: '', description: '', class: '', subject: '', link: '', platform: 'Zoom', scheduledAt: '' };

const platformColors = {
  'Zoom':         { bg: 'rgba(45,140,255,0.1)',   border: 'rgba(45,140,255,0.3)',   color: '#2d8cff', gradient: 'linear-gradient(135deg, #2d8cff, #1a73e8)' },
  'Google Meet':  { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)',   color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'Microsoft Teams': { bg: 'rgba(79,70,229,0.1)', border: 'rgba(79,70,229,0.3)', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  'YouTube':      { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',    color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  'Other':        { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.3)',   color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
};

const getPlatformStyle = (platform) =>
  platformColors[platform] || platformColors.Other;

export default function TeacherOnlineClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('upcoming');

  const load = () => api.get('/online-classes').then(r => setClasses(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...emptyForm }); setModal(true); };
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.class || !form.subject || !form.link || !form.scheduledAt) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/online-classes', form);
      toast.success('Online class created!');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating class');
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const upcoming = classes.filter((c) => new Date(c.date || c.scheduledAt) >= now).sort((a, b) => new Date(a.date || a.scheduledAt) - new Date(b.date || b.scheduledAt));
  const past = classes.filter((c) => new Date(c.date || c.scheduledAt) < now).sort((a, b) => new Date(b.date || b.scheduledAt) - new Date(a.date || a.scheduledAt));
  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,68,68,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(239,68,68,0.15)' }}>
            <Video size={24} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Manage Online Classes</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Schedule and manage your live sessions.</p>
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={openCreate}
          style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: '30px', fontWeight: 600, boxShadow: '0 4px 10px rgba(79,70,229,0.3)' }}
        >
          <Plus size={18} /> Schedule New Class
        </button>
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setTab('upcoming')}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            border: 'none',
            background: tab === 'upcoming' ? 'var(--primary)' : 'var(--bg-input)',
            color: tab === 'upcoming' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'upcoming' ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          Upcoming Classes ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            border: 'none',
            background: tab === 'past' ? 'var(--text-muted)' : 'var(--bg-input)',
            color: tab === 'past' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'past' ? '0 4px 12px rgba(156, 163, 175, 0.3)' : 'none'
          }}
        >
          Past Classes ({past.length})
        </button>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Video size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No {tab} classes</h3>
          <p style={{ color: 'var(--text-muted)' }}>You have no {tab} sessions scheduled.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {displayed.map((cls) => {
            const isUpcoming = new Date(cls.date || cls.scheduledAt) >= now;
            const platStyle = getPlatformStyle(cls.platform);
            const classDate = new Date(cls.date || cls.scheduledAt);

            return (
              <div
                key={cls._id}
                className="card-elevated"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isUpcoming ? 1 : 0.8,
                  filter: isUpcoming ? 'none' : 'grayscale(0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px ${platStyle.bg}`;
                  e.currentTarget.style.borderColor = platStyle.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: platStyle.gradient }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.75rem' }}>
                  <div style={{ background: platStyle.bg, color: platStyle.color, padding: '0.5rem', borderRadius: '10px', flexShrink: 0 }}>
                    <Video size={18} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {isUpcoming ? (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Upcoming
                      </span>
                    ) : (
                      <span style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Ended
                      </span>
                    )}
                    {cls.platform && (
                      <span style={{ color: platStyle.color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.3rem' }}>
                        {cls.platform}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Details */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'Outfit', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                  {cls.title}
                </h3>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>
                    Class {cls.class}
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>
                    <BookOpen size={10} style={{ display: 'inline', marginRight: '3px' }} /> {cls.subject}
                  </span>
                </div>

                {cls.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                    {cls.description}
                  </p>
                )}
                {!cls.description && <div style={{ flex: 1, marginBottom: '1rem' }} />}

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>
                    <CalendarIcon size={14} color="var(--primary)" />
                    <span>
                      {classDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>
                    <Clock size={14} color="var(--accent)" />
                    <span>
                      {classDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Join button */}
                {cls.link && (
                  <a
                    href={cls.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: isUpcoming ? platStyle.gradient : 'var(--bg-input)',
                      color: isUpcoming ? '#fff' : 'var(--text)',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      border: isUpcoming ? 'none' : '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                      if(isUpcoming) e.currentTarget.style.opacity = '0.9';
                      else e.currentTarget.style.background = 'var(--border-light)';
                    }}
                    onMouseLeave={(e) => {
                      if(isUpcoming) e.currentTarget.style.opacity = '1';
                      else e.currentTarget.style.background = 'var(--bg-input)';
                    }}
                  >
                    {isUpcoming ? (
                      <>
                        <Video size={16} /> Join Live Class
                      </>
                    ) : (
                      <>
                        <ExternalLink size={16} /> View Recording / Link
                      </>
                    )}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Schedule Online Class" onClose={() => setModal(false)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.25rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Topic / Title</label>
                <input type="text" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none' }} value={form.title} onChange={set('title')} placeholder="e.g. Algebra Chapter 2 Review" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Description (Optional)</label>
                <textarea style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none', minHeight: '60px', resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Brief details about the class..." />
              </div>
              
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Target Class</label>
                <select 
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none', cursor: 'pointer' }} 
                  value={form.class} 
                  onChange={(e) => {
                    const newClass = e.target.value;
                    const availableSubjects = SUBJECTS_BY_CLASS[newClass] || SUBJECT_OPTIONS;
                    setForm(prev => ({ ...prev, class: newClass, subject: availableSubjects[0] || '' }));
                  }}
                >
                  <option value="">Select Class</option>
                  {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Subject</label>
                <select 
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none', cursor: 'pointer' }} 
                  value={form.subject} 
                  onChange={set('subject')}
                >
                  <option value="">Select Subject</option>
                  {(SUBJECTS_BY_CLASS[form.class] || SUBJECT_OPTIONS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Platform</label>
                <select style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none' }} value={form.platform} onChange={set('platform')}>
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="YouTube">YouTube Live</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Scheduled At</label>
                <input type="datetime-local" min={minDateTime} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none' }} value={form.scheduledAt} onChange={set('scheduledAt')} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>Meeting Link</label>
                <input type="url" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', width: '100%', color: 'var(--text)', outline: 'none' }} value={form.link} onChange={set('link')} placeholder="https://zoom.us/j/..." />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(false)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(79,70,229,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={16} /> Schedule Class</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
