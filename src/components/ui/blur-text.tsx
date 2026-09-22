"use client";

import React from "react";
import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number; // milliseconds
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  stepDuration?: number;
  animationFrom?: {
    filter: string;
    opacity: number;
    y: number;
  };
  animationTo?: {
    filter: string;
    opacity: number;
    y: number;
  };
  tag?: React.ElementType;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = "",
  delay = 0,
  animateBy = "words",
  direction = "bottom",
  stepDuration = 0.4,
  animationFrom,
  animationTo = {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
  },
  tag: Tag = "h1",
}) => {
  const items =
    animateBy === "letters" ? text.split("") : text.split(" ");

  const defaultAnimationFrom = {
    filter: "blur(12px)",
    opacity: 0,
    y: direction === "bottom" ? 20 : -20,
  };

  return (
    <Tag className={className}>
      {items.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          <motion.span
            initial={animationFrom ?? defaultAnimationFrom}
            animate={animationTo}
            transition={{
              duration: stepDuration,
              delay: delay / 1000 + index * 0.05,
            }}
            style={{ display: "inline-block" }}
          >
            {item}
          </motion.span>

          {animateBy === "words" &&
            index < items.length - 1 &&
            " "}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default BlurText;