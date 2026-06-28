import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      await login('arjun@nitdelhi.ac.in', 'password123');
      toast.success('Logged in as demo user!');
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed. Run the seed script first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">SkillSync</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your college network</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} className="form-input input-with-icon"
                  placeholder="you@college.ac.in" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Password
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input type="password" name="password" value={form.password}
                  onChange={handleChange} className="form-input input-with-icon"
                  placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign In'}
  
          </form>






          <p className="auth-link">
            New to SkillSync? <Link to="/register">Create account</Link>
          </p>
        </div>

        <div className="auth-features">
          <h2>Connect with the best coders in your college</h2>
          <ul>
            <li>🏆 Discover top ranked coders and developers</li>
            <li>⭐ Star ratings based on problems solved + contest rating</li>
            <li>📊 Track your CP and Dev scores</li>
            <li>🔍 Find project partners and mentors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
