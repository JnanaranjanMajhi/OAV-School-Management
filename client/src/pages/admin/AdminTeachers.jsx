import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Edit2, Save, Users, Eye, EyeOff, AlertTriangle, KeyRound, Check, Mail, Phone, BookOpen, User, UploadCloud, ChevronDown, Shield } from 'lucide-react';
import Modal from '../../components/Modal';

function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertTriangle size={26} color="var(--danger)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Delete Teacher?</h3>
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

function ResetPwModal({ teacher, onClose }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleReset = async () => {
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pw)) return toast.error('Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number');
    setSaving(true);
    try {
      await api.put(`/users/${teacher._id}/reset-password`, { newPassword: pw });
      toast.success('Password reset successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally { setSaving(false); }
  };
  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <Modal title={`Reset Password — ${teacher.name}`} onClose={onClose}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><KeyRound size={14} /> New Password</label>
        <div style={{ position: 'relative' }}>
          <input type={show ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '2.5rem' }} placeholder="Min 6 characters" value={pw} onChange={e => setPw(e.target.value)} />
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
        <button className="btn btn-primary" onClick={handleReset} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
          {saving ? <div className="spinner-sm spinner" /> : <><KeyRound size={18} /> Reset Password</>}
        </button>
      </div>
    </Modal>
  );
}

const emptyCreate = { name: '', email: '', password: '', phone: '', subject: '' };
// const emptyEdit = { name: '', email: '', phone: '', subject: '' };

