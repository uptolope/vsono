'use client';

import React, { useEffect, useState } from 'react';

interface ProtectedContentProps {
  children: React.ReactNode;
  contentType: 'EXAM' | 'STUDY_NOTES' | 'FLASHCARDS';
  userId?: string;
  userName?: string;
  disableSelection?: boolean;
  disableRightClick?: boolean;
  showWatermark?: boolean;
}

export function ProtectedContent({
  children,
  contentType,
  userId = 'user',
  userName = 'User',
  disableSelection = true,
  disableRightClick = true,
  showWatermark = true,
}: ProtectedContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Log access for audit trail
    console.log(`[Protected Content] Access logged: \${contentType} by \${userId}`);

    // Optional: Send to server for audit logging
    // fetch('/api/audit/log-access', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ contentType, userId, timestamp: new Date() }),
    // }).catch(() => {});
  }, [contentType, userId]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disableRightClick) {
      e.preventDefault();
    }
  };

  const handleSelectStart = (e: React.MouseEvent) => {
    if (disableSelection) {
      e.preventDefault();
    }
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative"
      onContextMenu={handleContextMenu}
      onMouseDown={handleSelectStart}
      style={{
        userSelect: disableSelection ? 'none' : 'auto',
        WebkitUserSelect: disableSelection ? 'none' : 'auto',
      }}
    >
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Watermark overlay */}
      {showWatermark && (
        <div
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-5"
          style={{
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#c85b3a',
            transform: 'rotate(-45deg)',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            lineHeight: '1.2',
          }}
        >
          {userName}
          <br />
          {userId}
        </div>
      )}

      {/* Legal notice (optional) */}
      <div className="text-center mt-8 p-4 border-t border-white/[0.06]">
        <p className="meta text-[9px] text-[#4a453f]">
          This content is licensed for your personal use only. Unauthorized copying, sharing, recording, or screenshot distribution is prohibited and may result in account suspension.
        </p>
      </div>
    </div>
  );
}
