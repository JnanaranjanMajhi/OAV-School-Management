import { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../api/axios';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { GraduationCap, BookOpen, Users, Trophy, Calendar, ChevronRight, Star, ChevronLeft, Play, Monitor, Building, Award } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const defaultGalleryImages = [
  { src: '/Image_1.jpg', alt: 'Whispering Pines School - Flag Ceremony' },
  { src: '/Image_2.jpg', alt: 'Whispering Pines School - Campus View' },
  { src: '/Image_3.jpg', alt: 'Whispering Pines School - Activities' },
];

export default function HomePage() {
  usePageTitle('Home');
  const [showVideo, setShowVideo] = useState(false);
  const [info, setInfo] = useState({});
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [galleryImages, setGalleryImages] = useState(defaultGalleryImages);

  useEffect(() => {
    Promise.all([
      api.get('/school-info'),
      api.get('/events?upcoming=true'),
      api.get('/announcements'),
      api.get('/gallery')
    ])
      .then(([infoRes, eventsRes, annRes, galleryRes]) => {
        setInfo(infoRes.data?.data || {});
        setEvents(eventsRes.data?.data || []);
        setAnnouncements(annRes.data?.data || []);

        if (galleryRes.data?.data?.length > 0) {
          const fetchedImages = galleryRes.data.data.map(item => ({
            src: `${SERVER_URL}${item.image}`,
            alt: item.caption || 'OAV Gallery Image'
          }));
          setGalleryImages(fetchedImages);
        }
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Auto-rotate gallery carousel
  useEffect(() => {
    const timer = setInterval(() => setGalleryIdx(i => (i + 1) % galleryImages.length), 5000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const nextSlide = useCallback(() => setGalleryIdx(i => (i + 1) % galleryImages.length), [galleryImages.length]);
  const prevSlide = useCallback(() => setGalleryIdx(i => (i - 1 + galleryImages.length) % galleryImages.length), [galleryImages.length]);

  return (
    <div>
      <Navbar />
      <main>
        {/* Hero with Static Image */}
        <section className="hero" style={{ position: 'relative' }}>
          {/* Background image */}
          <div
            className="hero-slide active"
            style={{ backgroundImage: `url(/School.jpg)` }}
          />
          <div className="hero-overlay" />

          <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="hero-content">

              <h1>
                Shaping <span className="text-primary">Tomorrow's</span><br />Leaders Today
              </h1>
              <p className="hero-desc">Inspiring Excellence. Building Character. Empowering Future Leaders through quality residential education under the Government of Odisha.</p>
              <div className="hero-actions">
                <Link to="/results" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={18} /> Check Results
                </Link>

              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Building size={24} /></div>
                  <div>
                    <div className="stat-value">{info.establishedYear || '2020'}</div>
                    <div className="stat-label">ESTABLISHED</div>
                  </div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}><GraduationCap size={24} /></div>
                  <div>
                    <div className="stat-value">{info.affiliation || 'CBSE'}</div>
                    <div className="stat-label">AFFILIATED</div>
                  </div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}><Users size={24} /></div>
                  <div>
                    <div className="stat-value">1000+</div>
                    <div className="stat-label">STUDENTS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wave-divider">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path d="M0,0 C320,120 420,120 720,60 C1020,0 1120,0 1440,60 L1440,120 L0,120 Z" fill="currentColor"></path>
            </svg>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="section why-choose-section">
          <div className="container">
            <div className="why-choose-layout">
              <div className="why-choose-text">
                <div className="hero-badge" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                  <Star size={14} /> Why Choose Whispering Pines School?
                </div>
                <h2>Nurturing <span className="text-primary">Excellence.</span><br />Building Futures.</h2>
                <p>We provide an environment that fosters learning, leadership, and lifelong values.</p>
              </div>
              <div className="why-choose-grid">
                <div className="why-card">
                  <div className="why-icon" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}><BookOpen size={24} /></div>
                  <h3>Academic Excellence</h3>
                  <p>Quality education with a focus on conceptual understanding and real-world learning.</p>
                </div>
                <div className="why-card">
                  <div className="why-icon" style={{ color: '#a855f7', background: 'rgba(168,85,247,0.1)' }}><Users size={24} /></div>
                  <h3>Experienced Faculty</h3>
                  <p>Dedicated teachers committed to shaping bright and responsible citizens.</p>
                </div>
                <div className="why-card">
                  <div className="why-icon" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}><Building size={24} /></div>
                  <h3>Residential Campus</h3>
                  <p>Safe, secure, and disciplined environment for holistic student development.</p>
                </div>
                <div className="why-card">
                  <div className="why-icon" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}><Award size={24} /></div>
                  <h3>All-Round Growth</h3>
                  <p>Encouraging sports, culture, and co-curricular activities for overall personality development.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* School Video Section */}
        <section className="section section-dark">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="section-tag">🎬 Campus Life</div>
              <h2>Experience Our Vidyalaya</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: 500, margin: '0.5rem auto 0' }}>A glimpse into the vibrant life at Odisha Adarsha Vidyalaya, Balarampur</p>
            </div>
            <div className="video-showcase">
              {!showVideo ? (
                <div className="video-poster" onClick={() => setShowVideo(true)}>
                  <img src="/Image_2.jpg" alt="School campus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="video-play-btn">
                    <Play size={32} fill="white" color="white" />
                  </div>
                  <div className="video-poster-overlay">
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>▶ Watch School Tour</span>
                  </div>
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                >
                  <source src="/Video_1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </section>

        {/* Photo Gallery Strip */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="section-tag">📸 Gallery</div>
              <h2>Moments & Memories</h2>
            </div>
            <div className="gallery-carousel-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: '450px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className={`gallery-slide${i === galleryIdx ? ' active' : ''}`}
                  style={{ backgroundImage: `url(${img.src})` }}
                >
                  <div className="gallery-slide-caption">
                    <h3>{img.alt}</h3>
                  </div>
                </div>
              ))}

              {/* Carousel controls */}
              <button className="gallery-nav gallery-nav-prev" onClick={prevSlide} aria-label="Previous slide">
                <ChevronLeft size={24} />
              </button>
              <button className="gallery-nav gallery-nav-next" onClick={nextSlide} aria-label="Next slide">
                <ChevronRight size={24} />
              </button>

              <div className="gallery-dots">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    className={`gallery-dot${i === galleryIdx ? ' active' : ''}`}
                    onClick={() => setGalleryIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/gallery" className="btn btn-secondary">View Full Gallery <ChevronRight size={14} /></Link>
            </div>
          </div>
        </section>

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="section section-dark">
            <div className="container">
              <div className="section-header">
                <div>
                  <div className="section-tag">📢 Latest</div>
                  <h2>Announcements</h2>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {announcements.map(a => (
                  <div key={a._id} className={`announce-card${a.isPinned ? ' pinned' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{a.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.body}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        {a.isPinned && <span className="badge badge-warning">📌 Pinned</span>}
                        <span className="badge badge-info">{a.targetRole}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Principal's Message */}
        {info.principalMessage && (
          <section className="section">
            <div className="container">
              <div className="principal-message-card">
                <div className="quote-icon-bg">”</div>
                <div className="principal-photo-wrapper">
                  <div className="principal-photo-inner">
                    {info.principalPhoto ? <img src={info.principalPhoto.startsWith('http') ? info.principalPhoto : `${SERVER_URL}${info.principalPhoto}`} alt="Principal" /> : <GraduationCap size={50} color="white" />}
                  </div>
                  <div className="principal-identity">
                    <h4>{info.principalName || 'Principal'}</h4>
                    <span>Principal</span>
                  </div>
                </div>
                <div className="principal-text-wrapper">
                  <div className="section-tag">Message from Principal</div>
                  <h2 style={{ marginBottom: '1.5rem' }}>A Word from Our Principal</h2>
                  <p>
                    "{info.principalMessage}"
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <section className="section section-dark">
            <div className="container">
              <div className="section-header">
                <div>
                  <div className="section-tag">📅 Upcoming</div>
                  <h2>School Events</h2>
                </div>
              </div>
              <div className="grid grid-2" style={{ display: 'grid' }}>
                {events.map(ev => (
                  <div key={ev._id} className="card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center', minWidth: 52 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>{new Date(ev.date).getDate()}</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{new Date(ev.date).toLocaleString('en', { month: 'short' })}</div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{ev.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ev.description?.slice(0, 100)}</p>
                        {ev.location && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>📍 {ev.location}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-tag">Quick Access</div>
              <h2>Student Services</h2>
            </div>
            <div className="grid grid-3" style={{ display: 'grid' }}>
              {[
                { icon: BookOpen, label: 'Check Results', desc: 'View your subject-wise marks', to: '/results', color: '#4f46e5' },
                { icon: Users, label: 'Teachers', desc: 'Meet our faculty members', to: '/teachers', color: '#06b6d4' },

                { icon: Trophy, label: 'Downloads', desc: 'Syllabus, forms & notices', to: '/downloads', color: '#f59e0b' },
              ].map(({ icon: Icon, label, desc, to, color }) => (
                <Link key={to} to={to} className="card quick-link-card" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{label}</h3>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer info={info} />
    </div>
  );
}
