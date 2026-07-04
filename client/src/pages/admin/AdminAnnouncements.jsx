import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, Bell, Type, AlignLeft, Users, Pin } from 'lucide-react';
import Modal from '../../components/Modal';
import { useConfirm } from '../../context/ConfirmContext';


const empty = { title: '', body: '', targetRole: 'all', isPinned: false };

export default function AdminAnnouncements() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/announcements').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setModal('create'); };
  const openEdit = (item) => { setForm({ title: item.title, body: item.body, targetRole: item.targetRole, isPinned: item.isPinned }); setModal(item); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and Body are required');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'create') await api.post('/announcements', form);
      else await api.put(`/announcements/${modal._id}`, form);
      toast.success('Saved!'); setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); } finally { setSaving(false); }
  };

  const del = async (id) => { if (!(await confirmAction('Delete?'))) return; await api.delete(`/announcements/${id}`); toast.success('Deleted'); load(); };

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(16,185,129,0.15)' }}>
            <Bell size={24} color="var(--success)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Announcements</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Broadcast important messages to students and teachers.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}><Plus size={18} /> New Announcement</button>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        items.length === 0 ? <div className="empty-state card-elevated"><p>No announcements.</p></div> :
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {items.map(a => (
            <div key={a._id} className={`card-elevated`} style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: a.isPinned ? '4px solid var(--primary)' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
              {a.isPinned && <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderBottomLeftRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Pin size={12} /> PINNED</div>}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{a.title}</h3>
                  <span className={`badge ${a.targetRole === 'student' ? 'badge-primary' : a.targetRole === 'teacher' ? 'badge-success' : 'badge-info'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{a.targetRole}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{a.body}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginTop: a.isPinned ? '1rem' : 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16}/></button>
                <button className="btn btn-danger btn-sm" onClick={() => del(a._id)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <Modal title={modal === 'create' ? 'New Announcement' : 'Edit Announcement'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Type size={14} /> Title</label>
              <input type="text" style={inputStyle} value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Final Exams Schedule Released" />
            </div>
            
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlignLeft size={14} /> Message Body</label>
              <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} value={form.body} onChange={e => setForm(p=>({...p,body:e.target.value}))} placeholder="Write the announcement details here..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Users size={14} /> Target Audience</label>
                <select style={inputStyle} value={form.targetRole} onChange={e => setForm(p=>({...p,targetRole:e.target.value}))}>
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: form.isPinned ? 'rgba(79,70,229,0.1)' : 'var(--bg-input)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${form.isPinned ? 'var(--primary)' : 'var(--border-light)'}`, width: '100%', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p=>({...p,isPinned:e.target.checked}))} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: form.isPinned ? 'var(--primary)' : 'var(--text)' }}><Pin size={16} /> Pin this announcement</div>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}>{saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> Broadcast</>}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
