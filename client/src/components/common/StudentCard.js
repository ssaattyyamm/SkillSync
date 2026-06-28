import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Code2, TrendingUp } from 'lucide-react';
import ConnectButton from './ConnectButton';
import StarRating from './StarRating';
import './StudentCard.css';

const getBadgeClass = (badge) => {
  if (!badge) return 'badge-beginner';
  const b = badge.toLowerCase();
  if (b.includes('expert')) return 'badge-expert';
  if (b.includes('advanced')) return 'badge-advanced';
  if (b.includes('intermediate')) return 'badge-intermediate';
  return 'badge-beginner';
};

export default function StudentCard({ student, showConnect = true }) {
  const navigate = useNavigate();
  const initials = student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="student-card card" onClick={() => navigate(`/profile/${student._id}`)}>
      <div className="student-card-header">
        <div className="avatar avatar-md student-avatar">
          {student.profilePicture
            ? <img src={student.profilePicture} alt={student.name} className="avatar avatar-md" />
            : initials
          }
        </div>
        <div className="student-card-info">
          <h3 className="student-name">{student.name}</h3>
          <p className="student-meta">{student.branch} · Year {student.year}</p>
        </div>
      </div>

      <div className="student-card-scores">
        <div className="score-pill">
          <Code2 size={12} />
          <span>CP {student.cpScore || 0}</span>
          <span className={`badge ${getBadgeClass(student.cpBadge)}`}>{student.cpBadge}</span>
        </div>
        <div className="score-pill">
          <TrendingUp size={12} />
          <span>DEV {student.devScore || 0}</span>
          <span className={`badge ${getBadgeClass(student.devBadge)}`}>{student.devBadge?.replace(' Developer', '')}</span>
        </div>
      </div>

      {student.skills?.length > 0 && (
        <div className="student-skills">
          {student.skills.slice(0, 3).map(skill => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {student.skills.length > 3 && (
            <span className="skill-tag" style={{ color: 'var(--text-muted)' }}>+{student.skills.length - 3}</span>
          )}
        </div>
      )}

      {}
      {student.starRating?.stars > 0 && (
        <div style={{ paddingTop: 2 }}>
          <StarRating starRating={student.starRating} size="sm" />
        </div>
      )}

      <div className="student-card-actions" onClick={e => e.stopPropagation()}>
        {student.githubUsername && (
          <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer"
            className="btn btn-ghost btn-sm">
            <Github size={14} /> GitHub
          </a>
        )}
        {student.linkedinUrl && (
          <a href={student.linkedinUrl} target="_blank" rel="noreferrer"
            className="btn btn-ghost btn-sm" style={{ color: '#0a66c2' }}>
            <Linkedin size={14} /> LinkedIn
          </a>
        )}
        {showConnect && <ConnectButton userId={student._id} size="sm" />}
      </div>
    </div>
  );
}
