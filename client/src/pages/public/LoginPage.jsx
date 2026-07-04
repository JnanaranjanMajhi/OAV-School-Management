import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Headset, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function LoginPage() {
  const { user, login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  // Forgot password state
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); 
  const [forgotForm, setForgotForm] = useState({ identifier: '', otp: '', newPassword: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const path = user.role === 'admin' ? '/admin/dashboard' : user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      navigate(path, { replace: true });
    } else {
      // Ping backend to wake it up from cold start (Render free tier)
      api.get('/school-info').catch(() => {});
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name}!`);
      const path = u.role === 'admin' ? '/admin/dashboard' : u.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotForm.identifier) return toast.error('Please enter your email or phone number');
    setForgotLoading(true);
    try {
      const type = forgotForm.identifier.includes('@') ? 'email' : 'phone';
      await api.post('/auth/send-otp', { identifier: forgotForm.identifier, type, purpose: 'forgot-password' });
      toast.success(`OTP sent to your ${type}`);
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!forgotForm.otp || forgotForm.newPassword.length < 8) return toast.error('Please fill all fields. Password must be 8+ characters.');
    setForgotLoading(true);
    try {
      const type = forgotForm.identifier.includes('@') ? 'email' : 'phone';
      const { data } = await api.post('/auth/reset-password-otp', { ...forgotForm, type });
      toast.success(data.message);
      setShowForgotPw(false);
      setForgotStep(1);
      setForgotForm({ identifier: '', otp: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        if (result.name) {
          toast.success(`Welcome back, ${result.name}!`);
          const path = result.role === 'admin' ? '/admin/dashboard' : result.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
          navigate(path);
        } else {
          toast.success(result.message || 'Action completed.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google Login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google Login failed')
  });

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

      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <Link to="/" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
          <ArrowLeft size={16} /> <span style={{ marginLeft: '0.25rem' }}>Back to Home</span>
        </Link>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-logo-center-wrapper">
            <div className="login-logo-glow"></div>
            <img src="/logo.jpg" alt="OAV Logo" className="login-logo-center" />
          </div>
          
          <div className="login-titles">
            <h1>Welcome Back</h1>
            <p>Sign in to your school portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email Address</label>
              <div className="login-input-wrapper">
                <Mail className="icon-left" size={18} />
                <input 
                  type="email" 
                  placeholder="you@school.com" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="login-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <label>Password</label>
                <button type="button" className="forgot-btn" onClick={() => setShowForgotPw(true)}>
                  Forgot password?
                </button>
              </div>
              <div className="login-input-wrapper">
                <Lock className="icon-left" size={18} />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  required 
                />
                <button type="button" className="icon-right" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-remember">
              <label>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <div className="spinner-sm spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : (
                <>
                  <ArrowRight size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="login-trouble">
            <Headset size={24} className="trouble-icon" />
            <div className="trouble-text">
              <strong>Having trouble logging in?</strong>
              <span>Contact your school administrator<br/>for access credentials.</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
          </div>
        </div>
      </div>

      {showForgotPw && (
        <Modal title="Reset Password" onClose={() => setShowForgotPw(false)}>
          {forgotStep === 1 ? (
            <form onSubmit={handleForgotRequest}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter the email address or phone number associated with your account. We will send you an OTP to reset your password.</p>
              <div className="form-group">
                <label className="form-label">Email or Phone Number</label>
                <input
                  className="form-input"
                  placeholder="e.g. name@gmail.com or 9876543210"
                  value={forgotForm.identifier}
                  onChange={e => setForgotForm({ ...forgotForm, identifier: e.target.value })}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForgotPw(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? <div className="spinner-sm spinner" /> : 'Send OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotReset}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>An OTP has been sent to <strong>{forgotForm.identifier}</strong>.</p>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  value={forgotForm.otp}
                  onChange={e => setForgotForm({ ...forgotForm, otp: e.target.value })}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 8 characters, uppercase, lowercase, number"
                  value={forgotForm.newPassword}
                  onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setForgotStep(1)}>Back</button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? <div className="spinner-sm spinner" /> : <><KeyRound size={14} /> Reset Password</>}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
