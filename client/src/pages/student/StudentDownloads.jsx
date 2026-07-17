import { useState, useEffect } from 'react';
import { SERVER_URL } from '../../api/axios';
import api from '../../api/axios';
import { Download, FolderOpen, FileText, ExternalLink, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const categoryColors = {
  'syllabus':    { bg: 'rgba(79,70,229,0.1)',   border: 'rgba(79,70,229,0.2)',   color: '#6366f1'  },
  'assignment':  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  color: '#10b981'  },
  'notes':       { bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',   color: '#06b6d4'  },
  'question':    { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  color: '#f59e0b'  },
  'circular':    { bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.2)',  color: '#ec4899'  },
  'other':       { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  color: '#8b5cf6'  },
};

const getCatStyle = (cat) =>
  categoryColors[cat?.toLowerCase()] || categoryColors.other;

export default function StudentDownloads() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const clsParam = user?.class ? `?class=${encodeURIComponent(user.class)}` : '';
    api.get(`/downloads${clsParam}`)
      .then((r) => setDownloads(r.data.data || []))
      .catch(() => setDownloads([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const categories = ['all', ...new Set(downloads.map((d) => d.category || 'Other'))];

  let filtered = filter === 'all'
    ? downloads
    : downloads.filter((d) => (d.category || 'Other') === filter);

  if (search.trim()) {
    filtered = filtered.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || (d.description && d.description.toLowerCase().includes(search.toLowerCase())));
  }

  const grouped = filtered.reduce((acc, d) => {
    const cat = d.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});

  return (
    <>
      <div className="section-header" style={{ marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="section-title">Study Materials & Downloads</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>Access your syllabus, notes, assignments, and more.</p>
        </div>
        
        {/* Search bar */}
        {!loading && downloads.length > 0 && (
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : downloads.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '4rem 2rem', border: 'none', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Download size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Files Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no downloads available for your class at the moment.</p>
        </div>
      ) : (
        <>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isActive = filter === cat;
              const catStyle = cat === 'all' ? { color: 'var(--primary)', bg: 'rgba(79,70,229,0.1)' } : getCatStyle(cat);
              
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '30px',
                    border: `1px solid ${isActive ? catStyle.color : 'transparent'}`,
                    background: isActive ? catStyle.color : 'var(--bg-card)',
                    color: isActive ? '#fff' : 'var(--text)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? `0 4px 12px ${catStyle.bg}` : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = catStyle.bg;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grouped Files List */}
          {Object.keys(grouped).length === 0 ? (
             <div className="empty-state">
              <p>No files match your search criteria.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              const catStyle = getCatStyle(category);
              return (
                <div key={category} style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-light)' }}>
                    <div style={{ background: catStyle.bg, padding: '0.5rem', borderRadius: '10px' }}>
                      <FolderOpen size={20} color={catStyle.color} />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text)', fontFamily: 'Outfit' }}>{category}</h3>
                    <span style={{ 
                      background: 'var(--bg-card)', 
                      color: 'var(--text-dim)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {items.length} files
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {items.map((dl) => (
                      <div 
                        key={dl._id} 
                        className="card-elevated"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '1.25rem',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid var(--border-light)`,
                          transition: 'all 0.2s',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = `0 10px 25px ${catStyle.bg}`;
                          e.currentTarget.style.borderColor = catStyle.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                        }}
                      >
                        {/* Decorative top accent */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: catStyle.color }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div style={{ background: catStyle.bg, color: catStyle.color, padding: '0.6rem', borderRadius: '10px', flexShrink: 0 }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, marginBottom: '0.25rem' }}>{dl.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                              <Calendar size={10} />
                              {dl.createdAt ? new Date(dl.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </div>
                          </div>
                        </div>

                        {dl.description && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                            {dl.description.length > 90 ? dl.description.slice(0, 90) + '...' : dl.description}
                          </p>
                        )}
                        {!dl.description && <div style={{ flex: 1, marginBottom: '1.25rem' }} />}

                        <div style={{ marginTop: 'auto' }}>
                          {dl.fileUrl ? (
                            <a
                              href={`${SERVER_URL}/api/downloads/download/${dl._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                background: catStyle.color,
                                color: 'white',
                                padding: '0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'opacity 0.2s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                              <Download size={16} /> Download File
                            </a>
                          ) : dl.link ? (
                            <a
                              href={dl.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                background: 'var(--bg-input)',
                                color: 'var(--text)',
                                padding: '0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                border: '1px solid var(--border)',
                                transition: 'background 0.2s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                            >
                              <ExternalLink size={16} /> Open Link
                            </a>
                          ) : (
                            <div style={{ padding: '0.6rem', textAlign: 'center', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                              Not Available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </>
  );
}
