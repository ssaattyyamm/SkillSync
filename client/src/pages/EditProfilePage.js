import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'Other'];
const COMMON_SKILLS = ['C++', 'Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'DSA', 'Machine Learning', 'SQL', 'Go', 'Docker', 'Rust', 'TypeScript'];

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    branch: user?.branch || 'CSE',
    year: user?.year || 1,
    college: user?.college || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUsername: user?.githubUsername || '',
    leetcodeUsername: user?.leetcodeUsername || '',
    codeforcesUsername: user?.codeforcesUsername || '',
    codechefUsername: user?.codechefUsername || '',
    profilePicture: user?.profilePicture || ''
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleSkill = (skill) => {
    const skills = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    const idx = skills.indexOf(skill);
    if (idx >= 0) skills.splice(idx, 1); else skills.push(skill);
    setForm(f => ({ ...f, skills: skills.join(', ') }));
  };

  const hasSkill = (skill) => form.skills.split(',').map(s => s.trim()).includes(skill);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', {
        ...form,
        year: parseInt(form.year),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean)
      });
      updateUser(data.user);
      toast.success('Profile updated!');
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshScores = async () => {
    
    const hasUnsavedUsernames =
      form.leetcodeUsername !== (user?.leetcodeUsername || '') ||
      form.codeforcesUsername !== (user?.codeforcesUsername || '') ||
      form.codechefUsername !== (user?.codechefUsername || '') ||
      form.githubUsername !== (user?.githubUsername || '');

    if (hasUnsavedUsernames) {
      toast('Saving profile first...', { icon: '💾' });
      try {
        const { data } = await api.put('/users/profile', {
          ...form,
          year: parseInt(form.year),
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          interests: form.interests.split(',').map(s => s.trim()).filter(Boolean)
        });
        updateUser(data.user);
      } catch (err) {
        toast.error('Save failed before refresh');
        return;
      }
    }

    setRefreshing(true);
    setFetchResult(null);
    const toastId = toast.loading('Fetching your ratings from LeetCode, Codeforces, CodeChef & GitHub...');
    try {
      const { data } = await api.post('/ratings/refresh');
      updateUser(data.user);
      setFetchResult(data.fetched);
      toast.dismiss(toastId);

      const fetched = data.fetched;
      const platforms = [];
      if (fetched.leetcode) platforms.push('LeetCode');
      if (fetched.codeforces) platforms.push('Codeforces');
      if (fetched.codechef) platforms.push('CodeChef');
      if (fetched.github) platforms.push('GitHub');

      if (platforms.length > 0) {
        toast.success(`✅ Fetched: ${platforms.join(', ')} | CP: ${data.scores.cpScore} | DEV: ${data.scores.devScore}`);
      } else {
        toast.error('No platform data fetched. Check your usernames!');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const PlatformStatus = ({ label, fetched }) => {
    if (fetched === undefined) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 12, padding: '2px 8px', borderRadius: 12,
        background: fetched ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: fetched ? 'var(--success)' : 'var(--danger)'
      }}>
        {fetched ? <CheckCircle size={11} /> : <XCircle size={11} />}
        {label}
      </span>
    );
  };

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">Keep your profile updated to get better connections</p>
      </div>

      <form onSubmit={handleSave}>
        {}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>Basic Information</h3>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">College</label>
            <input name="college" value={form.college} onChange={handleChange} className="form-input" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange} className="form-input form-select">
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select name="year" value={form.year} onChange={handleChange} className="form-input form-select">
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio / About</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} className="form-input"
              rows={3} placeholder="Tell others about yourself..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Profile Picture URL</label>
            <input name="profilePicture" value={form.profilePicture} onChange={handleChange}
              className="form-input" placeholder="https://..." />
          </div>
        </div>

        {}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>Skills & Interests</h3>
          <div className="form-group">
            <label className="form-label">Quick add skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {COMMON_SKILLS.map(skill => (
                <button key={skill} type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`btn btn-sm ${hasSkill(skill) ? 'btn-primary' : 'btn-secondary'}`}>
                  {skill}
                </button>
              ))}
            </div>
            <label className="form-label">All skills (comma-separated)</label>
            <input name="skills" value={form.skills} onChange={handleChange} className="form-input"
              placeholder="React, Node.js, DSA, Python..." />
          </div>
          <div className="form-group">
            <label className="form-label">Interests (comma-separated)</label>
            <input name="interests" value={form.interests} onChange={handleChange} className="form-input"
              placeholder="Competitive Programming, Web Development, ML..." />
          </div>
        </div>

        {}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-title" style={{ marginBottom: 4 }}>Social & Coding Profiles</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Add your usernames — scores will be fetched automatically when you click Refresh
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange}
                className="form-input" placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub Username</label>
              <input name="githubUsername" value={form.githubUsername} onChange={handleChange}
                className="form-input" placeholder="e.g. torvalds" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                LeetCode Username
                {fetchResult && <PlatformStatus label="LeetCode" fetched={fetchResult.leetcode} />}
              </label>
              <input name="leetcodeUsername" value={form.leetcodeUsername} onChange={handleChange}
                className="form-input" placeholder="e.g. tourist" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Codeforces Handle
                {fetchResult && <PlatformStatus label="CF" fetched={fetchResult.codeforces} />}
              </label>
              <input name="codeforcesUsername" value={form.codeforcesUsername} onChange={handleChange}
                className="form-input" placeholder="e.g. tourist" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                CodeChef Username
                {fetchResult && <PlatformStatus label="CC" fetched={fetchResult.codechef} />}
              </label>
              <input name="codechefUsername" value={form.codechefUsername} onChange={handleChange}
                className="form-input" placeholder="e.g. gennady" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                GitHub Username (for Dev Score)
                {fetchResult && <PlatformStatus label="GitHub" fetched={fetchResult.github} />}
              </label>
              <input name="githubUsername" value={form.githubUsername} onChange={handleChange}
                className="form-input" placeholder="e.g. torvalds" />
            </div>
          </div>

          {}
          <div style={{ padding: '16px', background: 'var(--accent-glow)', borderRadius: 8, marginTop: 8, border: '1px solid rgba(79,142,247,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
              <AlertCircle size={16} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Click <strong>Refresh Scores</strong> after saving your usernames. Scores are fetched live from LeetCode, Codeforces, CodeChef & GitHub. If a platform is unreachable, existing score is kept.
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleRefreshScores} disabled={refreshing}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Fetching ratings... please wait' : '🔄 Refresh Scores Now'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/profile/${user._id}`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
