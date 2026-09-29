'use client';

import React, { useEffect } from 'react';
import styles from './ProtectedContent.module.css';

interface ProtectedContentProps {
  children: React.ReactNode;
  watermarkText?: string;
  contentType?: string;
  userId?: string;
  userName?: string;
  showWatermark?: boolean;
  disableRightClick?: boolean;
  disableSelection?: boolean;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  watermarkText = 'PROTECTED CONTENT',
  showWatermark = true,
  disableRightClick = true,
  disableSelection = true,
}) => {
  useEffect(() => {
    if (!disableRightClick) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [disableRightClick]);

  return (
    <div className={styles.protectedContainer}>
      {showWatermark && (
        <div className={styles.watermark}>{watermarkText}</div>
      )}
      <div 
        className={disableSelection ? styles.contentNoSelect : styles.content}
        onContextMenu={(e) => {
          if (disableRightClick) e.preventDefault();
        }}
      >
        {children}
      </div>
      <div className={styles.antiScreenshotOverlay} />
    </div>
  );
};