export default function AdminTeachers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [resetPw, setResetPw] = useState(null);
  const [form, setForm] = useState(emptyCreate);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [filterPending, setFilterPending] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ file: null });
  const [uploading, setUploading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const toggleExpand = (sub) => {
    setExpandedSubjects(prev => ({ ...prev, [sub]: !prev[sub] }));
  };

  const load = () => api.get('/users?role=teacher').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyCreate); setShowPw(false); setPhoto(null); setModal('create'); };
  const openEdit = (teacher) => {
    setForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subject: teacher.subject || '',
    });
    setShowPw(false);
    setPhoto(null);
    setModal(teacher);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required'); return;
    }
    if (modal === 'create' && !form.password) {
      toast.error('Password is required for new teacher'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      if (modal === 'create') fd.append('role', 'teacher');
      if (photo) fd.append('photo', photo);

      if (modal === 'create') {
        await api.post('/users', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Teacher added!');
      } else {
        fd.delete('password'); // Don't send password in update
        await api.put(`/users/${modal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Teacher updated!');
      }
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
      toast.error(err.response?.data?.message || 'Error deleting teacher');
    }
  };

  const handleApprove = async (t) => {
    try {
      await api.put(`/users/${t._id}/approve`);
      toast.success(`${t.name} approved successfully`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving teacher');
    }
  };

  const handlePromote = async (t) => {
    if (!window.confirm(`Are you sure you want to promote ${t.name} to Admin? This gives them full access to the Admin Portal.`)) return;
    try {
      await api.put(`/users/${t._id}`, { role: 'admin' });
      toast.success(`${t.name} is now an Admin!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error promoting user');
    }
  };

  const handleApproveAll = async () => {
    const pendingIds = filteredItems.filter(u => !u.isApproved).map(u => u._id);
    if (pendingIds.length === 0) return toast.error('No pending teachers to approve');
    setLoading(true);
    try {
      await api.put('/users/approve-bulk', { userIds: pendingIds });
      toast.success(`${pendingIds.length} teachers approved successfully!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving all teachers');
      setLoading(false);
    }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  /* ── Bulk Upload ── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('File is required');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      const res = await api.post('/users/upload-teachers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      setUploadModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading file');
    } finally { setUploading(false); }
  };

  const isCreate = modal === 'create';
  const filteredItems = items.filter(t => filterPending ? !t.isApproved : true);

  const groupedTeachers = filteredItems.reduce((acc, teacher) => {
    const sub = teacher.subject || 'Unassigned';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(teacher);
    return acc;
  }, {});

  const sortedSubjects = Object.keys(groupedTeachers).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginTop: '1rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(99,102,241,0.15)' }}>
            <Users size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Teachers</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Manage teaching staff and their accounts.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {filterPending && filteredItems.filter(u => !u.isApproved).length > 0 && (
            <button className="btn" onClick={handleApproveAll} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: 'var(--success)', color: 'white', border: 'none', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
              <Check size={20} /> Approve All Pending
            </button>
          )}
          <button
            className={`btn ${filterPending ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterPending(!filterPending)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: filterPending ? 'var(--primary)' : 'var(--bg-card)' }}
          >
            {filterPending ? 'Show All' : 'Show Pending'}
          </button>
          <button className="btn btn-secondary" onClick={() => { setUploadForm({ file: null }); setUploadModal(true); }} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: 'var(--bg-card)' }}>
            <UploadCloud size={20} /> Upload Teachers
          </button>
          <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}><Plus size={18} /> Add Teacher</button>
        </div>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        filteredItems.length === 0 ? <div className="empty-state card-elevated"><Users size={48} /><p>{filterPending ? 'No pending teachers.' : 'No teachers yet.'}</p></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedSubjects.map(sub => (
            <div key={sub} className="card-elevated" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div 
                onClick={() => toggleExpand(sub)}
                style={{ cursor: 'pointer', padding: '1.25rem 1.5rem', borderBottom: expandedSubjects[sub] ? '2px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,102,241,0.03)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{sub}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={15}/> {groupedTeachers[sub].length} Teachers</span>
                  <ChevronDown size={20} style={{ transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)', transform: expandedSubjects[sub] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>
              </div>

              <div className={`accordion-grid ${expandedSubjects[sub] ? 'expanded' : ''}`}>
                <div className="accordion-inner">
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
                        {groupedTeachers[sub].map((t, idx) => (
                          <tr key={t._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
                                  <div>{t.name}</div>
                                  {!t.isApproved && <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Pending</span>}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{t.email}</td>
                            <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>{t.phone || '—'}</td>
                            <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                {!t.isApproved && (
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => handleApprove(t)}
                                    title="Approve user"
                                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                                  >
                                    <Check size={16} />
                                  </button>
                                )}
                                
                                {user?.email === 'admin1@school.com' || user?.email === 'admin2@school.com' ? (
                                  <button className="btn btn-sm" onClick={() => handlePromote(t)} title="Make Admin" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}><Shield size={16} /></button>
                                ) : null}

                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)} title="Edit teacher" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={16} /></button>
                                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(t)} title="Delete teacher" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <Modal title={isCreate ? 'Add Teacher' : 'Edit Teacher'} onClose={() => setModal(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><User size={14} /> Name</label>
              <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Full name" />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Mail size={14} /> Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
            </div>
            {isCreate ? (
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><KeyRound size={14} /> Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '2.5rem' }} value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Phone size={14} /> Phone</label>
                <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="Phone number" />
              </div>
            )}
            
            {isCreate ? (
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Phone size={14} /> Phone</label>
                <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="Phone number" />
              </div>
            ) : null}

            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><BookOpen size={14} /> Subject</label>
              <input style={inputStyle} value={form.subject} onChange={set('subject')} placeholder="e.g. Mathematics" />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> {isCreate ? 'Add Teacher' : 'Save Changes'}</>}
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

      {/* ── Reset Password Modal ── */}
      {resetPw && (
        <ResetPwModal
          teacher={resetPw}
          onClose={() => setResetPw(null)}
        />
      )}

      {/* ── Bulk Upload Modal ── */}
      {uploadModal && (
        <Modal title="Upload Teachers Batch" onClose={() => setUploadModal(false)}>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Excel / CSV File <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-input)' }}>
                <input type="file" accept=".xlsx, .csv" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} style={{ width: '100%' }} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                Excel files must have columns: <strong>Name, Email</strong>. <br/>
                Optional: <strong>Subject, Phone</strong>.<br/>
                All uploaded teachers will automatically be assigned the default password: <code style={{ background: 'var(--bg-input)', padding: '2px 4px', borderRadius: '4px' }}>Teacher@123</code>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setUploadModal(false)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
                {uploading ? <div className="spinner-sm spinner" /> : <><UploadCloud size={18} /> Upload Data</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
