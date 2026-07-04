import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page-center" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
        <ShieldAlert size={64} color="var(--danger)" />
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>403 - Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
          You don't have permission to view this page. Please contact an administrator if you believe this is a mistake.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Return to Homepage
        </Link>
      </div>
    );
  }
  
  return children;
}
