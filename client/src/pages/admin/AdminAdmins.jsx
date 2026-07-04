import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, ShieldOff, Users, AlertTriangle, KeyRound, EyeOff, Eye, User, Mail, Phone, BookOpen, Save } from 'lucide-react';
import Modal from '../../components/Modal';

function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertTriangle size={26} color="var(--danger)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Delete Admin?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{name}</strong>? This cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}><Trash2 size={14} /> Delete</button>
        </div>
      </div>
    </div>
  );
}

const emptyEdit = { name: '', email: '', phone: '', subject: '' };

export default function AdminAdmins() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/users?role=admin').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openEdit = (adminUser) => {
    setForm({
      name: adminUser.name || '',
      email: adminUser.email || '',
      phone: adminUser.phone || '',
      subject: adminUser.subject || '',
    });
    setModal(adminUser);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });

      await api.put(`/users/${modal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Admin updated!');
      setModal(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${confirmDel._id}`);
      toast.success(`${confirmDel.name} deleted`);
      setConfirmDel(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting admin');
    }
  };

  const handleDemote = async (t) => {
    if (!window.confirm(`Are you sure you want to remove ${t.name} as Admin? They will be demoted back to Teacher.`)) return;
    try {
      await api.put(`/users/${t._id}`, { role: 'teacher' });
      toast.success(`${t.name} is no longer an Admin!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error removing admin');
    }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginTop: '1rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(245,158,11,0.15)' }}>
            <ShieldOff size={24} color="#d97706" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Admins</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Manage administrators and their permissions.</p>
          </div>
        </div>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        items.length === 0 ? <div className="empty-state card-elevated"><Users size={48} /><p>No admins found.</p></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card-elevated" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="table-wrap" style={{ margin: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '60px' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                    <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t, idx) => (
                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
                            boxShadow: '0 4px 10px rgba(99,102,241,0.3)'
                          }}>
                            {t.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div>
                              {t.name}
                              {t.email === 'admin1@school.com' && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Principal</span>}
                              {t.email === 'admin2@school.com' && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Vice Principal</span>}
                              {t.role === 'admin' && t.email !== 'admin1@school.com' && t.email !== 'admin2@school.com' && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Admin</span>}
                            </div>
                            {!t.isApproved && <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Pending</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{t.email}</td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{t.phone || '—'}</td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          
                          {(t.email !== 'admin1@school.com' && t.email !== 'admin2@school.com' && (user?.email === 'admin1@school.com' || user?.email === 'admin2@school.com')) || 
                           (t.email === 'admin2@school.com' && user?.email === 'admin1@school.com') ? (
                            <button className="btn btn-sm" onClick={() => handleDemote(t)} title="Remove Admin" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}><ShieldOff size={16} /></button>
                          ) : null}

                          {(t.email !== 'admin1@school.com' || user?.email === 'admin1@school.com') && (t.email !== 'admin2@school.com' || user?.email === 'admin1@school.com' || user?.email === 'admin2@school.com') && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)} title="Edit user" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16} /></button>
                              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(t)} title="Delete user" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      {modal && (
        <Modal title={'Edit Admin'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><User size={14} /> Name</label>
              <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Full name" />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Mail size={14} /> Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Phone size={14} /> Phone</label>
              <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="Phone number" />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDel && (
        <ConfirmModal
          name={confirmDel.name}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </>
  );
}
