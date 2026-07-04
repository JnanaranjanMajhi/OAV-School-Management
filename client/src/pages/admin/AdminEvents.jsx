import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, Calendar, MapPin, AlignLeft, Type, UploadCloud } from 'lucide-react';
import Modal from '../../components/Modal';
import { useConfirm } from '../../context/ConfirmContext';


const empty = { title: '', description: '', date: '', endDate: '', location: '' };

export default function AdminEvents() {
  const confirmAction = useConfirm();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | event-obj
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/events').then(r => setEvents(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setFile(null); setModal('create'); };
  const openEdit = (ev) => {
    setForm({ title: ev.title, description: ev.description, date: ev.date?.slice(0, 10), endDate: ev.endDate?.slice(0, 10) || '', location: ev.location || '' });
    setFile(null);
    setModal(ev);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);

      if (modal === 'create') await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.put(`/events/${modal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      toast.success(modal === 'create' ? 'Event created!' : 'Event updated!');
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Delete this event?'))) return;
    try { await api.delete(`/events/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(236,72,153,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79,70,229,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(79,70,229,0.15)' }}>
            <Calendar size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Manage Events</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Create, update, and organize school events.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}><Plus size={18} /> Add Event</button>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        events.length === 0 ? <div className="empty-state card-elevated"><p>No events yet.</p></div> :
        <div className="card-elevated" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="table-wrap" style={{ margin: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,70,229,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text)' }}>{ev.title}</td>
                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{new Date(ev.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{ev.location || '—'}</td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev._id)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16} /></button>
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
        <Modal title={modal === 'create' ? 'Add New Event' : 'Edit Event'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Type size={14} /> Event Title</label>
                <input type="text" style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Annual Sports Day" />
              </div>
              
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlignLeft size={14} /> Description</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Provide details about the event..." />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Calendar size={14} /> Start Date</label>
                <input type="date" style={inputStyle} value={form.date} onChange={set('date')} />
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Calendar size={14} /> End Date (Optional)</label>
                <input type="date" style={inputStyle} value={form.endDate} onChange={set('endDate')} />
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><MapPin size={14} /> Location</label>
              <input type="text" style={inputStyle} value={form.location} onChange={set('location')} placeholder="e.g. Main Auditorium" />
            </div>

            <div>
              <label style={labelStyle}>Event Poster / Media</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', background: 'var(--bg-input)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <UploadCloud size={32} color="var(--primary-light)" />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Click to upload</span> <span style={{ color: 'var(--text-muted)' }}>or drag and drop</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>SVG, PNG, JPG or GIF (max. 800x400px)</div>
                </div>
                {file && <div style={{ marginTop: '0.5rem', padding: '0.25rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text)', border: '1px solid var(--primary-light)' }}>{file.name}</div>}
                <input type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} accept="image/*,video/*,application/pdf" />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}>{saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> Save Event</>}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
