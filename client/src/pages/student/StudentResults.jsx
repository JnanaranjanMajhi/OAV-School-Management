import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Trophy, TrendingUp, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedResultId, setExpandedResultId] = useState(0);

  useEffect(() => {
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

  const generatePDF = async (result, overallPct, totalMarks, totalMax) => {
    // Lazy-load PDF libraries only when the user clicks download
    const { jsPDF } = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Primary color
    doc.text('OAV Balarampur', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Official Student Report Card', 105, 28, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Student Info
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`Student Name: ${user?.name || '—'}`, 20, 45);
    doc.text(`Class: ${result.class || user?.class || '—'}`, 20, 53);
    doc.text(`Roll Number: ${result.student?.rollNumber || user?.rollNumber || '—'}`, 120, 45);
    doc.text(`Examination: ${result.examType || 'Terminal Examination'}`, 120, 53);
    
    // Table
    const tableColumn = ["Subject", "Max Marks", "Marks Obtained", "Percentage", "Grade"];
    const tableRows = [];
    
    const subjects = result.student?.subjects || [];
    subjects.forEach(sub => {
      const max = sub.totalMarks || sub.maxMarks || 100;
      const mark = sub.marks || 0;
      const pct = max > 0 ? Math.round((mark / max) * 100) : 0;
      
      tableRows.push([
        sub.subject || sub.name,
        max.toString(),
        mark.toString(),
        `${pct}%`,
        getGrade(pct)
      ]);
    });

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 6 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Summary Box
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setDrawColor(79, 70, 229);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, finalY, 170, 30, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`Total Marks: ${totalMarks} / ${totalMax}`, 30, finalY + 12);
    doc.text(`Aggregate Percentage: ${overallPct}%`, 30, finalY + 22);
    
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`Overall Grade: ${getGrade(overallPct)}`, 130, finalY + 17);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated document. No signature is required.', 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`OAV_ReportCard_${user?.name?.replace(/\s+/g, '_') || 'Student'}.pdf`);
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
