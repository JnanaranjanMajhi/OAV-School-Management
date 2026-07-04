import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { SERVER_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import { Save, User, Camera, Mail, Phone, Book } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

export default function StudentProfile() {
  usePageTitle('My Profile');
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      const { data } = await api.put('/users/update-profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser(data.data);
      toast.success('Profile updated successfully');
      setPhoto(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 800, padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <User color="var(--primary)" size={28} /> My Profile
      </h2>

      <div className="card-elevated" style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)', border: '4px solid var(--border)' }}>
                {photo ? (
                  <img src={URL.createObjectURL(photo)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : user?.photo ? (
                  <img src={user.photo.startsWith('http') ? user.photo : `${SERVER_URL}${user.photo}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={48} color="var(--text-muted)" />
                  </div>
                )}
              </div>
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
                <Camera size={20} />
                <input type="file" hidden accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
              </label>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{user?.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Book size={16} /> Class {user?.class} | Roll: {user?.rollNumber}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> {user?.email}
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  className="form-input" 
                  style={{ paddingLeft: '2.75rem' }}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Bio (Optional)</label>
              <textarea 
                className="form-input" 
                rows={4}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Write a short bio about yourself..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
