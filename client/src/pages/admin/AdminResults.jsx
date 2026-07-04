import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, ClipboardList, PlusCircle, MinusCircle, UploadCloud, Edit2, User, Hash, BookOpen, Layers, Type, Calendar, File as FileIcon, Users, ChevronDown } from 'lucide-react';
import Modal from '../../components/Modal';
import { CLASS_OPTIONS as CLASSES, SUBJECTS_BY_CLASS } from '../../utils/constants';
import { useConfirm } from '../../context/ConfirmContext';


const emptySubject = () => ({ id: Date.now() + Math.random(), name: '', marks: '', totalMarks: '100' });
const emptyForm = { studentName: '', rollNumber: '', class: '', examName: '', subjects: [emptySubject()] };

const currentYear = new Date().getFullYear();
const DEFAULT_ACADEMIC_YEAR = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
const ACADEMIC_YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear - 3 + i;
  return `${year}-${(year + 1).toString().slice(-2)}`;
});

function calcPercentage(subjects) {
  const valid = subjects.filter(s => s.marks !== '' && s.totalMarks !== '');
  if (valid.length === 0) return 0;
  const totalMarks = valid.reduce((sum, s) => sum + Number(s.marks), 0);
  const totalMax = valid.reduce((sum, s) => sum + Number(s.totalMarks), 0);
  return totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;
}

function calcGrade(pct) {
  const p = Number(pct);
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C';
  if (p >= 40) return 'D';
  return 'F';
}

const gradeBadge = (grade) => {
  const map = { 'A+': 'badge-success', 'A': 'badge-success', 'B+': 'badge-primary', 'B': 'badge-primary', 'C': 'badge-info', 'D': 'badge-warning', 'F': 'badge-danger' };
  return <span className={`badge ${map[grade] || 'badge-info'}`}>{grade}</span>;
};

