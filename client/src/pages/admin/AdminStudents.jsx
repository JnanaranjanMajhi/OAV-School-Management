import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, X, Save, Search, Users, Eye, EyeOff, AlertTriangle, KeyRound, Check, GraduationCap, Mail, BookOpen, Hash, Phone, User, UploadCloud, ChevronDown } from 'lucide-react';
import { CLASS_OPTIONS } from '../../utils/constants';
import Modal from '../../components/Modal';

/* ── Confirm Delete Modal ───────────────────────────────── */
function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <AlertTriangle size={26} color="var(--danger)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Delete Student?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{name}</strong>?
            <br />This action cannot be undone.
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

/* ── Reset Password Modal ───────────────────────────────── */
function ResetPwModal({ student, onClose }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleReset = async () => {
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pw)) return toast.error('Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number');
    setSaving(true);
    try {
      await api.put(`/users/${student._id}/reset-password`, { newPassword: pw });
      toast.success('Password reset successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally { setSaving(false); }
  };
  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <Modal title={`Reset Password — ${student.name}`} onClose={onClose}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Set a new password for this student's account. The student should change it after logging in.
      </p>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><KeyRound size={14} /> New Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            style={{ ...inputStyle, paddingRight: '2.5rem' }}
            placeholder="Min 6 characters"
            value={pw}
            onChange={e => setPw(e.target.value)}
          />
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
        <button className="btn btn-primary" onClick={handleReset} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
          {saving ? <div className="spinner-sm spinner" /> : <><KeyRound size={18} /> Reset Password</>}
        </button>
      </div>
    </Modal>
  );
}

/* ── Constants ──────────────────────────────────────────── */
const emptyForm = { name: '', email: '', password: '', phone: '', class: '', rollNumber: '' };

