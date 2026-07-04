import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, CheckCircle, XCircle, Clock, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAttendance() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/student/me')
      .then(res => {
        setStats(res.data.data.stats);
        setHistory(res.data.data.history);
      })
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present': return <span className="badge badge-success"><CheckCircle size={12} /> Present</span>;
      case 'Absent': return <span className="badge badge-danger"><XCircle size={12} /> Absent</span>;
      case 'Late': return <span className="badge badge-warning"><Clock size={12} /> Late</span>;
      default: return null;
    }
  };

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">My Attendance</h2>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : !stats ? (
        <div className="empty-state">
          <CheckSquare size={48} />
          <p>Attendance records not found.</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className="card-elevated" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: 'none', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
              <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 10px 20px rgba(79,70,229,0.15))' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(79, 70, 229, 0.08)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={stats.percentage >= 75 ? "var(--success)" : stats.percentage >= 60 ? "var(--warning)" : "var(--danger)"}
                    strokeWidth="3.5"
                    strokeDasharray={`${stats.percentage}, 100`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text)', lineHeight: 1 }}>{stats.percentage}%</span>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Overall Attendance</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card-elevated" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: 'none' }}>
                <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={32} />
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1, color: 'var(--text)' }}>{stats.totalPresent}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dim)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days Present</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
                <div className="card-elevated" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: 'none', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.05, color: 'var(--danger)' }}>
                    <XCircle size={100} />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)' }}>{stats.totalAbsent}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days Absent</div>
                </div>
                
                <div className="card-elevated" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: 'none', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.05, color: 'var(--warning)' }}>
                    <Clock size={100} />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--warning)' }}>{stats.totalLate}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days Late</div>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card-elevated" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: 'none', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.015)' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent History</h3>
            </div>
            
            {history.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No attendance history available.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1.25rem 2rem', fontWeight: 600, color: 'var(--text)' }}>
                          {new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '1.25rem 2rem' }}>{getStatusBadge(record.status)}</td>
                        <td style={{ padding: '1.25rem 2rem', color: 'var(--text-dim)', fontSize: '0.95rem' }}>{record.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
