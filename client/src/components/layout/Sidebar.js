import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, GitBranch,
  LogOut, Zap, Bell, Settings
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/discover', icon: Users, label: 'Discover' },
  { to: '/connections', icon: UserCheck, label: 'Connections' },
  { to: '/requests', icon: Bell, label: 'Requests' },
  { to: '/profile/edit', icon: Settings, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <aside className="sidebar">
      {}
      <div className="sidebar-logo">
        <div className="logo-icon"><Zap size={20} /></div>
        <span className="logo-text">SkillSync</span>
      </div>

      {}
      <div className="sidebar-user" onClick={() => navigate(`/profile/${user?._id}`)}>
        <div className="avatar avatar-sm" style={{ background: 'var(--accent-glow)', border: '2px solid var(--accent)' }}>
          {user?.profilePicture
            ? <img src={user.profilePicture} alt={user.name} className="avatar avatar-sm" />
            : initials
          }
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-meta">{user?.branch} · Year {user?.year}</div>
        </div>
      </div>

      <hr className="divider" style={{ margin: '8px 16px' }} />

      {}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {}
      <div className="sidebar-bottom">
        <button className="sidebar-link" onClick={() => navigate('/profile/edit')}>
          <Settings size={18} />
          <span>Edit Profile</span>
        </button>
        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {}
      <div className="sidebar-scores">
        <div className="score-chip">
          <span className="score-label">CP</span>
          <span className="score-value">{user?.cpScore || 0}</span>
        </div>
        <div className="score-chip">
          <span className="score-label">DEV</span>
          <span className="score-value">{user?.devScore || 0}</span>
        </div>
      </div>
    </aside>
  );
}