/* ── Main Component ─────────────────────────────────────── */
export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);       // null | 'create' | student-obj (edit)
  const [confirmDel, setConfirmDel] = useState(null); // null | student-obj
  const [resetPw, setResetPw] = useState(null);    // null | student-obj
  const [form, setForm] = useState(emptyForm);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterPending, setFilterPending] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ class: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [deleteBatchModal, setDeleteBatchModal] = useState(false);
  const [deleteBatchClass, setDeleteBatchClass] = useState('');
  const [expandedClasses, setExpandedClasses] = useState({});

  const toggleExpand = (cls) => {
    setExpandedClasses(prev => ({ ...prev, [cls]: !prev[cls] }));
  };

  const load = () => {
    setLoading(true);
    api.get('/users?role=student')
      .then(r => setStudents(r.data.data || []))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  /* ── Open Modals ── */
  const openCreate = () => { setForm(emptyForm); setShowPw(false); setModal('create'); };
  const openEdit = (s) => {
    setForm({
      name: s.name || '',
      email: s.email || '',
      password: '',
      phone: s.phone || '',
      class: s.class || '',
      rollNumber: s.rollNumber || '',
    });
    setShowPw(false);
    setModal(s);
  };

  /* ── Save (Create / Update) ── */
  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim()) return toast.error('Email is required');
    if (modal === 'create' && !form.password) return toast.error('Password is required');
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (modal === 'create' && !passRegex.test(form.password)) return toast.error('Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number');

    if (!form.class) return toast.error('Class is required');
    if (!form.rollNumber.trim()) return toast.error('Roll Number is required');

    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/users', { ...form, role: 'student' });
        toast.success('Student added successfully!');
      } else {
        // Never send password in edit — use reset password modal for that
        const { password, ...updateData } = form;
        await api.put(`/users/${modal._id}`, { ...updateData, role: 'student' });
        toast.success('Student details updated!');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save. Try again.');
    } finally { setSaving(false); }
  };

  const handleDeleteBatch = async (e) => {
    e.preventDefault();
    if (!deleteBatchClass) return toast.error('Class is required');
    if (!window.confirm(`Are you absolutely sure you want to DELETE ALL STUDENTS in ${deleteBatchClass}? This cannot be undone.`)) return;
    
    setUploading(true);
    try {
      const res = await api.delete(`/users/students/class/${deleteBatchClass}`);
      toast.success(res.data.message);
      setDeleteBatchModal(false);
      setDeleteBatchClass('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting class');
    } finally { setUploading(false); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await api.delete(`/users/${confirmDel._id}`);
      toast.success(`${confirmDel.name} deleted`);
      setConfirmDel(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting student');
    }
  };

  /* ── Approve ── */
  const handleApprove = async (s) => {
    try {
      await api.put(`/users/${s._id}/approve`);
      toast.success(`${s.name} approved successfully`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving student');
    }
  };

  const handleApproveAll = async () => {
    const pendingIds = filtered.filter(u => !u.isApproved).map(u => u._id);
    if (pendingIds.length === 0) return toast.error('No pending students to approve');
    setLoading(true);
    try {
      await api.put('/users/approve-bulk', { userIds: pendingIds });
      toast.success(`${pendingIds.length} students approved successfully!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving all students');
      setLoading(false);
    }
  };

  /* ── Bulk Upload ── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.class) return toast.error('Class is required');
    if (!uploadForm.file) return toast.error('File is required');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('class', uploadForm.class);
      formData.append('file', uploadForm.file);
      const res = await api.post('/users/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      setUploadModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading file');
    } finally { setUploading(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  /* ── Filter ── */
  const filtered = students.filter(s => {
    if (filterPending && s.isApproved) return false;
    if (filterClass && s.class !== filterClass) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.rollNumber?.toString().toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isCreate = modal === 'create';

  const groupedStudents = filtered.reduce((acc, student) => {
    const cls = student.class || 'Unassigned';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(student);
    return acc;
  }, {});

  const sortedClasses = Object.keys(groupedStudents).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      {/* Header */}
      <div style={{ marginTop: '1rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(16,185,129,0.15)' }}>
            <GraduationCap size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Students</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              {students.length} student{students.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setDeleteBatchModal(true)} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: 'var(--bg-card)', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <Trash2 size={20} /> Delete Batch
          </button>
          <button className="btn btn-secondary" onClick={() => { setUploadForm({ class: '', file: null }); setUploadModal(true); }} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: 'var(--bg-card)' }}>
            <UploadCloud size={20} /> Upload Students
          </button>
          <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
            <Plus size={20} /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            style={{ ...inputStyle, paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            placeholder="Search by name, email, roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          style={{ ...inputStyle, width: 'auto', minWidth: 160, paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {filterPending && filtered.filter(u => !u.isApproved).length > 0 && (
            <button className="btn" onClick={handleApproveAll} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: 'var(--success)', color: 'white', border: 'none', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
              <Check size={20} /> Approve All Pending
            </button>
          )}
          <button
            className={`btn ${filterPending ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterPending(!filterPending)}
            style={{ whiteSpace: 'nowrap', padding: '0.65rem 1.25rem', fontSize: '1rem', background: filterPending ? 'var(--primary)' : 'var(--bg-input)' }}
          >
            {filterPending ? 'Show All' : 'Show Pending'}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card-elevated">
          <Users size={48} />
          <p>{search || filterClass ? 'No students match your filter.' : 'No students yet. Add one!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedClasses.map(cls => (
            <div key={cls} className="card-elevated" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div 
                onClick={() => toggleExpand(cls)}
                style={{ cursor: 'pointer', padding: '1.25rem 1.5rem', borderBottom: expandedClasses[cls] ? '2px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.03)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{cls}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={15}/> {groupedStudents[cls].length} Students</span>
                  <ChevronDown size={20} style={{ transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)', transform: expandedClasses[cls] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>
              </div>

              <div className={`accordion-grid ${expandedClasses[cls] ? 'expanded' : ''}`}>
                <div className="accordion-inner">
                  <div className="table-wrap" style={{ margin: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '60px' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roll No.</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                      <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedStudents[cls].map((s, idx) => (
                      <tr key={s._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
                              boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
                            }}>
                              {s.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div>{s.name}</div>
                              {!s.isApproved && <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Pending</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{s.email}</td>
                        <td style={{ padding: '1.25rem 1rem', fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text)' }}>{s.rollNumber || '—'}</td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{s.phone || '—'}</td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {!s.isApproved && (
                              <button
                                className="btn btn-sm"
                                onClick={() => handleApprove(s)}
                                title="Approve student"
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEdit(s)}
                              title="Edit student"
                              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setConfirmDel(s)}
                              title="Delete student"
                              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Trash2 size={16} />
                            </button>
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
      )}

      {/* ── Add / Edit Student Modal ── */}
      {modal && (
        <Modal title={isCreate ? 'Add New Student' : `Edit — ${modal.name}`} onClose={() => setModal(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}>
            {/* Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><User size={14} /> Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input style={inputStyle} placeholder="Student's full name" value={form.name} onChange={set('name')} />
            </div>
            {/* Email */}
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Mail size={14} /> Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="email" style={inputStyle} placeholder="student@email.com" value={form.email} onChange={set('email')} />
            </div>
            {/* Password — only for create */}
            {isCreate ? (
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><KeyRound size={14} /> Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={set('password')}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Phone size={14} /> Phone</label>
                <input type="tel" style={inputStyle} placeholder="Mobile number" value={form.phone} onChange={set('phone')} />
              </div>
            )}
            
            {/* Class */}
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><BookOpen size={14} /> Class <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select style={inputStyle} value={form.class} onChange={set('class')}>
                <option value="">Select Class</option>
                {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Roll Number */}
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Hash size={14} /> Roll Number <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input style={inputStyle} placeholder="e.g. 2024001" value={form.rollNumber} onChange={set('rollNumber')} />
            </div>
            {/* Phone (only for create, as edit already has it on the right) */}
            {isCreate ? (
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Phone size={14} /> Phone</label>
                <input type="tel" style={inputStyle} placeholder="Mobile number" value={form.phone} onChange={set('phone')} />
              </div>
            ) : null}
          </div>

          {!isCreate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem',
              fontSize: '0.82rem', color: 'var(--warning)', marginTop: '0.5rem',
            }}>
              <KeyRound size={14} />
              To change this student's password, use the <strong>🔑 key icon</strong> in the table.
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={18} /> {isCreate ? 'Add Student' : 'Save Changes'}</>}
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
          student={resetPw}
          onClose={() => setResetPw(null)}
        />
      )}

      {/* ── Bulk Upload Modal ── */}
      {uploadModal && (
        <Modal title="Upload Students Batch" onClose={() => setUploadModal(false)}>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Class <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select style={inputStyle} value={uploadForm.class} onChange={e => setUploadForm({ ...uploadForm, class: e.target.value })}>
                <option value="">Select Class</option>
                {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Excel / CSV File <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-input)' }}>
                <input type="file" accept=".xlsx, .csv" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} style={{ width: '100%' }} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                Excel files must have columns: <strong>Name, Email</strong>. <br/>
                Optional: <strong>Roll No, Phone</strong>.<br/>
                All uploaded students will automatically be assigned the default password: <code style={{ background: 'var(--bg-input)', padding: '2px 4px', borderRadius: '4px' }}>Student@123</code>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setUploadModal(false)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                {uploading ? <div className="spinner-sm spinner" /> : <><UploadCloud size={18} /> Upload Data</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Bulk Delete Modal ── */}
      {deleteBatchModal && (
        <Modal title="Delete Students Batch" onClose={() => setDeleteBatchModal(false)}>
          <form onSubmit={handleDeleteBatch}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}><AlertTriangle size={16} /> Select Class to Wipe</label>
                <select style={inputStyle} value={deleteBatchClass} onChange={e => setDeleteBatchClass(e.target.value)}>
                  <option value="">Select Class...</option>
                  {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  Warning: This will permanently delete EVERY student profile currently registered in this class. You will not be able to recover them.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteBatchModal(false)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', background: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}>
                {uploading ? <div className="spinner-sm spinner" /> : <><Trash2 size={18} /> Wipe Class</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
