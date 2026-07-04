import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Search, Trophy, User, GraduationCap, CreditCard, ShieldCheck, Zap, BarChart3, HeadphonesIcon, FileSearch } from 'lucide-react';
import toast from 'react-hot-toast';
import { CLASS_OPTIONS } from '../../utils/constants';

export default function ResultSearchPage() {
  const [form, setForm] = useState({ name: '', class: '', roll: '' });
  const [info, setInfo] = useState({});
  const [results, setResults] = useState([]);
  const [positions, setPositions] = useState([]);
  const [tab, setTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [posClass, setPosClass] = useState('');
  const [posLoading, setPosLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => { api.get('/school-info').then(r => setInfo(r.data.data || {})); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ name: form.name, class: form.class, roll: form.roll });
      const r = await api.get(`/results/search?${params}`);
      setResults(r.data.data || []);
    } catch (err) {
      setResults([]);
      toast.error(err.response?.data?.message || 'No results found');
    } finally { setLoading(false); }
  };

  const fetchPositions = async () => {
    if (!posClass) return toast.error('Enter a class');
    setPosLoading(true);
    try {
      const r = await api.get(`/results/positions?class=${posClass}`);
      setPositions(r.data.data || []);
    } catch {
      setPositions([]);
      toast.error('No position data found for this class');
    } finally { setPosLoading(false); }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ paddingTop: 120, flex: 1, position: 'relative' }}>
        
        {/* Background Image Header */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '55%', 
          height: '450px',
          backgroundImage: 'url(/Image_2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to right, transparent, black 40%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)',
          opacity: 0.9,
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '4rem 0 2rem' }}>
          <div className="container">
            <h1>Check Your <span className="gradient-text">Results</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px' }}>Enter your details to fetch your subject-wise marks.</p>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button onClick={() => setTab('search')} className={`btn ${tab === 'search' ? 'btn-primary' : ''}`} style={tab !== 'search' ? { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' } : { boxShadow: '0 8px 20px rgba(79,70,229,0.25)' }}><Search size={16} /> Search Result</button>
              <button onClick={() => setTab('position')} className={`btn ${tab === 'position' ? 'btn-primary' : ''}`} style={tab !== 'position' ? { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' } : { boxShadow: '0 8px 20px rgba(79,70,229,0.25)' }}><Trophy size={16} /> Class Position</button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '1rem 1.5rem 4rem', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* Left Column: Dynamic Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {tab === 'search' && (
                <>
                  <div className="card-elevated" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <FileSearch size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Find Your Result</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Please enter your details below to view your result.</div>
                      </div>
                    </div>

                    <form onSubmit={handleSearch}>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}><User size={15} /> Student Name</label>
                        <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }} />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}><GraduationCap size={15} /> Class</label>
                        <select className="form-input" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} required style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }}>
                          <option value="">Select Class</option>
                          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}><CreditCard size={15} /> Roll Number</label>
                        <input className="form-input" placeholder="e.g. 2024001" value={form.roll} onChange={e => setForm({ ...form, roll: e.target.value })} required style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }} />
                      </div>

                      <button type="submit" className="btn w-full" style={{ justifyContent: 'center', padding: '0.9rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1rem', boxShadow: '0 10px 25px rgba(79,70,229,0.3)' }} disabled={loading}>
                        {loading ? <div className="spinner-sm spinner" /> : <><Search size={18} /> Search Result</>}
                      </button>
                    </form>
                  </div>
                  
                  {/* Results Display */}
                  {searched && results.length === 0 && !loading && (
                    <div className="alert alert-error">No results found. Check your name, class, and roll number.</div>
                  )}

                  {results.map((r, i) => (
                    <div key={i} className="result-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                      <div className="result-header" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.05), rgba(79,70,229,0.02))', padding: '2rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem', color: 'var(--primary)', fontWeight: 600 }}>{r.examType} · {r.academicYear}</div>
                        <h3 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>{r.student.name}</h3>
                        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>Class {r.student.class} · Roll {r.student.rollNumber}</div>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--primary)' }}>{r.student.totalMarks}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Total Marks</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent)' }}>{r.student.percentage}%</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Percentage</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit' }}>{r.student.grade}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Grade</div>
                          </div>
                          {r.student.position && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#f59e0b' }}>#{r.student.position}</div>
                              <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Position</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="result-body" style={{ padding: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>SUBJECT-WISE MARKS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {r.student.subjects?.map((sub, j) => (
                            <div key={j} className="subject-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{sub.subject}</div>
                                <div className="marks-bar" style={{ width: '100%', maxWidth: '200px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div className="marks-fill" style={{ width: `${(sub.marks / sub.maxMarks) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '3px' }} />
                                </div>
                              </div>
                              <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{sub.marks}<span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 500 }}>/{sub.maxMarks}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {tab === 'position' && (
                <div className="card-elevated" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                      <Trophy size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Class Rankings</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a class to view the top performers.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                    <select className="form-input" value={posClass} onChange={e => setPosClass(e.target.value)} style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button className="btn" onClick={fetchPositions} disabled={posLoading} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                      {posLoading ? <div className="spinner-sm spinner" /> : <><Trophy size={16} /> Get Rankings</>}
                    </button>
                  </div>
                  
                  {positions.length > 0 && (
                    <div className="table-wrap" style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <tr>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>#</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Name</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Roll No</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '1rem' }}><span className="badge badge-primary">#{p.position}</span></td>
                              <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
                              <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.rollNumber}</td>
                              <td style={{ padding: '1rem' }}><span className={`badge ${p.grade === 'A+' ? 'badge-success' : p.grade === 'F' ? 'badge-danger' : 'badge-info'}`}>{p.grade}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {positions.length === 0 && posClass && !posLoading && searched && (
                     <div className="alert alert-info">No rankings available yet.</div>
                  )}
                </div>
              )}

              {/* Need Help Banner (Left Column Bottom) */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  <HeadphonesIcon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.1rem' }}>Need help?</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact your class teacher or school admin.</div>
                </div>
              </div>

            </div>

            {/* Right Column: Information Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
                  <Trophy size={36} />
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Excellence in Every Step</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                  Stay updated with your academic performance. Your hard work drives your success.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>Secure & Reliable</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your data is safe with us</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0 }}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>Instant Results</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get your results in seconds</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>Accurate Information</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trusted by students & parents</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer info={info} />
    </div>
  );
}
