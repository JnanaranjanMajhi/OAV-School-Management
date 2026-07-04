import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, Video, MonitorPlay, AlignLeft, Type, Link, Monitor, Calendar } from 'lucide-react';
import Modal from '../../components/Modal';
import { useConfirm } from '../../context/ConfirmContext';
import { CLASS_OPTIONS, SUBJECT_OPTIONS, SUBJECTS_BY_CLASS } from '../../utils/constants';

const empty = { title: '', description: '', class: '', subject: '', link: '', platform: 'zoom', scheduledAt: '' };
const platforms = ['zoom', 'meet', 'teams', 'other'];

const platformBadge = {
  zoom: 'badge-primary',
  meet: 'badge-success',
  teams: 'badge-info',
  other: 'badge-warning',
};

export default function AdminOnlineClasses() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/online-classes').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setModal('create'); };
  const openEdit = (item) => {
    setForm({
      title: item.title || '', description: item.description || '', class: item.class || '',
      subject: item.subject || '', link: item.link || '', platform: item.platform || 'zoom',
      scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : ''
    });
    setModal(item);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await api.post('/online-classes', form);
      else await api.put(`/online-classes/${modal._id}`, form);
      toast.success(modal === 'create' ? 'Class created!' : 'Class updated!');
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Delete this online class?'))) return;
    try { await api.delete(`/online-classes/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,68,68,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(239,68,68,0.15)' }}>
            <MonitorPlay size={24} color="var(--danger)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Online Classes</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Schedule and manage virtual classrooms.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}><Plus size={18} /> Schedule Class</button>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        items.length === 0 ? <div className="empty-state card-elevated"><MonitorPlay size={48} /><p>No online classes yet.</p></div> :
        <div className="card-elevated" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="table-wrap" style={{ margin: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topic & Link</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class & Subject</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>{item.title}</div>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500 }}>
                          <Video size={13} /> Join Meeting
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No link provided</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}><span className="badge badge-primary">Class {item.class}</span></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{item.subject || '—'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span className={`badge ${platformBadge[item.platform] || 'badge-info'}`} style={{ textTransform: 'capitalize', padding: '0.4rem 0.75rem' }}>{item.platform}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>By: {item.postedBy?.name || '—'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }

      {modal && (
        <Modal title={modal === 'create' ? 'Schedule Online Class' : 'Edit Online Class'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.25rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Type size={12} /> Topic / Title</label>
                <input type="text" style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Algebra Chapter 2 Review" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><AlignLeft size={12} /> Description (Optional)</label>
                <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Brief details about the class..." />
              </div>
              
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Monitor size={12} /> Target Class</label>
                <select 
                  style={{ ...inputStyle, cursor: 'pointer' }} 
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
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><MonitorPlay size={12} /> Subject</label>
                <select 
                  style={{ ...inputStyle, cursor: 'pointer' }} 
                  value={form.subject} 
                  onChange={set('subject')}
                >
                  <option value="">Select Subject</option>
                  {(SUBJECTS_BY_CLASS[form.class] || SUBJECT_OPTIONS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Video size={12} /> Platform</label>
                <select style={inputStyle} value={form.platform} onChange={set('platform')}>
                  {platforms.map(p => <option key={p} value={p} style={{ textTransform:'capitalize' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Calendar size={12} /> Scheduled At</label>
                <input type="datetime-local" min={minDateTime} style={inputStyle} value={form.scheduledAt} onChange={set('scheduledAt')} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Link size={12} /> Meeting Link</label>
                <input type="url" style={inputStyle} value={form.link} onChange={set('link')} placeholder="https://zoom.us/j/..." />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={16} /> {modal === 'create' ? 'Schedule Class' : 'Save Changes'}</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
