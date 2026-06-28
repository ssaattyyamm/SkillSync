import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Bell, Code2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const getBadgeClass = (badge = '') => {
  const b = badge.toLowerCase();
  if (b.includes('expert')) return 'badge-expert';
  if (b.includes('advanced')) return 'badge-advanced';
  if (b.includes('intermediate')) return 'badge-intermediate';
  return 'badge-beginner';
};

export default function RequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    api.get('/connections/pending')
      .then(({ data }) => setRequests(data.requests))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (id) => {
    try {
      await api.put(`/connections/accept/${id}`);
      toast.success('Connection accepted! 🎉');
      setRequests(r => r.filter(x => x._id !== id));
    } catch { toast.error('Failed to accept'); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/connections/reject/${id}`);
      toast.success('Request ignored');
      setRequests(r => r.filter(x => x._id !== id));
    } catch { toast.error('Failed to reject'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1 className="page-title">Connection Requests</h1>
        <p className="page-subtitle">{requests.length} pending request{requests.length !== 1 ? 's' : ''}</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--text-muted)' }} />
          <h3>No pending requests</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map(req => {
            const u = req.requester;
            const initials = u.name?.slice(0,2).toUpperCase();
            return (
              <div key={req._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="avatar avatar-md" style={{ background: 'var(--accent-glow)', border: '2px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${u._id}`)}>
                  {u.profilePicture ? <img src={u.profilePicture} alt={u.name} className="avatar avatar-md" /> : initials}
                </div>

                <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => navigate(`/profile/${u._id}`)}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{u.branch} · Year {u.year} · {u.college}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Code2 size={12} color="var(--accent)" /> CP {u.cpScore}
                      <span className={`badge ${getBadgeClass(u.cpBadge)}`} style={{ fontSize: 9 }}>{u.cpBadge}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <TrendingUp size={12} color="var(--success)" /> DEV {u.devScore}
                    </span>
                  </div>
                  {u.skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {u.skills.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleAccept(req._id)}>
                    <Check size={14} /> Accept
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleReject(req._id)}>
                    <X size={14} /> Ignore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
