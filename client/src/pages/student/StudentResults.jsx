import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Trophy, TrendingUp, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { generateReportCardPDF } from '../../utils/pdfGenerator';

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedResultId, setExpandedResultId] = useState(0);

  useEffect(() => {
    api.get('/school-info').then(r => setSchoolInfo(r.data.data || {})).catch(() => {});
    if (!user) return;
    const params = new URLSearchParams();
    if (user.name) params.append('name', user.name);
    if (user.rollNumber) params.append('roll', user.rollNumber);
    if (user.class) params.append('class', user.class);

    api.get(`/results/search?${params.toString()}`)
      .then((r) => setResults(r.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not fetch results.'))
      .finally(() => setLoading(false));
  }, [user]);

  //   const getGradeColor = (percentage) => {
  //     if (percentage >= 90) return 'var(--success)';
  //     if (percentage >= 75) return 'var(--primary-light)';
  //     if (percentage >= 60) return 'var(--accent)';
  //     if (percentage >= 40) return 'var(--warning)';
  //     return 'var(--danger)';
  //   };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const generatePDF = (result) => {
    generateReportCardPDF(result, schoolInfo);
  };

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">My Results</h2>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : error ? (
        <div className="empty-state">
          <FileSpreadsheet size={48} />
          <p style={{ marginTop: '0.5rem' }}>{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <FileSpreadsheet size={48} />
          <p>No results found for your profile.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
            Results will appear here once published by your teacher.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.map((result, idx) => {
            const studentData = result.student || {};
            const subjects = studentData.subjects || [];
            const totalMarks = subjects.reduce((sum, s) => sum + (s.marks || 0), 0);
            const totalMax = subjects.reduce((sum, s) => sum + (s.maxMarks || s.totalMarks || 100), 0);
            const overallPct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
            const isExpanded = expandedResultId === idx;

            return (
              <div
                key={studentData._id || idx}
                className="card-elevated"
                style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: 'none', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => setExpandedResultId(isExpanded ? null : idx)}
              >
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '1.5rem', color: 'white', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '0.2rem' }}>
                        {result.examType || 'Examination'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.2rem', fontSize: '0.85rem', opacity: 0.9 }}>
                        <span>Class {result.class || user?.class || '—'}</span>
                        <span>Roll: {studentData.rollNumber || user?.rollNumber || '—'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDF(result, overallPct, totalMarks, totalMax);
                        }}
                        className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'white', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                      >
                        <Download size={16} /> Download PDF
                      </button>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '100px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1 }}>{totalMarks}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Marks</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '100px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1 }}>{overallPct}%</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Percentage</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '100px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1 }}>{getGrade(overallPct)}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Grade</div>
                    </div>
                    {studentData.position && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.2)', backdropFilter: 'blur(10px)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '100px', border: '1px solid rgba(245,158,11,0.4)' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1, color: '#fbbf24' }}>#{studentData.position}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fbbf24', fontWeight: 600 }}>Class Rank</div>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>Subject-wise Marks</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {subjects.map((sub, idx) => {
                        const max = sub.totalMarks || 100;
                        const pct = max > 0 ? Math.round((sub.marks / max) * 100) : 0;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, paddingRight: '2rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>{sub.subject || sub.name}</div>
                              <div style={{ width: '100%', maxWidth: '250px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '3px' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', fontFamily: 'Outfit' }}>
                                {sub.marks}<span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>/{max}</span>
                              </div>
                              <span className={`badge ${pct >= 75 ? 'badge-success' : pct >= 40 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', fontWeight: 700 }}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
