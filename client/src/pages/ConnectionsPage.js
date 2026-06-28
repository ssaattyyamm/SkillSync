import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, UserX, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const getBadgeClass = (badge = '') => {
  const b = badge.toLowerCase();
  if (b.includes('expert')) return 'badge-expert';
  if (b.includes('advanced')) return 'badge-advanced';
  if (b.includes('intermediate')) return 'badge-intermediate';
  return 'badge-beginner';
};

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = () => {
    api.get('/connections')
      .then(({ data }) => setConnections(data.connections))
      .catch(() => toast.error('Failed to load connections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConnections(); }, []);

  const handleRemove = async (connectionId) => {
    if (!window.confirm('Remove this connection?')) return;
    try {
      await api.delete(`/connections/${connectionId}`);
      toast.success('Connection removed');
      setConnections(c => c.filter(x => x.connectionId !== connectionId));
    } catch { toast.error('Failed to remove'); }
  };

  const handleLinkedInChat = (linkedinUrl) => {
    if (!linkedinUrl) {
      toast.error('This user has not added their LinkedIn profile yet.');
      return;
    }
    
    window.open(linkedinUrl, '_blank', 'noreferrer');
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Connections</h1>
        <p className="page-subtitle">{connections.length} connection{connections.length !== 1 ? 's' : ''} · Chat via LinkedIn</p>
      </div>

      {connections.length === 0 ? (
        <div className="empty-state">
          <Users size={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--text-muted)' }} />
          <h3>No connections yet</h3>
          <p style={{ marginBottom: 20 }}>Start building your network</p>
          <button className="btn btn-primary" onClick={() => navigate('/discover')}>Discover Students</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {connections.map(({ connectionId, user }) => (
            <div key={connectionId} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${user._id}`)}>
                <div className="avatar avatar-md" style={{ background: 'var(--accent-glow)', border: '2px solid var(--accent)', flexShrink: 0 }}>
                  {user.profilePicture
                    ? <img src={user.profilePicture} alt={user.name} className="avatar avatar-md" />
                    : user.name?.slice(0,2).toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.branch} · Year {user.year}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className={`badge ${getBadgeClass(user.cpBadge)}`} style={{ fontSize: 10 }}>CP {user.cpScore}</span>
                    <span className={`badge ${getBadgeClass(user.devBadge)}`} style={{ fontSize: 10 }}>DEV {user.devScore}</span>
                  </div>
                </div>
              </div>

              {}
              {user.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {user.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
                  {user.skills.length > 3 && <span className="skill-tag" style={{ color: 'var(--text-muted)' }}>+{user.skills.length - 3}</span>}
                </div>
              )}

              {}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                {}
                <button
                  onClick={() => handleLinkedInChat(user.linkedinUrl)}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#0a66c2', flex: 1, justifyContent: 'center' }}
                  title={user.linkedinUrl ? 'Open LinkedIn to chat' : 'LinkedIn not added'}
                >
                  <MessageCircle size={13} />
                  Chat on LinkedIn
                </button>

                {}
                {user.githubUsername && (
                  <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm">
                    <Github size={13} />
                  </a>
                )}

                {}
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm" style={{ color: '#0a66c2' }}>
                    <Linkedin size={13} />
                  </a>
                )}

                {}
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                  onClick={() => handleRemove(connectionId)}>
                  <UserX size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
