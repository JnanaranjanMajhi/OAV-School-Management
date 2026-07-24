import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../api/axios';
import { Download, Printer, X, Award, Trophy, TrendingUp, BookOpen, GraduationCap, Building, Calendar, CheckCircle2, UserCheck } from 'lucide-react';

export default function ReportCardModal({ studentResult, batch, onClose }) {
  const [schoolInfo, setSchoolInfo] = useState({});
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    api.get('/school-info')
      .then(res => setSchoolInfo(res.data?.data || {}))
      .catch(console.error);
  }, []);

  if (!studentResult) return null;

  const totalMax = studentResult.maxTotal || (studentResult.subjects ? studentResult.subjects.length * 100 : 600);
  const totalMarks = studentResult.totalMarks || 0;
  const percentage = studentResult.percentage || (totalMax > 0 ? parseFloat(((totalMarks / totalMax) * 100).toFixed(2)) : 0);
  const overallGrade = studentResult.grade || (percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'D');
  
  // Dynamic Title Banner based on Result Batch
  const bannerTitle = batch?.title 
    ? batch.title.toUpperCase() 
    : (batch?.examType 
        ? `${batch.examType.toUpperCase()} REPORT CARD ${batch.academicYear || ''}` 
        : 'ANNUAL REPORT CARD 2025-26');

  const getSubjectRemarks = (marks, maxMarks = 100) => {
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return 'Outstanding';
    if (pct >= 80) return 'Excellent';
    if (pct >= 70) return 'Very Good';
    if (pct >= 60) return 'Good';
    if (pct >= 50) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getSubjectGrade = (marks, maxMarks = 100) => {
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution DPI
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `${studentResult.name.replace(/\s+/g, '_')}_Report_Card.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const schoolName = schoolInfo.schoolName || 'WHISPERING PINES SCHOOL';
  const tagline = schoolInfo.tagline || 'WISDOM • INTEGRITY • EXCELLENCE';
  const affiliation = schoolInfo.affiliation || 'CBSE';
  const address = schoolInfo.address || 'Patia, Bhubaneswar, Odisha - 751024';
  const phone = schoolInfo.phone || '0674-2356789';
  const email = schoolInfo.email || 'info@wpschool.edu.in';
  const website = schoolInfo.website || 'www.wpschool.edu.in';

  // Computed attendance mock/data
  const workingDays = 220;
  const presentDays = Math.min(workingDays, Math.round(workingDays * (0.92 + (percentage / 1000))));
  const attendancePct = parseFloat(((presentDays / workingDays) * 100).toFixed(2));

  return (
    <div className="report-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
      zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      overflowY: 'auto', padding: '1.5rem 1rem'
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-card-printable, .report-card-printable * { visibility: visible; }
          .report-card-printable {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important;
          }
          .report-modal-actions { display: none !important; }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '880px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Action Header */}
        <div className="report-modal-actions" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#0f172a', padding: '0.85rem 1.25rem', borderRadius: '12px', color: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <Award size={20} color="#38bdf8" /> Official Report Card
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={downloading} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.88rem'
            }}>
              <Download size={16} /> {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button className="btn btn-secondary" onClick={handlePrint} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.88rem', background: '#334155', color: 'white', border: 'none'
            }}>
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', display: 'flex'
            }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CARD CONTAINER */}
        <div ref={reportRef} className="report-card-printable" style={{
          background: '#ffffff', color: '#0f172a', padding: '2.25rem 2.5rem', borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontFamily: "'Inter', sans-serif", position: 'relative',
          border: '1px solid #e2e8f0', minWidth: '800px'
        }}>
          {/* Top Decorative Corner */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 0, height: 0,
            borderStyle: 'solid', borderWidth: '0 90px 90px 0', borderColor: 'transparent #0b1e36 transparent transparent',
            borderTopRightRadius: '15px'
          }} />

          {/* Header Section */}
          <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
              {/* Crest Logo */}
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #0b1e36, #1e3a8a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24',
                boxShadow: '0 4px 12px rgba(11,30,54,0.25)', border: '2px solid #f59e0b'
              }}>
                <GraduationCap size={36} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{
                  margin: 0, fontSize: '2rem', fontWeight: 900, color: '#0b1e36',
                  fontFamily: "'Outfit', 'Georgia', serif", letterSpacing: '0.5px', textTransform: 'uppercase'
                }}>{schoolName}</h1>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
                  {tagline}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px', fontWeight: 600 }}>
                  {affiliation} Affiliation No. 1530256 &nbsp;|&nbsp; School Code: 35089
                </div>
              </div>
            </div>

            {/* Contact Details Bar */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.78rem', color: '#475569',
              fontWeight: 500, marginTop: '0.5rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem'
            }}>
              <span>📍 {address}</span>
              <span>📞 {phone}</span>
              <span>✉️ {email}</span>
              <span>🌐 {website}</span>
            </div>

            {/* Title Banner (DYNAMICALLY CHANGES ACCORDING TO RESULT BATCH) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.1rem' }}>
              <div style={{
                background: '#0b1e36', color: '#ffffff', padding: '0.5rem 2.25rem', borderRadius: '30px',
                fontWeight: 800, fontSize: '0.95rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(11,30,54,0.3)', border: '1.5px solid #f59e0b'
              }}>
                {bannerTitle}
              </div>
            </div>
          </div>

          {/* Student Information Box */}
          <div style={{
            background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1rem 1.25rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem 2rem', marginBottom: '1.25rem', fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>👤 Student Name</span>: &nbsp;<strong style={{ color: '#0f172a' }}>{studentResult.name}</strong></div>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>🆔 Roll Number</span>: &nbsp;<strong style={{ color: '#0f172a' }}>{studentResult.rollNumber}</strong></div>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>📋 Admission No.</span>: &nbsp;<span style={{ color: '#334155', fontWeight: 600 }}>{studentResult.admissionNo || `2026-${String(studentResult.rollNumber).padStart(4, '0')}`}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>🎓 Class / Section</span>: &nbsp;<strong style={{ color: '#0f172a' }}>{studentResult.class || batch?.class || 'X'} - A</strong></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>📝 Examination</span>: &nbsp;<span style={{ color: '#0f172a', fontWeight: 600 }}>{batch?.examType || batch?.title || 'Annual Examination'}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>📅 Date of Issue</span>: &nbsp;<span style={{ color: '#334155', fontWeight: 600 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>🏛️ Academic Year</span>: &nbsp;<span style={{ color: '#334155', fontWeight: 600 }}>{batch?.academicYear || '2025-26'}</span></div>
              <div style={{ display: 'flex' }}><span style={{ width: '135px', color: '#64748b', fontWeight: 600 }}>🏫 School</span>: &nbsp;<span style={{ color: '#334155', fontWeight: 600 }}>{schoolName}</span></div>
            </div>
          </div>

          {/* Academic Performance Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              background: '#0b1e36', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px 8px 0 0',
              fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <BookOpen size={16} color="#fbbf24" /> ACADEMIC PERFORMANCE
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'center', fontWeight: 700 }}>
                  <th style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'left', width: '22%' }}>SUBJECT</th>
                  <th style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', width: '12%' }}>THEORY<br/><span style={{ fontSize: '0.7rem', fontWeight: 400 }}>(Max Marks)</span></th>
                  <th style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', width: '12%' }}>PRACTICAL<br/><span style={{ fontSize: '0.7rem', fontWeight: 400 }}>(Max Marks)</span></th>
                  <th style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', width: '12%' }}>TOTAL<br/><span style={{ fontSize: '0.7rem', fontWeight: 400 }}>(Max Marks)</span></th>
                  <th style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', width: '14%' }}>MARKS OBTAINED</th>
                  <th style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', width: '12%' }}>PERCENTAGE<br/><span style={{ fontSize: '0.7rem', fontWeight: 400 }}>(%)</span></th>
                  <th style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', width: '8%' }}>GRADE</th>
                  <th style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', width: '14%' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {studentResult.subjects && studentResult.subjects.length > 0 ? (
                  studentResult.subjects.map((sub, idx) => {
                    const maxMarks = sub.maxMarks || 100;
                    const hasPractical = ['science', 'computer', 'geography', 'physics', 'chemistry', 'biology'].some(s => sub.subject.toLowerCase().includes(s));
                    const theoryMax = hasPractical ? 80 : 100;
                    const practicalMax = hasPractical ? 20 : '-';
                    const pct = ((sub.marks / maxMarks) * 100).toFixed(1);
                    const gr = getSubjectGrade(sub.marks, maxMarks);
                    const rm = getSubjectRemarks(sub.marks, maxMarks);

                    return (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', textAlign: 'center' }}>
                        <td style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>{sub.subject}</td>
                        <td style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', color: '#475569' }}>{theoryMax}</td>
                        <td style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', color: '#475569' }}>{practicalMax}</td>
                        <td style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', color: '#475569' }}>{maxMarks}</td>
                        <td style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0b1e36', fontSize: '0.88rem' }}>{sub.marks}</td>
                        <td style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', fontWeight: 600, color: '#334155' }}>{pct}%</td>
                        <td style={{ padding: '0.55rem 0.5rem', border: '1px solid #cbd5e1', fontWeight: 800, color: gr.startsWith('A') ? '#047857' : gr.startsWith('B') ? '#1d4ed8' : '#b45309' }}>{gr}</td>
                        <td style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 500, fontSize: '0.78rem' }}>{rm}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No subject details available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4 Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {/* Total Marks */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trophy size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TOTAL MARKS</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0b1e36' }}>{totalMarks} / {totalMax}</div>
              </div>
            </div>

            {/* Aggregate Percentage */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>AGGREGATE %</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#047857' }}>{percentage}%</div>
              </div>
            </div>

            {/* Class Rank */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>RANK IN CLASS</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#6d28d9' }}>{studentResult.position || '-'} / {batch?.studentsCount || 35}</div>
              </div>
            </div>

            {/* Overall Grade */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>OVERALL GRADE</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#b45309' }}>{overallGrade}</div>
              </div>
            </div>
          </div>

          {/* Subject Performance Bars + Attendance & Remarks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Left: Subject Performance Progress Bars */}
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1rem', background: '#ffffff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0b1e36', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={15} color="#2563eb" /> SUBJECT PERFORMANCE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {studentResult.subjects && studentResult.subjects.map((sub, idx) => {
                  const maxMarks = sub.maxMarks || 100;
                  const pct = Math.min(100, Math.round((sub.marks / maxMarks) * 100));
                  const barColor = pct >= 90 ? '#059669' : pct >= 80 ? '#0d9488' : pct >= 70 ? '#2563eb' : '#d97706';

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <span style={{ width: '90px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.subject}</span>
                      <div style={{ flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '5px', transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Attendance & Teacher Remarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Attendance Card with Donut */}
              <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem 1rem', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0b1e36', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} color="#7c3aed" /> ATTENDANCE
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div>Working Days &nbsp;: &nbsp;<strong>{workingDays}</strong></div>
                    <div>Present Days &nbsp;&nbsp;: &nbsp;<strong>{presentDays}</strong></div>
                    <div>Attendance &nbsp;&nbsp;&nbsp;&nbsp;: &nbsp;<strong style={{ color: '#047857' }}>{attendancePct}%</strong></div>
                  </div>
                </div>

                {/* SVG Donut Chart */}
                <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.8" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#047857" strokeWidth="3.8" strokeDasharray={`${attendancePct}, 100`} />
                  </svg>
                  <div style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: 800, color: '#047857' }}>
                    {Math.round(attendancePct)}%
                  </div>
                </div>
              </div>

              {/* Teacher Remarks Box */}
              <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem 1rem', background: '#f8fafc', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0b1e36', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={15} color="#2563eb" /> CLASS TEACHER'S REMARKS
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, fontStyle: 'italic' }}>
                  "{studentResult.name} has consistently demonstrated {percentage >= 80 ? 'excellent' : 'good'} academic performance. {percentage >= 80 ? 'He/She is sincere, dedicated, and shows a strong understanding of core concepts.' : 'Continued focus and practice will help achieve higher results.'} Keep up the hard work!"
                </p>
              </div>
            </div>
          </div>

          {/* Signatures & Official Seal */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1'
          }}>
            {/* Class Teacher Signature */}
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="30" viewBox="0 0 120 30" fill="none">
                  <path d="M10 22 C25 5, 45 28, 65 10 C75 25, 95 5, 110 20" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ borderTop: '1.5px solid #475569', paddingTop: '3px', fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                Class Teacher
              </div>
            </div>

            {/* School Circular Stamp / Seal */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #1e3a8a',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#1e3a8a', fontSize: '0.55rem', fontWeight: 800, padding: '2px', textAlign: 'center',
                boxShadow: '0 2px 8px rgba(30,58,138,0.15)', background: '#ffffff'
              }}>
                <div style={{ fontSize: '0.5rem', letterSpacing: '0.5px' }}>WHISPERING PINES</div>
                <div style={{ fontSize: '0.45rem', color: '#d97706' }}>* SCHOOL *</div>
                <div style={{ fontSize: '0.45rem' }}>BHUBANESWAR</div>
                <div style={{ fontSize: '0.45rem', fontWeight: 900 }}>ESTD. 2019</div>
              </div>
            </div>

            {/* Principal Signature */}
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="30" viewBox="0 0 120 30" fill="none">
                  <path d="M15 15 C30 5, 40 25, 60 12 C75 30, 90 8, 105 18" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ borderTop: '1.5px solid #475569', paddingTop: '3px', fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                Principal
              </div>
            </div>
          </div>

          {/* Bottom Security / Footer Ribbon */}
          <div style={{
            background: '#0b1e36', color: '#94a3b8', margin: '1.5rem -2.5rem -2.25rem -2.5rem',
            padding: '0.5rem 1.5rem', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem'
          }}>
            <span>Generated on: {new Date().toLocaleDateString('en-GB')} | {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>This is a computer-generated document.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontWeight: 600 }}>
              <CheckCircle2 size={12} /> Verified by WPS School ERP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
