import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Save, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

export default function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Data
  const [isSaved, setIsSaved] = useState(false);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });

  const updateStats = (currentRecords) => {
    const present = currentRecords.filter(r => r.status === 'Present').length;
    const absent = currentRecords.filter(r => r.status === 'Absent').length;
    const late = currentRecords.filter(r => r.status === 'Late').length;
    setStats({ present, absent, late });
  };

  const loadAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/class/${selectedClass}?date=${selectedDate}`);
      setRecords(data.data.records);
      setIsSaved(data.data.isSaved);
      updateStats(data.data.records);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleClassChange = (e) => {
    if (isDirty && !window.confirm('You have unsaved changes. Change class anyway?')) {
      return;
    }
    setIsDirty(false);
    setSelectedClass(e.target.value);
  };

  const handleDateChange = (e) => {
    if (isDirty && !window.confirm('You have unsaved changes. Change date anyway?')) {
      return;
    }
    setIsDirty(false);
    setSelectedDate(e.target.value);
  };


  const handleStatusChange = (studentId, newStatus) => {
    const updated = records.map(r => r.studentId === studentId ? { ...r, status: newStatus } : r);
    setRecords(updated);
    updateStats(updated);
    setIsDirty(true);
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecords(records.map(r => r.studentId === studentId ? { ...r, remarks } : r));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    const updated = records.map(r => ({ ...r, status: 'Present' }));
    setRecords(updated);
    updateStats(updated);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return toast.error('Select class and date first');
    setSaving(true);
    try {
      await api.post('/attendance', {
        date: selectedDate,
        class: selectedClass,
        records
      });
      toast.success('Attendance saved successfully');
      setIsSaved(true);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(16,185,129,0.15)' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Class Attendance</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Mark daily attendance for your students</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || records.length === 0} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: '30px', fontWeight: 600, boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
          {saving ? <div className="spinner-sm spinner" /> : <><Save size={16} /> {isSaved ? 'Update Attendance' : 'Save Attendance'}</>}
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> Date
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={selectedDate} 
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> Class
            </label>
            <select 
              className="form-input" 
              value={selectedClass} 
              onChange={handleClassChange}
            >
              <option value="">Select a Class...</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11 Science">Class 11 Science</option>
              <option value="Class 12 Science">Class 12 Science</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : !selectedClass ? (
        <div className="empty-state">
          <Users size={48} />
          <p>Please select a class to view and mark attendance.</p>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>No students found in {selectedClass}.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ color: 'var(--success)' }}><CheckCircle size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>{stats.present}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Present</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ color: 'var(--danger)' }}><XCircle size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)', lineHeight: 1 }}>{stats.absent}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Absent</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ color: 'var(--warning)' }}><Clock size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning)', lineHeight: 1 }}>{stats.late}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Late</div>
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem' }}>Student List</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleMarkAllPresent}>Mark All Present</button>
                {isSaved && <span className="badge badge-success">Previously Saved</span>}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {records.map((student) => (
                  <tr key={student.studentId}>
                    <td style={{ color: 'var(--text-dim)', width: '100px' }}>{student.rollNumber}</td>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td style={{ textAlign: 'center', width: '320px' }}>
                      <div style={{ display: 'inline-flex', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '0.25rem', border: '1px solid var(--border)' }}>
                        <button 
                          className={`btn btn-sm ${student.status === 'Present' ? 'btn-primary' : ''}`}
                          style={{ background: student.status === 'Present' ? 'var(--success)' : 'transparent', color: student.status === 'Present' ? '#fff' : 'var(--text-muted)', border: 'none', boxShadow: 'none' }}
                          onClick={() => handleStatusChange(student.studentId, 'Present')}
                        >
                          Present
                        </button>
                        <button 
                          className={`btn btn-sm ${student.status === 'Absent' ? 'btn-primary' : ''}`}
                          style={{ background: student.status === 'Absent' ? 'var(--danger)' : 'transparent', color: student.status === 'Absent' ? '#fff' : 'var(--text-muted)', border: 'none', boxShadow: 'none' }}
                          onClick={() => handleStatusChange(student.studentId, 'Absent')}
                        >
                          Absent
                        </button>
                        <button 
                          className={`btn btn-sm ${student.status === 'Late' ? 'btn-primary' : ''}`}
                          style={{ background: student.status === 'Late' ? 'var(--warning)' : 'transparent', color: student.status === 'Late' ? '#fff' : 'var(--text-muted)', border: 'none', boxShadow: 'none' }}
                          onClick={() => handleStatusChange(student.studentId, 'Late')}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Note..." 
                        value={student.remarks}
                        onChange={e => handleRemarksChange(student.studentId, e.target.value)}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
