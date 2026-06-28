import React from 'react';

const tierColors = {
  'Newbie':       '#94a3b8',
  'Beginner':     '#10b981',
  'Intermediate': '#3b82f6',
  'Specialist':   '#8b5cf6',
  'Expert':       '#f59e0b',
  'Master':       '#f97316',
  'Grandmaster':  '#ef4444',
};

const tierGlows = {
  'Grandmaster': '0 0 12px rgba(239,68,68,0.5)',
  'Master':      '0 0 10px rgba(249,115,22,0.4)',
  'Expert':      '0 0 8px rgba(245,158,11,0.3)',
};

export default function StarRating({ starRating, size = 'md', showReason = false }) {
  if (!starRating || starRating.stars === 0) return null;

  const { stars = 0, tier = '', reason = '', totalSolved = 0, bestRating = 0 } = starRating;
  const color = tierColors[tier] || '#94a3b8';
  const glow  = tierGlows[tier] || 'none';

  const starSize  = size === 'sm' ? 14 : size === 'lg' ? 22 : 17;
  const fontSize  = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {}
        <div style={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" fill="none">
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={i < stars ? color : 'var(--border)'}
                stroke={i < stars ? color : 'var(--border-light)'}
                strokeWidth="1"
                style={{
                  filter: i < stars && glow !== 'none' ? `drop-shadow(${glow})` : 'none',
                  transition: 'fill 0.2s'
                }}
              />
            </svg>
          ))}
        </div>

        {}
        <span style={{
          fontSize, fontWeight: 700,
          color,
          padding: '2px 8px',
          background: `${color}18`,
          borderRadius: 20,
          border: `1px solid ${color}40`,
          letterSpacing: '0.3px',
          textShadow: glow !== 'none' ? `0 0 8px ${color}` : 'none'
        }}>
          {tier}
        </span>
      </div>

      {}
      {showReason && reason && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          {reason}
        </p>
      )}
    </div>
  );
}
