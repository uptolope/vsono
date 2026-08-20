'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: string;
  direction?: string;
  stepDuration?: number;
  animationFrom?: { filter: string; opacity: number; y: number };
  animationTo?: { filter: string; opacity: number; y: number }[];
  tag?: React.ElementType;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = '',
  delay = 0,
  animateBy = 'words',
  direction = 'bottom',
  stepDuration = 0.4,
  animationFrom = { filter: "blur(12px)", opacity: 0, y: 20 },
  animationTo = [{ filter: "blur(0px)", opacity: 1, y: 0 }],
  tag: Tag = 'h1',
}) => {
  const words = text.split(' ');

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <motion.span
            initial={animationFrom}
            animate={animationTo[0] || { filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{
              duration: stepDuration,
              delay: delay + i * 0.05,
            }}
            style={{ display: 'inline-block' }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default BlurText;
