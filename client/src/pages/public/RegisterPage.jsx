import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Eye, EyeOff, UserPlus, Users, BookOpen,
  User, Mail, Lock, Phone, Hash, BookMarked, Award, Clock,
  CheckCircle2, Send, ArrowRight, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

import { CLASS_OPTIONS as CLASSES, SUBJECT_OPTIONS as SUBJECTS } from '../../utils/constants';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP States
  const [emailState, setEmailState] = useState('idle'); // 'idle' | 'sent' | 'verified'
  const [emailOtp, setEmailOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(null); // 'email' | null
  const [verifyingOtp, setVerifyingOtp] = useState(null); // 'email' | null
  const [emailTimer, setEmailTimer] = useState(0);

  useEffect(() => {
    if (emailTimer > 0) {
      const timer = setTimeout(() => setEmailTimer(emailTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailTimer]);

  useEffect(() => {
    if (!user) {
      // Ping backend to wake it up from cold start (Render free tier)
      api.get('/school-info').catch(() => {});
    }
  }, [user]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    class: '',
    rollNumber: '',
    subject: '',
    qualification: '',
    experience: '',
  });

  // Redirect already-logged-in users (must be in useEffect, not render body)
  useEffect(() => {
    if (user) {
      const path = user.role === 'admin' ? '/admin/dashboard'
        : user.role === 'teacher' ? '/teacher/dashboard'
        : '/student/dashboard';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // ---- OTP Handlers ----
  const handleSendOtp = async (type) => {
    const identifier = type === 'email' ? form.email : form.phone;
    if (!identifier) return toast.error(`Please enter your ${type} first`);
    
    // Basic format validation
    if (type === 'email' && !identifier.includes('@')) return toast.error('Please enter a valid email address');
    if (type === 'phone' && identifier.length < 10) return toast.error('Please enter a valid phone number');

    setSendingOtp(type);
    try {
      const res = await api.post('/auth/send-otp', { type, identifier, purpose: 'register' });
      toast.success(res.data.message || `OTP sent to your ${type}`);
      if (type === 'email') { setEmailState('sent'); setEmailTimer(60); }
      if (type === 'phone') { setPhoneState('sent'); setPhoneTimer(60); }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to send OTP`);
    } finally {
      setSendingOtp(null);
    }
  };

  const handleVerifyOtp = async (type) => {
    const identifier = type === 'email' ? form.email : form.phone;
    const otp = type === 'email' ? emailOtp : phoneOtp;
    
    if (!otp || otp.length !== 6) return toast.error('Please enter the 6-digit OTP');

    setVerifyingOtp(type);
    try {
      const res = await api.post('/auth/verify-otp', { type, identifier, otp });
      toast.success(res.data.message || `${type} verified successfully!`);
      if (type === 'email') setEmailState('verified');
      if (type === 'phone') setPhoneState('verified');
    } catch (err) {
      toast.error(err.response?.data?.message || `Invalid OTP`);
    } finally {
      setVerifyingOtp(null);
    }
  };

  // ---- Submit Handler ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (emailState !== 'verified') {
        return toast.error('Please verify your email address before continuing.');
      }
      setStep(2);
      return;
    }

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        phone: form.phone.trim(),
      };
      if (role === 'student') {
        payload.class = form.class;
        payload.rollNumber = form.rollNumber.trim();
      } else {
        payload.subject = form.subject;
        payload.qualification = form.qualification.trim();
        payload.experience = form.experience.trim();
      }

      const res = await register(payload);
      toast.success(res.message || 'Account created successfully! Please wait for admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      {/* Top Left Header */}
      <div className="login-header">
        <Link to="/" className="login-logo-link">
          <img src="/logo.jpg" alt="Logo" />
          <div className="login-logo-text">
            <div className="title">OAV Balarampur</div>
            <div className="subtitle">Odisha Adarsha Vidyalaya</div>
          </div>
        </Link>
      </div>



      <div className="login-container">
        <div className="login-card" style={{ maxWidth: '600px', padding: '2.5rem' }}>
          <div className="login-logo-center-wrapper">
            <div className="login-logo-glow"></div>
            <img src="/logo.jpg" alt="OAV Logo" className="login-logo-center" />
          </div>
          
          <div className="login-titles">
            <h1>Create Account</h1>
            <p>Join the OAV Balarampur Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

          {/* Role Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.25rem',
            marginBottom: '1.5rem',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: '10px',
            padding: '0.35rem',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            {[
              { val: 'student', icon: Users, label: 'I\'m a Student' },
              { val: 'teacher', icon: BookOpen, label: 'I\'m a Teacher' },
            ].map(({ val, icon: Icon, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setRole(val)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  background: role === val ? 'var(--primary)' : 'transparent',
                  color: role === val ? 'white' : 'var(--text-muted)',
                  boxShadow: role === val ? '0 2px 10px rgba(79,70,229,0.3)' : 'none',
                  transform: role === val ? 'scale(1)' : 'scale(0.98)'
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
            {/* Name */}
            <div className="login-field">
              <label>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="login-input-wrapper">
                <User className="icon-left" size={18} />
                <input
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
            </div>

            {/* Email with OTP verification */}
            <div className="login-field">
              <label>Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                <div className="login-input-wrapper" style={{ flex: 1 }}>
                  <Mail className="icon-left" size={18} />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => {
                      set('email')(e);
                      if (emailState !== 'idle') setEmailState('idle'); // Reset verification if email changes
                    }}
                    disabled={emailState === 'verified'}
                    required
                  />
                </div>
                {emailState === 'idle' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSendOtp('email')}
                    disabled={sendingOtp === 'email' || !form.email}
                    style={{ minWidth: '110px' }}
                  >
                    {sendingOtp === 'email' ? <div className="spinner-sm spinner" /> : <><Send size={14} /> Send OTP</>}
                  </button>
                )}
                {emailState === 'verified' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', padding: '0 0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} /> Verified
                  </div>
                )}
              </div>
              
              {emailState === 'sent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(79,70,229,0.05)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="login-input-wrapper" style={{ flex: 1 }}>
                      <Lock className="icon-left" size={18} />
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleVerifyOtp('email')}
                      disabled={verifyingOtp === 'email' || emailOtp.length !== 6}
                      style={{ height: '46px' }}
                    >
                      {verifyingOtp === 'email' ? <div className="spinner-sm spinner" /> : 'Verify'}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                    {emailTimer > 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>Resend OTP in {emailTimer}s</span>
                    ) : (
                      <button type="button" onClick={() => handleSendOtp('email')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, padding: 0 }} disabled={sendingOtp === 'email'}>
                        {sendingOtp === 'email' ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

              {/* Role-specific fields */}
            {role === 'student' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="login-field">
                    <label>Class <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div className="login-input-wrapper">
                      <BookMarked className="icon-left" size={18} />
                      <select value={form.class} onChange={set('class')} required>
                        <option value="">Select class</option>
                        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="login-field">
                    <label>Roll Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div className="login-input-wrapper">
                      <Hash className="icon-left" size={18} />
                      <input
                        placeholder="e.g. 2024001"
                        value={form.rollNumber}
                        onChange={set('rollNumber')}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="login-field">
                  <label>Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div className="login-input-wrapper">
                    <BookOpen className="icon-left" size={18} />
                    <select value={form.subject} onChange={set('subject')} required>
                      <option value="">Select your subject</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="login-field">
                    <label>Qualification</label>
                    <div className="login-input-wrapper">
                      <Award className="icon-left" size={18} />
                      <input
                        placeholder="e.g. M.Sc, B.Ed"
                        value={form.qualification}
                        onChange={set('qualification')}
                      />
                    </div>
                  </div>
                  <div className="login-field">
                    <label>Experience</label>
                    <div className="login-input-wrapper">
                      <Clock className="icon-left" size={18} />
                      <input
                        placeholder="e.g. 5 years"
                        value={form.experience}
                        onChange={set('experience')}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Phone (Optional) */}
            <div className="login-field">
              <label>Phone (Optional)</label>
              <div className="login-input-wrapper">
                <Phone className="icon-left" size={18} />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              style={{ marginTop: '1rem' }}
            >
              Next <ArrowRight size={18} />
            </button>
          </div>
          ) : (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            {/* Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="login-field">
                <label>Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="login-input-wrapper">
                  <Lock className="icon-left" size={18} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" className="icon-right" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="login-field">
                <label>Confirm <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="login-input-wrapper">
                  <Lock className="icon-left" size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    required
                    style={{
                      paddingRight: '2.5rem',
                      borderColor: form.confirmPassword && form.password !== form.confirmPassword
                        ? 'var(--danger)' : '',
                    }}
                  />
                  <button type="button" className="icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>Passwords do not match</span>
                )}
              </div>
            </div>

            {/* Info box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}>
              <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} /> 
              <span>Admin approval is required after registration.</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              style={{ width: '100%', marginBottom: '1rem', height: '46px', display: 'flex', justifyContent: 'center' }}
            >
              <ArrowLeft size={18} /> Back to Personal Details
            </button>

            <button
              id="register-submit"
              type="submit"
              className="login-submit-btn"
              disabled={
                loading || 
                (form.confirmPassword !== '' && form.password !== form.confirmPassword) ||
                emailState !== 'verified' ||
                (form.phone && phoneState !== 'verified')
              }
            >
              {loading ? (
                <>
                  <div className="spinner-sm spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Sign Up
                </>
              )}
            </button>
          </div>
          )}
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In Instead
            </Link>
          </div>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