export default function AdminResults() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: '', class: '', examType: '', academicYear: DEFAULT_ACADEMIC_YEAR, file: null });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [filterClass, setFilterClass] = useState('All');

  const load = () => api.get('/results').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  const loadStudents = () => api.get('/users?role=student').then(r => setStudents(r.data.data || []));
  useEffect(() => { load(); loadStudents(); }, []);

  const toggleBatch = (key) => setExpandedBatches(p => ({ ...p, [key]: !p[key] }));

  const openCreate = () => { setForm({ ...emptyForm, subjects: [emptySubject()] }); setEditId(null); setModal(true); };
  const openEdit = (r) => {
    setForm({
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      class: r.class,
      examName: r.examName,
      subjects: (r.subjects && r.subjects.length > 0) ? r.subjects.map(s => ({ ...s, id: Date.now() + Math.random() })) : [emptySubject()]
    });
    setEditId(r._id);
    setModal(true);
  };
  const openUpload = () => { setUploadForm({ title: '', class: '', examType: '', academicYear: DEFAULT_ACADEMIC_YEAR, file: null }); setUploadModal(true); };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleClassChange = (e) => {
    const cls = e.target.value;
    setForm(p => {
      const newForm = { ...p, class: cls };
      if (!editId && SUBJECTS_BY_CLASS[cls]) {
        newForm.subjects = SUBJECTS_BY_CLASS[cls].map(name => ({ id: Date.now() + Math.random(), name, marks: '', totalMarks: '100' }));
      }
      return newForm;
    });
  };

  const handleStudentSelect = (e, field) => {
    const val = e.target.value;
    setForm(p => {
      const newForm = { ...p, [field]: val };
      const match = students.find(s => (field === 'rollNumber' && s.rollNumber === val) || (field === 'studentName' && s.name === val));
      if (match) {
        newForm.studentName = match.name;
        newForm.rollNumber = match.rollNumber || p.rollNumber;
        const newClass = match.class || p.class;
        newForm.class = newClass;
        
        if (!editId && newClass && SUBJECTS_BY_CLASS[newClass]) {
          newForm.subjects = SUBJECTS_BY_CLASS[newClass].map(name => ({ id: Date.now() + Math.random(), name, marks: '', totalMarks: '100' }));
        }
      }
      return newForm;
    });
  };

  const setSubject = (idx, key, value) => {
    setForm(p => {
      const subjects = [...p.subjects];
      subjects[idx] = { ...subjects[idx], [key]: value };
      return { ...p, subjects };
    });
  };

  const addSubject = () => setForm(p => ({ ...p, subjects: [...p.subjects, emptySubject()] }));
  const removeSubject = (idx) => {
    if (form.subjects.length <= 1) return;
    setForm(p => ({ ...p, subjects: p.subjects.filter((_, i) => i !== idx) }));
  };

  const percentage = calcPercentage(form.subjects);
  const grade = calcGrade(percentage);

  const handleSave = async () => {
    if (!form.studentName || !form.rollNumber || !form.class || !form.examName) {
      toast.error('Please fill all required fields'); return;
    }
    const validSubjects = form.subjects.filter(s => s.name && s.marks !== '' && s.totalMarks !== '');
    if (validSubjects.length === 0) {
      toast.error('Add at least one subject with marks'); return;
    }
    
    // Check for invalid marks
    for (const s of validSubjects) {
      if (Number(s.marks) > Number(s.totalMarks)) {
        toast.error(`Marks for ${s.name} cannot exceed max marks (${s.totalMarks})`);
        return;
      }
    }
    setSaving(true);
    try {
      const data = {
        studentName: form.studentName,
        rollNumber: form.rollNumber,
        class: form.class,
        examName: form.examName,
        subjects: validSubjects.map(s => ({ name: s.name, marks: Number(s.marks), totalMarks: Number(s.totalMarks) })),
        percentage: Number(percentage),
        grade,
      };
      if (editId) {
        await api.put(`/results/${editId}`, data);
        toast.success('Result updated!');
      } else {
        await api.post('/results', data);
        toast.success('Result added!');
      }
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    } finally { setSaving(false); }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.class || !uploadForm.examType || !uploadForm.academicYear || !uploadForm.file) {
      toast.error('Please fill all fields and select a file'); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('class', uploadForm.class);
      formData.append('examType', uploadForm.examType);
      formData.append('academicYear', uploadForm.academicYear);
      formData.append('file', uploadForm.file);

      const r = await api.post('/results/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(r.data.message || 'Results uploaded successfully!');
      setUploadModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading results');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Delete this result?'))) return;
    try { await api.delete(`/results/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  const filteredItems = items.filter(item => filterClass === 'All' || item.class === filterClass);

  const groupedBatches = Object.values(
    filteredItems.reduce((acc, item) => {
      const isManual = !item.batchId || (item.batchTitle && (item.batchTitle.includes('Manual Entries') || item.batchTitle.includes(' - ')));
      const key = isManual ? `Manual-${item.class}-${item.examName}-${item.academicYear}` : item.batchId;
      
      if (!acc[key]) {
        acc[key] = {
          batchIds: new Set(),
          title: isManual ? `${item.examName} (${item.class}) - Manual Entries` : (item.batchTitle || `${item.examName} (${item.class})`),
          class: item.class,
          examName: item.examName,
          academicYear: item.academicYear || new Date().getFullYear().toString(),
          students: []
        };
      }
      if (item.batchId) acc[key].batchIds.add(item.batchId);
      acc[key].students.push(item);
      return acc;
    }, {})
  ).sort((a, b) => b.academicYear.localeCompare(a.academicYear) || a.class.localeCompare(b.class));

  const handleDeleteBatch = async (batchIdsSet) => {
    if (!(await confirmAction('Delete ALL results in this group?'))) return;
    try {
      const ids = Array.from(batchIdsSet);
      await Promise.all(ids.map(id => api.delete(`/results/${id}`)));
      toast.success('Batch deleted');
      load();
    } catch {
      toast.error('Error deleting batch');
    }
  };

  return (
    <>
      <style>{`
        .accordion-grid { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .accordion-grid.expanded { grid-template-rows: 1fr; }
        .accordion-inner { overflow: hidden; }
      `}</style>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(16,185,129,0.15)' }}>
            <ClipboardList size={24} color="#10b981" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Student Results</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Manage grades, marks, and academic performance.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={filterClass} 
            onChange={e => setFilterClass(e.target.value)}
            style={{ ...inputStyle, padding: '0.65rem 1rem', width: 'auto', minWidth: '130px', background: 'var(--bg-card)' }}
          >
            <option value="All">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={openUpload} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', background: 'var(--bg-card)' }}><UploadCloud size={18} /> Upload Batch</button>
          <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}><Plus size={18} /> Add Result</button>
        </div>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        groupedBatches.length === 0 ? <div className="empty-state card-elevated"><ClipboardList size={48} /><p>No results yet.</p></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {groupedBatches.map((batch, batchIdx) => {
            const batchKey = `${batch.class}-${batch.examName}-${batch.academicYear}`;
            const isExpanded = expandedBatches[batchKey] !== false;
            return (
            <div key={batch.batchId || batchIdx} className="card-elevated" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              
              <div 
                onClick={() => toggleBatch(batchKey)}
                style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', cursor: 'pointer', background: 'linear-gradient(90deg, rgba(16,185,129,0.05), transparent)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <Layers size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{batch.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={12} /> {batch.examName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {batch.academicYear}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {batch.students.length} Students</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {batch.batchIds.size > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.batchIds); }} style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)', background: 'transparent', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} title="Delete entire batch group">
                      <Trash2 size={14} /> Delete Batch
                    </button>
                  )}
                  <ChevronDown size={18} style={{ transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className={`accordion-grid ${isExpanded ? 'expanded' : ''}`}>
                <div className="accordion-inner">
                  <div className="table-wrap" style={{ margin: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', background: 'var(--bg-input)' }}>
                          <th style={{ textAlign: 'left', padding: '0.8rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                          <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roll No.</th>
                          <th style={{ textAlign: 'left', padding: '0.8rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance</th>
                          <th style={{ textAlign: 'right', padding: '0.8rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batch.students.map(r => (
                          <tr key={r._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{r.studentName}</td>
                            <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.rollNumber}</td>
                            <td style={{ padding: '1rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: Number(r.percentage) >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                                  {r.percentage}%
                                </span>
                                {gradeBadge(r.grade)}
                              </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)} style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}><Edit2 size={14} /></button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)} style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}><Trash2 size={14} /></button>
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
          );
        })}
        </div>
      }

      {modal && (
        <Modal title={editId ? "Edit Result" : "Add Result"} onClose={() => setModal(false)} wide>
          <datalist id="student-names">
            {students.map(s => <option key={s._id} value={s.name} />)}
          </datalist>
          <datalist id="roll-numbers">
            {students.map(s => s.rollNumber && <option key={s._id} value={s.rollNumber} />)}
          </datalist>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><User size={12} /> Student Name</label>
              <input style={inputStyle} list="student-names" value={form.studentName} onChange={e => handleStudentSelect(e, 'studentName')} placeholder="Full name or search..." />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Hash size={12} /> Roll Number</label>
              <input style={inputStyle} list="roll-numbers" value={form.rollNumber} onChange={e => handleStudentSelect(e, 'rollNumber')} placeholder="Roll no. or search..." />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Layers size={12} /> Class</label>
              <select style={inputStyle} value={form.class} onChange={handleClassChange}>
                <option value="">Select class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><BookOpen size={12} /> Exam Name</label>
              <select style={inputStyle} value={form.examName} onChange={set('examName')}>
                <option value="">Select Exam</option>
                <option value="Annual Exam">Annual Exam</option>
                <option value="Half-Yearly Exam">Half-Yearly Exam</option>
                <option value="Mid-Term Exam">Mid-Term Exam</option>
                <option value="Quarterly Exam">Quarterly Exam</option>
                <option value="Unit Test 1">Unit Test 1</option>
                <option value="Unit Test 2">Unit Test 2</option>
                <option value="Unit Test 3">Unit Test 3</option>
                <option value="Unit Test 4">Unit Test 4</option>
                <option value="Pre-Board Exam">Pre-Board Exam</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Subjects</label>
              <button className="btn btn-secondary btn-sm" onClick={addSubject} style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}><PlusCircle size={14} /> Add Subject</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {form.subjects.map((s, i) => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-input)', padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <input
                    style={{ ...inputStyle, background: 'var(--bg-card)', padding: '0.4rem 0.75rem' }}
                    value={s.name}
                    onChange={e => setSubject(i, 'name', e.target.value)}
                    placeholder="Subject Name"
                  />
                  <input
                    style={{ ...inputStyle, background: 'var(--bg-card)', padding: '0.4rem 0.75rem' }}
                    type="number"
                    value={s.marks}
                    onChange={e => setSubject(i, 'marks', e.target.value)}
                    placeholder="Marks"
                  />
                  <input
                    style={{ ...inputStyle, background: 'var(--bg-card)', padding: '0.4rem 0.75rem' }}
                    type="number"
                    value={s.totalMarks}
                    onChange={e => setSubject(i, 'totalMarks', e.target.value)}
                    placeholder="Total"
                  />
                  <button
                    onClick={() => removeSubject(i)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: form.subjects.length <= 1 ? 'var(--text-dim)' : 'var(--danger)', cursor: form.subjects.length <= 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                    disabled={form.subjects.length <= 1}
                  >
                    <MinusCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(16,185,129,0.1)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Percentage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: Number(percentage) >= 50 ? 'var(--success)' : 'var(--danger)' }}>{percentage}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Final Grade</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{grade}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(false)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Save size={16} /> Save Result</>}
            </button>
          </div>
        </Modal>
      )}

      {uploadModal && (
        <Modal title="Upload Result Batch" onClose={() => setUploadModal(false)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', padding: '0.25rem 0' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Type size={12} /> Batch Title</label>
              <input style={inputStyle} value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="e.g. Class 10 Annual Results 2026" />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Layers size={12} /> Class</label>
              <select style={inputStyle} value={uploadForm.class} onChange={e => setUploadForm({ ...uploadForm, class: e.target.value })}>
                <option value="">Select class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><BookOpen size={12} /> Exam Type</label>
              <select style={inputStyle} value={uploadForm.examType} onChange={e => setUploadForm({ ...uploadForm, examType: e.target.value })}>
                <option value="">Select Exam</option>
                <option value="Annual Exam">Annual Exam</option>
                <option value="Half-Yearly Exam">Half-Yearly Exam</option>
                <option value="Mid-Term Exam">Mid-Term Exam</option>
                <option value="Quarterly Exam">Quarterly Exam</option>
                <option value="Unit Test 1">Unit Test 1</option>
                <option value="Unit Test 2">Unit Test 2</option>
                <option value="Unit Test 3">Unit Test 3</option>
                <option value="Unit Test 4">Unit Test 4</option>
                <option value="Pre-Board Exam">Pre-Board Exam</option>
              </select>
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Calendar size={12} /> Academic Year</label>
              <select style={inputStyle} value={uploadForm.academicYear} onChange={e => setUploadForm({ ...uploadForm, academicYear: e.target.value })}>
                <option value="">Select Year</option>
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
              <label style={{ ...labelStyle, display: 'flex', gap: '0.4rem', alignItems: 'center' }}><FileIcon size={12} /> Upload Data File (.xlsx, .csv)</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '50%', border: '1px solid var(--border-light)' }}>
                  <UploadCloud size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.1rem', fontSize: '0.9rem' }}>Choose File</div>
                  <div style={{ fontSize: '0.8rem', color: uploadForm.file ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {uploadForm.file ? uploadForm.file.name : 'Excel or CSV format'}
                  </div>
                </div>
                <input type="file" style={{ display: 'none' }} accept=".xlsx,.xls,.csv,.pdf" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem', background: 'rgba(59,130,246,0.05)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <strong>Tip:</strong> Excel files must have headers: <code>Name</code>, <code>Roll Number</code>, and then subjects (e.g., <code>Math</code>, <code>Science</code>).
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setUploadModal(false)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(79,70,229,0.3)' }}>
              {uploading ? <div className="spinner-sm spinner" /> : <><UploadCloud size={16} /> Process Batch</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
