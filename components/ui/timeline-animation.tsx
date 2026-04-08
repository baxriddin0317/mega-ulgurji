"use client";
import React, { RefObject } from "react";
import { motion, useInView, Variants } from "framer-motion";

type MotionTag =
  | "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span"
  | "a" | "section" | "header" | "article" | "main"
  | "figure" | "button" | "ul" | "li";

interface TimelineContentProps {
  as?: MotionTag;
  animationNum?: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

export function TimelineContent({
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, margin: "-80px" });
  const variants = customVariants || defaultVariants;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionComponent = (motion as any)[as] || motion.div;

  return (
    <MotionComponent
      custom={animationNum}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
