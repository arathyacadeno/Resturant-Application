import React from 'react';

/**
 * UserAvatarPlaceholder
 *
 * Exact visual replica of the minimalist outline avatar placeholder:
 * - Circular light-gray background with crisp white outer ring and soft shadow
 * - Connected contoured outline head and shoulders silhouette
 */
export const UserAvatarPlaceholder = ({ size = 42, className = '', style = {} }) => {
  return (
    <div
      className={`user-avatar-placeholder ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: 'linear-gradient(180deg, #F5F5F7 0%, #E8E8EC 100%)',
        border: '2px solid #FFFFFF',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        width={Math.round(size * 0.74)}
        height={Math.round(size * 0.74)}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          transform: 'translateY(1px)',
        }}
      >
        {/* Head outline */}
        <path
          d="M24 25C22.2 20.8 24.2 13.5 32 13.5C39.8 13.5 41.8 20.8 40 25C38.8 30.5 35 33.5 32 33.5C29 33.5 25.2 30.5 24 25Z"
          stroke="#111827"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Shoulders outline */}
        <path
          d="M17 48.5C19.5 42.5 24.8 39 28.8 37.2M35.2 37.2C39.2 39 44.5 42.5 47 48.5"
          stroke="#111827"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default UserAvatarPlaceholder;
