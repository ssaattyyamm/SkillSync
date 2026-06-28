import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '', branch: 'CSE', year: '1'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, year: parseInt(form.year) });
      toast.success('Account created! Welcome to SkillSync 🎉');
      navigate('/profile/edit');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: 460 }}>
          <div className="auth-logo">
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">SkillSync</span>
          </div>
          <h1 className="auth-title">Join your college network</h1>
          <p className="auth-subtitle">Create your profile and start connecting</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="form-input" placeholder="Your full name" required />
            </div>

            <div className="form-group">
              <label className="form-label">College Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="form-input" placeholder="you@college.ac.in" required />
            </div>

            <div className="form-group">
              <label className="form-label">College / University</label>
              <input type="text" name="college" value={form.college} onChange={handleChange}
                className="form-input" placeholder="e.g. NIT Delhi" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange}
                  className="form-input form-select">
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select name="year" value={form.year} onChange={handleChange}
                  className="form-input form-select">
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="form-input" placeholder="At least 6 characters" required minLength={6} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-features">
          <h2>Your coding profile, all in one place</h2>
          <ul>
            <li>📈 Automatic CP Score from LeetCode, Codeforces & CodeChef</li>
            <li>⚡ Developer Score powered by your GitHub activity</li>
            <li>🎯 Smart recommendations based on your skills</li>
            <li>🏫 Connect only with students from your college</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
