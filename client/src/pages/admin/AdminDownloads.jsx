import { useState, useEffect } from 'react';
import api, { SERVER_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, Download, Upload, FileDown, Type, AlignLeft, Tag, Users, File as FileIcon } from 'lucide-react';
import Modal from '../../components/Modal';
import { useConfirm } from '../../context/ConfirmContext';
import { CLASS_OPTIONS } from '../../utils/constants';

const empty = { title: '', description: '', category: 'other', targetClass: 'All' };

const categoryBadge = (cat) => {
  const map = { syllabus: 'badge-primary', form: 'badge-info', notice: 'badge-warning', other: 'badge-success' };
  return <span className={`badge ${map[cat] || 'badge-success'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{cat}</span>;
};

export default function AdminDownloads() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/downloads').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setFile(null); setModal('create'); };
  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description || '', category: item.category || 'other', targetClass: item.targetClass || 'All' });
    setFile(null);
    setModal(item);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('targetClass', form.targetClass);
      if (file) fd.append('file', file);

      if (modal === 'create') {
        if (!file) { toast.error('Please select a file'); setSaving(false); return; }
        await api.post('/downloads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/downloads/${modal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(modal === 'create' ? 'Download created!' : 'Download updated!');
      setModal(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Delete this download?'))) return;
    try { await api.delete(`/downloads/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(147,51,234,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(59,130,246,0.15)' }}>
            <FileDown size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Downloads</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Manage files, syllabus, and forms for download.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}><Plus size={18} /> Add Download</button>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        items.length === 0 ? <div className="empty-state card-elevated"><FileDown size={48} /><p>No downloads yet.</p></div> :
        <div className="card-elevated" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="table-wrap" style={{ margin: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Details</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Class</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(d => (
                  <tr key={d._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,70,229,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>{d.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description || 'No description'}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Added: {new Date(d.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>{categoryBadge(d.category)}</td>
                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{d.targetClass || 'All Classes'}</td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {d.fileUrl && (
                          <a href={d.fileUrl.startsWith('http') ? d.fileUrl : `${SERVER_URL}${d.fileUrl.startsWith('/') ? '' : '/'}${d.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', padding: '0.5rem 0.75rem', display: 'flex', gap: '0.35rem', borderRadius: 'var(--radius-sm)' }}>
                            <Download size={14} /> <span style={{ fontSize: '0.8rem' }}>Get</span>
                          </a>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16} /></button>
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
        <Modal title={modal === 'create' ? 'Add Download' : 'Edit Download'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Type size={14} /> Title</label>
              <input type="text" style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Grade 10 Syllabus" />
            </div>
            
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlignLeft size={14} /> Description</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Brief description of the file..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Tag size={14} /> Category</label>
                <select style={inputStyle} value={form.category} onChange={set('category')}>
                  <option value="syllabus">Syllabus</option>
                  <option value="form">Form</option>
                  <option value="notice">Notice</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Users size={14} /> Target Class</label>
                <select style={inputStyle} value={form.targetClass} onChange={set('targetClass')}>
                  <option value="All">All Classes</option>
                  {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><FileIcon size={14} /> File Upload</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', border: '1px solid var(--border-light)' }}>
                  <Upload size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{modal === 'create' ? 'Select File' : 'Replace existing file'}</div>
                  <div style={{ fontSize: '0.85rem', color: file ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file ? file.name : 'PDF, DOCX, JPG, ZIP (max 10MB)'}
                  </div>
                </div>
                <input id="download-file-input" type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> Save Download</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
