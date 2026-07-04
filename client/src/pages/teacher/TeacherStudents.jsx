import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { Search, Users } from 'lucide-react';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    api.get('/users?role=student').then(r => setStudents(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const classList = useMemo(() => {
    const set = new Set(students.map(s => s.class).filter(Boolean));
    return [...set].sort();
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchesClass = !classFilter || s.class === classFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || s.name?.toLowerCase().includes(q) || s.rollNumber?.toString().includes(q) || s.guardianName?.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [students, search, classFilter]);

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(16,185,129,0.15)' }}>
            <Users size={24} color="#10b981" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Student List</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>View and manage your students.</p>
          </div>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>{filtered.length} students</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="form-input"
            placeholder="Search by name, roll number, or guardian..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
        <select
          className="form-input"
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          style={{ flex: '0 1 180px' }}
        >
          <option value="">All Classes</option>
          {classList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        filtered.length === 0 ? <div className="empty-state"><p>{students.length === 0 ? 'No students found.' : 'No matching students.'}</p></div> :
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Roll No</th>
                <th>Guardian</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-primary">{s.class || '—'}</span></td>
                  <td>{s.rollNumber || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.guardianName || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </>
  );
}
