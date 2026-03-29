// RegisterPage - User registration with role selection
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Mail, Lock, TrendingUp, Rocket, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'investor', label: 'Investor', icon: <TrendingUp size={22} />, desc: 'Markets & Finance' },
    { value: 'startup_founder', label: 'Founder', icon: <Rocket size={22} />, desc: 'Startups & Innovation' },
    { value: 'student', label: 'Student', icon: <GraduationCap size={22} />, desc: 'Learning & Careers' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields and select a role');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient auth-bg-1" />
      <div className="auth-bg-gradient auth-bg-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div className="sidebar-logo-icon" style={{ width: 42, height: 42 }}>
            <Zap size={20} />
          </div>
          <div>
            <div className="sidebar-logo-text" style={{ fontSize: 18 }}>Smart News OS</div>
            <div className="sidebar-logo-badge">AI Powered</div>
          </div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join Smart News OS for personalized AI-powered news</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-name"
                type="text"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select your role</label>
            <div className="role-selector">
              {roles.map((r) => (
                <div
                  key={r.value}
                  className={`role-option ${role === r.value ? 'selected' : ''}`}
                  onClick={() => setRole(r.value)}
                  id={`role-${r.value}`}
                >
                  <div className="role-option-icon" style={{ color: role === r.value ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                    {r.icon}
                  </div>
                  <div className="role-option-label">{r.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} id="register-submit">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
