'use client';

import React, { useEffect } from 'react';
import styles from './ProtectedContent.module.css';

interface ProtectedContentProps {
  children: React.ReactNode;
  watermarkText?: string;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  watermarkText = 'PROTECTED CONTENT',
}) => {
  useEffect(() => {
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
  }, []);

  return (
    <div className={styles.protectedContainer}>
      <div className={styles.watermark}>{watermarkText}</div>
      <div className={styles.content} onContextMenu={(e) => e.preventDefault()}>
        {children}
      </div>
      <div className={styles.antiScreenshotOverlay} />
    </div>
  );
};
