import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Code, ExternalLink, Code2, TrendingUp, BookOpen, Edit, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ConnectButton from '../components/common/ConnectButton';
import StarRating from '../components/common/StarRating';
import './ProfilePage.css';

const getBadgeClass = (badge = '') => {
  const b = badge.toLowerCase();
  if (b.includes('expert')) return 'badge-expert';
  if (b.includes('advanced')) return 'badge-advanced';
  if (b.includes('intermediate')) return 'badge-intermediate';
  return 'badge-beginner';
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const isOwnProfile = me?._id === id;

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then(({ data }) => setProfile(data.user))
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));

    
    if (!isOwnProfile) {
      api.get(`/connections/status/${id}`)
        .then(({ data }) => setConnectionStatus(data.status))
        .catch(() => {});
    }
  }, [id]);

  const handleLinkedInChat = () => {
    if (!profile?.linkedinUrl) {
      toast.error('This user has not added their LinkedIn URL yet.');
      return;
    }
    window.open(profile.linkedinUrl, '_blank', 'noreferrer');
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  const initials = profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isConnected = connectionStatus === 'accepted';

  return (
    <div className="page-container">
      <div className="profile-layout">
        {}
        <div className="profile-sidebar-col">
          <div className="card profile-hero-card">
            <div className="profile-avatar-wrap">
              <div className="avatar avatar-xl profile-avatar">
                {profile.profilePicture
                  ? <img src={profile.profilePicture} alt={profile.name} className="avatar avatar-xl" />
                  : initials
                }
              </div>
            </div>
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-college">{profile.college}</p>
            <p className="profile-meta">{profile.branch} · Year {profile.year}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}

            <div className="profile-actions">
              {isOwnProfile ? (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile/edit')}>
                  <Edit size={14} /> Edit Profile
                </button>
              ) : (
                <>
                  <ConnectButton userId={profile._id} size="default" />

                  {}
                  <button
                    onClick={handleLinkedInChat}
                    className="btn btn-sm"
                    style={{
                      background: '#0a66c2', color: 'white',
                      opacity: profile.linkedinUrl ? 1 : 0.5
                    }}
                    title={isConnected ? 'You are connected — chat on LinkedIn!' : 'Connect first, then chat on LinkedIn'}
                  >
                    <MessageCircle size={14} />
                    {isConnected ? 'Chat on LinkedIn' : 'Message on LinkedIn'}
                  </button>
                </>
              )}
            </div>

            {}
            {!isOwnProfile && isConnected && profile.linkedinUrl && (
              <div style={{
                marginTop: 12, padding: '10px 12px',
                background: 'rgba(10,102,194,0.1)', borderRadius: 8,
                border: '1px solid rgba(10,102,194,0.2)',
                fontSize: 12, color: '#5ba4d1', textAlign: 'center'
              }}>
                ✅ You're connected! Click "Chat on LinkedIn" to message {profile.name.split(' ')[0]}.
              </div>
            )}

            {!isOwnProfile && !profile.linkedinUrl && (
              <div style={{
                marginTop: 12, padding: '8px 12px',
                background: 'rgba(245,158,11,0.08)', borderRadius: 8,
                border: '1px solid rgba(245,158,11,0.15)',
                fontSize: 12, color: 'var(--warning)', textAlign: 'center'
              }}>
                ⚠️ {profile.name.split(' ')[0]} hasn't added a LinkedIn URL yet
              </div>
            )}

            {}
            <div className="platform-links">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                  className="platform-link" style={{ color: '#0a66c2' }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer"
                  className="platform-link" style={{ color: 'var(--text-primary)' }}>
                  <Github size={14} /> GitHub
                </a>
              )}
            </div>

            {}
            <div className="platform-links" style={{ marginTop: 8 }}>
              {profile.leetcodeUsername && (
                <a href={`https://leetcode.com/${profile.leetcodeUsername}`} target="_blank" rel="noreferrer"
                  className="platform-link" style={{ color: '#ffa116' }}>
                  <Code size={14} /> LeetCode
                </a>
              )}
              {profile.codeforcesUsername && (
                <a href={`https://codeforces.com/profile/${profile.codeforcesUsername}`} target="_blank" rel="noreferrer"
                  className="platform-link" style={{ color: '#4a90e2' }}>
                  <ExternalLink size={14} /> Codeforces
                </a>
              )}
              {profile.codechefUsername && (
                <a href={`https://codechef.com/users/${profile.codechefUsername}`} target="_blank" rel="noreferrer"
                  className="platform-link" style={{ color: '#b97a4d' }}>
                  <ExternalLink size={14} /> CodeChef
                </a>
              )}
            </div>
          </div>

          {}
          {profile.skills?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="section-title"><Code2 size={15} /> Skills</h3>
              <div className="skills-grid">
                {profile.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          )}

          {}
          {profile.interests?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="section-title"><BookOpen size={15} /> Interests</h3>
              <div className="skills-grid">
                {profile.interests.map(i => (
                  <span key={i} className="skill-tag" style={{ color: 'var(--purple)', borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.1)' }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="profile-main-col">
          {}
          <div className="card score-card">
            <div className="score-card-header">
              <div>
                <h3 className="section-title" style={{ marginBottom: 4 }}><Code2 size={16} /> Competitive Programming</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Based on LeetCode, Codeforces & CodeChef</p>
                {}
                {profile.starRating?.stars > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <StarRating starRating={profile.starRating} size="md" showReason={true} />
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="score-display">{profile.cpScore}</div>
                <span className={`badge ${getBadgeClass(profile.cpBadge)}`}>{profile.cpBadge}</span>
              </div>
            </div>
            <div className="score-progress">
              <div className="score-bar">
                <div className="score-fill accent" style={{ width: `${Math.min(profile.cpScore / 10, 100)}%` }} />
              </div>
              <span className="score-max">/ 1000</span>
            </div>
            <div className="platform-stats">
              {profile.ratingData?.leetcode?.rating > 0 && (
                <div className="platform-stat">
                  <span className="plat-name" style={{ color: '#ffa116' }}>LeetCode</span>
                  <span className="plat-rating">{profile.ratingData.leetcode.rating}</span>
                  <span className="plat-sub">{profile.ratingData.leetcode.problemsSolved} solved</span>
                </div>
              )}
              {profile.ratingData?.codeforces?.rating > 0 && (
                <div className="platform-stat">
                  <span className="plat-name" style={{ color: '#4a90e2' }}>Codeforces</span>
                  <span className="plat-rating">{profile.ratingData.codeforces.rating}</span>
                  <span className="plat-sub">{profile.ratingData.codeforces.rank}</span>
                </div>
              )}
              {profile.ratingData?.codechef?.rating > 0 && (
                <div className="platform-stat">
                  <span className="plat-name" style={{ color: '#b97a4d' }}>CodeChef</span>
                  <span className="plat-rating">{profile.ratingData.codechef.rating}</span>
                  <span className="plat-sub">{'⭐'.repeat(Math.min(profile.ratingData.codechef.stars || 1, 7))}</span>
                </div>
              )}
            </div>
            {profile.cpScore === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
                {isOwnProfile ? '👆 Add your LeetCode/CF/CodeChef username and refresh scores in Edit Profile' : 'No CP data available yet'}
              </p>
            )}
          </div>

          {}
          <div className="card score-card" style={{ marginTop: 20 }}>
            <div className="score-card-header">
              <div>
                <h3 className="section-title" style={{ marginBottom: 4 }}><TrendingUp size={16} /> Developer Profile</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Based on GitHub activity and contributions</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="score-display" style={{ color: 'var(--success)' }}>{profile.devScore}</div>
                <span className={`badge ${getBadgeClass(profile.devBadge)}`}>{profile.devBadge}</span>
              </div>
            </div>
            <div className="score-progress">
              <div className="score-bar">
                <div className="score-fill success" style={{ width: `${Math.min(profile.devScore / 10, 100)}%` }} />
              </div>
              <span className="score-max">/ 1000</span>
            </div>
            {profile.ratingData?.github && (profile.ratingData.github.repos > 0) && (
              <div className="github-stats">
                <div className="gh-stat">
                  <span className="gh-value">{profile.ratingData.github.repos}</span>
                  <span className="gh-label">Repos</span>
                </div>
                <div className="gh-stat">
                  <span className="gh-value">{profile.ratingData.github.contributions}</span>
                  <span className="gh-label">Contributions</span>
                </div>
                <div className="gh-stat">
                  <span className="gh-value">{profile.ratingData.github.followers}</span>
                  <span className="gh-label">Followers</span>
                </div>
                <div className="gh-stat">
                  <span className="gh-value">{profile.ratingData.github.stars}</span>
                  <span className="gh-label">Stars</span>
                </div>
              </div>
            )}
            {profile.devScore === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
                {isOwnProfile ? '👆 Add your GitHub username and refresh scores in Edit Profile' : 'No GitHub data available yet'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
