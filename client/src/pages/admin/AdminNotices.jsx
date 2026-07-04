import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, FileText, Download, Upload, Type, AlignLeft, Users, File as FileIcon, Calendar } from 'lucide-react';
import Modal from '../../components/Modal';
import { useConfirm } from '../../context/ConfirmContext';


const empty = { title: '', body: '', targetRole: 'all' };

export default function AdminNotices() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/notices').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setFile(null); setModal('create'); };
  const openEdit = (item) => {
    setForm({ title: item.title, body: item.body || '', targetRole: item.targetRole || 'all' });
    setFile(null);
    setModal(item);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and Content are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('body', form.body);
      fd.append('targetRole', form.targetRole);
      if (file) fd.append('file', file);

      if (modal === 'create') {
        await api.post('/notices', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/notices/${modal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(modal === 'create' ? 'Notice created!' : 'Notice updated!');
      setModal(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving notice');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Delete this notice?'))) return;
    try { await api.delete(`/notices/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  const roleBadge = (role) => {
    const map = { all: 'badge-info', teacher: 'badge-warning', student: 'badge-success' };
    return <span className={`badge ${map[role] || 'badge-info'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{role}</span>;
  };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245,158,11,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(245,158,11,0.15)' }}>
            <FileText size={24} color="var(--warning)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Notice Board</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Publish official notices and documents.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}><Plus size={18} /> New Notice</button>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        items.length === 0 ? <div className="empty-state card-elevated"><FileText size={48} /><p>No notices yet.</p></div> :
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {items.map(n => (
            <div key={n._id} className="card-elevated" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', transition: 'all 0.2s' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{n.title}</h3>
                  {roleBadge(n.targetRole || n.forRole)}
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                  {n.body || n.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {n.file && (
                    <a href={n.file} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem', display: 'flex', gap: '0.4rem', color: 'var(--primary)' }}>
                      <Download size={14} /> Download Attachment
                    </a>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n._id)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <Modal title={modal === 'create' ? 'New Notice' : 'Edit Notice'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Type size={14} /> Title</label>
              <input type="text" style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Holiday on Friday" />
            </div>
            
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlignLeft size={14} /> Content</label>
              <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} value={form.body} onChange={set('body')} placeholder="Provide details here..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Users size={14} /> Visible To</label>
                <select style={inputStyle} value={form.targetRole} onChange={set('targetRole')}>
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><FileIcon size={14} /> Attachment (optional)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.15rem', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
                  <Upload size={18} color="var(--primary)" />
                  <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem', color: file ? 'var(--text)' : 'var(--text-muted)' }}>
                    {file ? file.name : (modal !== 'create' && modal.file ? 'Replace existing file...' : 'Choose a file...')}
                  </div>
                  <input id="notice-file-input" type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
                </label>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> Publish Notice</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
