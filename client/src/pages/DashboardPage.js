import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Code2, TrendingUp, Users, Bell, Star, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StudentCard from '../components/common/StudentCard';
import ConnectButton from '../components/common/ConnectButton';
import './DashboardPage.css';

const getBadgeClass = (badge = '') => {
  if (badge.toLowerCase().includes('expert')) return 'badge-expert';
  if (badge.toLowerCase().includes('advanced')) return 'badge-advanced';
  if (badge.toLowerCase().includes('intermediate')) return 'badge-intermediate';
  return 'badge-beginner';
};

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setDashboard(data.dashboard))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleRefreshScores = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post('/ratings/refresh');
      updateUser(data.user);
      toast.success('Scores refreshed!');
      
      const dash = await api.get('/dashboard');
      setDashboard(dash.data.dashboard);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await api.put(`/connections/accept/${connectionId}`);
      toast.success('Connection accepted!');
      const { data } = await api.get('/dashboard');
      setDashboard(data.dashboard);
    } catch { toast.error('Failed to accept'); }
  };

  const handleReject = async (connectionId) => {
    try {
      await api.put(`/connections/reject/${connectionId}`);
      toast.success('Request rejected');
      const { data } = await api.get('/dashboard');
      setDashboard(data.dashboard);
    } catch { toast.error('Failed to reject'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const { topCoders = [], topDevelopers = [], recentRequests = [], recommended = [], stats = {} } = dashboard || {};

  return (
    <div className="page-container">
      {}
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="welcome-sub">{user?.college} · {user?.branch} · Year {user?.year}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleRefreshScores} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Scores'}
        </button>
      </div>

      {}
      <div className="stats-row">
        <div className="stat-card card card-sm">
          <div className="stat-icon" style={{ background: 'rgba(79,142,247,0.15)', color: 'var(--accent)' }}>
            <Code2 size={20} />
          </div>
          <div>
            <div className="stat-value">{user?.cpScore || 0}</div>
            <div className="stat-label">CP Score</div>
            <span className={`badge ${getBadgeClass(user?.cpBadge)}`}>{user?.cpBadge}</span>
          </div>
        </div>
        <div className="stat-card card card-sm">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-value">{user?.devScore || 0}</div>
            <div className="stat-label">Dev Score</div>
            <span className={`badge ${getBadgeClass(user?.devBadge)}`}>{user?.devBadge?.replace(' Developer', '')}</span>
          </div>
        </div>
        <div className="stat-card card card-sm">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple)' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.connectionCount || 0}</div>
            <div className="stat-label">Connections</div>
          </div>
        </div>
        <div className="stat-card card card-sm">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
            <Bell size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.pendingCount || 0}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {}
        <div className="dashboard-left">
          {}
          {recentRequests.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 className="section-title"><Bell size={16} /> Connection Requests</h3>
              <div className="requests-list">
                {recentRequests.slice(0, 3).map(req => (
                  <div key={req._id} className="request-item">
                    <div className="request-user" onClick={() => navigate(`/profile/${req.requester._id}`)}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--accent-glow)' }}>
                        {req.requester.profilePicture
                          ? <img src={req.requester.profilePicture} alt="" className="avatar avatar-sm" />
                          : req.requester.name?.slice(0, 2).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{req.requester.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{req.requester.branch} · CP {req.requester.cpScore}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleAccept(req._id)}>Accept</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleReject(req._id)}>Ignore</button>
                    </div>
                  </div>
                ))}
                {stats.pendingCount > 3 && (
                  <button className="btn btn-ghost btn-sm btn-full" onClick={() => navigate('/requests')}>
                    View all {stats.pendingCount} requests →
                  </button>
                )}
              </div>
            </div>
          )}

          {}
          {recommended.length > 0 && (
            <div className="card">
              <h3 className="section-title"><Star size={16} /> People You May Know</h3>
              <div className="recommended-list">
                {recommended.slice(0, 4).map(student => (
                  <div key={student._id} className="recommended-item">
                    <div className="request-user" onClick={() => navigate(`/profile/${student._id}`)}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--accent-glow)' }}>
                        {student.profilePicture
                          ? <img src={student.profilePicture} alt="" className="avatar avatar-sm" />
                          : student.name?.slice(0, 2).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{student.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {student.skills?.slice(0,2).join(', ')}
                        </div>
                      </div>
                    </div>
                    <ConnectButton userId={student._id} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="dashboard-right">
          {}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="section-title"><Trophy size={16} /> Top Coders</h3>
            <div className="leaderboard">
              {topCoders.map((coder, i) => (
                <div key={coder._id} className="leaderboard-item" onClick={() => navigate(`/profile/${coder._id}`)}>
                  <span className={`rank-num ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </span>
                  <div className="avatar avatar-sm" style={{ background: 'var(--accent-glow)' }}>
                    {coder.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{coder.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coder.branch}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>
                      {coder.cpScore}
                    </div>
                    <span className={`badge ${getBadgeClass(coder.cpBadge)}`} style={{ fontSize: 9 }}>
                      {coder.cpBadge}
                    </span>
                  </div>
                </div>
              ))}
              {topCoders.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
            </div>
          </div>

          {}
          <div className="card">
            <h3 className="section-title"><TrendingUp size={16} /> Top Developers</h3>
            <div className="leaderboard">
              {topDevelopers.map((dev, i) => (
                <div key={dev._id} className="leaderboard-item" onClick={() => navigate(`/profile/${dev._id}`)}>
                  <span className={`rank-num ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </span>
                  <div className="avatar avatar-sm" style={{ background: 'var(--accent-glow)' }}>
                    {dev.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{dev.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dev.branch}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>
                      {dev.devScore}
                    </div>
                    <span className={`badge ${getBadgeClass(dev.devBadge)}`} style={{ fontSize: 9 }}>
                      {dev.devBadge?.replace(' Developer', '')}
                    </span>
                  </div>
                </div>
              ))}
              {topDevelopers.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
