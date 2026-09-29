'use client';

import Image from 'next/image';
import { generateSignedImageUrl } from './image-signing';

interface ProtectedImageProps {
  imageId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ProtectedImage({
  imageId,
  alt,
  width = 400,
  height = 300,
  className,
}: ProtectedImageProps) {
  const signedUrl = generateSignedImageUrl(imageId, 30); // 30 min expiry

  return (
    <Image
      src={signedUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
      unoptimized
    />
  );
}
