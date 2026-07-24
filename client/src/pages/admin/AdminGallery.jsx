import { useState, useEffect, useRef } from 'react';
import api, { SERVER_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Image as ImageIcon, Save, AlignLeft, Tag, UploadCloud, X } from 'lucide-react';
import Modal from '../../components/Modal';
import { useConfirm } from '../../context/ConfirmContext';

export default function AdminGallery() {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Gallery');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Gallery');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const load = () => api.get('/gallery').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setCaption(''); setCategory('Gallery'); setFile(null); setPreview(null); setModal(true); };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('video/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith('image/') || f.type.startsWith('video/'))) handleFile(f);
    else toast.error('Please drop an image or video file');
  };

  const handleSave = async () => {
    if (!file) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      if (category) fd.append('category', category);
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Image uploaded!');
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Delete this image?'))) return;
    try { await api.delete(`/gallery/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const filteredItems = items.filter(img => (img.category || 'Gallery') === activeTab);

  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.9rem', transition: 'all 0.2s', width: '100%', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block' };

  return (
    <>
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.08))', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(236,72,153,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: '0 6px 15px rgba(236,72,153,0.15)' }}>
            <ImageIcon size={24} color="#ec4899" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Media & Achievements</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Upload and manage school gallery photos and videos.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}><Plus size={18} /> Upload File</button>
      </div>

      <div style={{ display: 'inline-flex', gap: '0.75rem', marginBottom: '2rem', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '100px', border: '1px solid var(--border-light)' }}>
        <button 
          className="btn"
          onClick={() => setActiveTab('Gallery')}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '100px', background: activeTab === 'Gallery' ? 'var(--primary)' : 'transparent', color: activeTab === 'Gallery' ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 600, transition: 'all 0.2s' }}
        >Photo Gallery</button>
        <button 
          className="btn"
          onClick={() => setActiveTab('Achievement')}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '100px', background: activeTab === 'Achievement' ? 'var(--primary)' : 'transparent', color: activeTab === 'Achievement' ? 'white' : 'var(--text-muted)', border: 'none', fontWeight: 600, transition: 'all 0.2s' }}
        >Achievements</button>
      </div>

      {loading ? <div className="page-center"><div className="spinner" /></div> :
        filteredItems.length === 0 ? <div className="empty-state card-elevated"><ImageIcon size={48} /><p>No {activeTab.toLowerCase()} items yet.</p></div> :
        <div className="gallery-grid">
          {filteredItems.map(img => (
            <div key={img._id} className="gallery-item" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              {img.image?.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={img.image?.startsWith('http') ? img.image : `${SERVER_URL}${img.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={img.image?.startsWith('http') ? img.image : `${SERVER_URL}${img.image}`} alt={img.caption || 'Gallery image'} />
              )}
              <div className="gallery-item-overlay">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                  <div style={{ minWidth: 0 }}>
                    {img.caption && <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>{img.caption}</p>}
                    {img.category && <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>{img.category}</span>}
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(img._id)}
                    style={{ flexShrink: 0, padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <Modal title="Upload Media" onClose={() => setModal(false)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            <div>
              <label style={labelStyle}>Media File</label>
              <div
                onClick={() => !preview && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2.5rem', background: dragOver ? 'rgba(79,70,229,0.05)' : 'var(--bg-input)', border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', cursor: preview ? 'default' : 'pointer', transition: 'all 0.2s', position: 'relative' }}
                onMouseEnter={e => !preview && (e.currentTarget.style.borderColor = 'var(--primary-light)')} 
                onMouseLeave={e => !preview && !dragOver && (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {preview ? (
                  <>
                    {file?.type?.startsWith('video/') ? (
                      <video src={preview} controls style={{ maxHeight: '220px', borderRadius: 'var(--radius-sm)' }} />
                    ) : (
                      <img src={preview} alt="Preview" style={{ maxHeight: '220px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                    )}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}><X size={16} /></div>
                  </>
                ) : (
                  <>
                    <UploadCloud size={44} color="var(--primary-light)" />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Click to browse</span> <span style={{ color: 'var(--text-muted)' }}>or drag and drop</span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>Images (up to 10MB) or Videos (up to 50MB)</div>
                    </div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/ogg" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlignLeft size={14} /> Caption (Optional)</label>
                <input type="text" style={inputStyle} value={caption} onChange={e => setCaption(e.target.value)} placeholder="A short description..." />
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Tag size={14} /> Category</label>
                <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Gallery">Gallery</option>
                  <option value="Achievement">Achievement</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-secondary" onClick={() => setModal(false)} style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', background: 'transparent' }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }}>
              {saving ? <div className="spinner-sm spinner" /> : <><Upload size={18} /> Upload Media</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
