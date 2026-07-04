import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Activity, ChevronDown, ShieldAlert } from 'lucide-react';

const LIMIT = 25;

const roleBadge = {
  admin: 'badge-primary',
  teacher: 'badge-info',
  student: 'badge-secondary',
};

export default function AdminLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = async (skip = 0, append = false) => {
    const setter = append ? setLoadingMore : setLoading;
    setter(true);
    try {
      const r = await api.get(`/logs?limit=${LIMIT}&skip=${skip}`);
      const data = r.data.data || [];
      setLogs(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === LIMIT);
    } catch {
      setHasMore(false);
    } finally { setter(false); }
  };

  useEffect(() => {
    if (user?.email === 'admin1@school.com' || user?.email === 'admin2@school.com') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.email !== 'admin1@school.com' && user?.email !== 'admin2@school.com') {
    return (
      <div className="page-center" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
        <ShieldAlert size={64} color="var(--danger)" />
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--danger)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
          Only the Principal and Vice Principal can view activity logs.
        </p>
      </div>
    );
  }

  const loadMore = () => load(logs.length, true);

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(139,92,246,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79,70,229,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(79,70,229,0.15)' }}>
            <Activity size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Activity Logs</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>System audit and user activity tracking.</p>
          </div>
        </div>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        logs.length === 0 ? <div className="empty-state"><p>No activity logs.</p></div> :
        <>
          <div className="card-elevated" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div className="table-wrap" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-body)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const isCreate = log.action?.includes('CREATE');
                    const isDelete = log.action?.includes('DELETE');
                    const actionColor = isCreate ? '#10b981' : isDelete ? '#ef4444' : 'var(--primary)';
                    return (
                      <tr 
                        key={log._id || i} 
                        style={{ borderBottom: i !== logs.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,70,229,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor }} />
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                              {log.action ? log.action.replace(/_/g, ' ') : '—'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: 'var(--text)' }}>{log.user?.name || log.userName || '—'}</td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span className={`badge ${roleBadge[log.user?.role || log.role] || 'badge-info'}`} style={{ textTransform:'capitalize', fontWeight: 600, padding: '0.35rem 0.75rem' }}>
                            {log.user?.role || log.role || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color:'var(--text-muted)', whiteSpace:'nowrap', fontSize: '0.85rem', fontWeight: 500 }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && (
            <div style={{ display:'flex', justifyContent:'center', marginTop:'1.25rem' }}>
              <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <div className="spinner-sm spinner" /> : <><ChevronDown size={15} /> Load More</>}
              </button>
            </div>
          )}
        </>
      }
    </>
  );
}
