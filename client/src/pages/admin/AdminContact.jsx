import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Save, MapPin, Phone, Mail, Globe, Map, Building2, Navigation } from 'lucide-react';

export default function AdminContact() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/school-info').then(r => setForm(r.data.data || {})).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/school-info', {
        address: form.address,
        city: form.city,
        state: form.state,
        phone: form.phone,
        altPhone: form.altPhone,
        email: form.email,
        website: form.website,
        mapEmbedUrl: form.mapEmbedUrl,
      });
      toast.success('Contact info updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <><div className="page-center"><div className="spinner" /></div></>;

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', gap: '0.5rem', alignItems: 'center' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(234,88,12,0.08), rgba(245,158,11,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(234,88,12,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(234,88,12,0.15)' }}>
            <Phone size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Contact Information</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Update the school's address, phone, and online presence.</p>
          </div>
        </div>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(234,88,12,0.3)' }}>
          {saving ? <div className="spinner-sm spinner" /> : <><Save size={20} /> Save Changes</>}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
          {/* Address */}
          <div className="card-elevated" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}><MapPin size={20} color="var(--primary)" /> Address</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}><Navigation size={14} /> Street Address</label>
                <input style={inputStyle} value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Enter full address" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}><Building2 size={14} /> City</label>
                  <input style={inputStyle} value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="e.g. Bhubaneswar" />
                </div>
                <div>
                  <label style={labelStyle}><Map size={14} /> State</label>
                  <input style={inputStyle} value={form.state || ''} onChange={e => set('state', e.target.value)} placeholder="e.g. Odisha" />
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="card-elevated" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}><Phone size={20} color="var(--primary)" /> Phone Numbers</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}><Phone size={14} /> Primary Phone</label>
                <input style={inputStyle} value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label style={labelStyle}><Phone size={14} /> Alternate Phone</label>
                <input style={inputStyle} value={form.altPhone || ''} onChange={e => set('altPhone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          </div>

          {/* Email & Website */}
          <div className="card-elevated" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}><Globe size={20} color="var(--primary)" /> Email & Website</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}><Mail size={14} /> Email</label>
                <input type="email" style={inputStyle} value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="school@example.com" />
              </div>
              <div>
                <label style={labelStyle}><Globe size={14} /> Website</label>
                <input type="url" style={inputStyle} value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://www.example.com" />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card-elevated" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}><Map size={20} color="var(--primary)" /> Map Location</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}><MapPin size={14} /> Google Maps Embed URL</label>
                <input style={inputStyle} value={form.mapEmbedUrl || ''} onChange={e => set('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
              </div>
              {form.mapEmbedUrl && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <iframe
                    src={form.mapEmbedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0, display: 'block', filter: 'var(--map-filter)', transition: 'filter 0.3s ease' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="School Location"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
