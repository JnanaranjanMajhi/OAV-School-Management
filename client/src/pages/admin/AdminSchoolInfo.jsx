import { useState, useEffect } from 'react';
import { SERVER_URL } from '../../api/axios';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Save, Upload, Settings, BookOpen, Phone, UserCircle } from 'lucide-react';

export default function AdminSchoolInfo() {
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/school-info').then(r => setForm(r.data.data || {})).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // eslint-disable-next-line no-unused-vars
      const { _id, __v, createdAt, updatedAt, principalPhoto, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null) fd.append(k, JSON.stringify(v));
        else if (v !== undefined) fd.append(k, v);
      });
      if (photo) fd.append('principalPhoto', photo);
      const res = await api.put('/school-info', fd);
      setForm(res.data.data);
      setPhoto(null);
      toast.success('School info updated!');
    } catch (err) {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <><div className="page-center"><div className="spinner" /></div></>;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
//   const setSocial = (k, v) => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(16,185,129,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79,70,229,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(79,70,229,0.15)' }}>
            <Settings size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>School Settings</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Manage your institution's core details, contact info, and principal's message.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>

        {/* Basic Details */}
        <div className="card-elevated" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(79,70,229,0.1)', borderRadius: 'var(--radius-sm)' }}>
              <BookOpen size={20} color="var(--primary)" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Basic Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>School Name</label>
              <input style={inputStyle} value={form.schoolName || ''} onChange={e => set('schoolName', e.target.value)} placeholder="E.g., Odisha Adarsha Vidyalaya" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="E.g., Excellence in Education" />
            </div>
            <div>
              <label style={labelStyle}>Established Year</label>
              <input style={inputStyle} value={form.establishedYear || ''} onChange={e => set('establishedYear', e.target.value)} placeholder="E.g., 2016" />
            </div>
            <div>
              <label style={labelStyle}>Affiliation</label>
              <input style={inputStyle} value={form.affiliation || ''} onChange={e => set('affiliation', e.target.value)} placeholder="E.g., BSE Odisha" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Overview</label>
              <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} value={form.overview || ''} onChange={e => set('overview', e.target.value)} placeholder="Write a short overview of the school..."></textarea>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card-elevated" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-sm)' }}>
              <Phone size={20} color="#10b981" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Contact Information</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.address || ''} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city || ''} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input style={inputStyle} value={form.state || ''} onChange={e => set('state', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} value={form.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Map Embed URL (iframe src)</label>
              <input style={inputStyle} value={form.mapEmbedUrl || ''} onChange={e => set('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
            </div>
          </div>
        </div>

        {/* Principal's Desk */}
        <div className="card-elevated" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-sm)' }}>
              <UserCircle size={20} color="#f59e0b" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Principal's Desk</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Principal Name</label>
              <input style={inputStyle} value={form.principalName || ''} onChange={e => set('principalName', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Update Photo</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-input)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {form.principalPhoto ? (
                    <img src={`${SERVER_URL}${form.principalPhoto}`} alt="Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle size={24} color="var(--text-muted)" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ flex: 1, padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Message</label>
              <textarea style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} value={form.principalMessage || ''} onChange={e => set('principalMessage', e.target.value)}></textarea>
            </div>
            <div>
              <label style={labelStyle}>Qualification</label>
              <input style={inputStyle} value={form.principalQualification || ''} onChange={e => set('principalQualification', e.target.value)} placeholder="e.g. M.Sc, B.Ed" />
            </div>
            <div>
              <label style={labelStyle}>Experience</label>
              <input style={inputStyle} value={form.principalExperience || ''} onChange={e => set('principalExperience', e.target.value)} placeholder="e.g. 15+ Years" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Achievements</label>
              <input style={inputStyle} value={form.principalAchievements || ''} onChange={e => set('principalAchievements', e.target.value)} placeholder="e.g. State Awardee" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Biography (Bio)</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.principalBio || ''} onChange={e => set('principalBio', e.target.value)} placeholder="A short biography..."></textarea>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="card-elevated" style={{ padding: '1.5rem 2.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>Ready to save?</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Double check your information before publishing.</div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}>
            {saving ? <div className="spinner-sm spinner" /> : <><Save size={20} /> Save Changes</>}
          </button>
        </div>
      </form>
    </>
  );
}