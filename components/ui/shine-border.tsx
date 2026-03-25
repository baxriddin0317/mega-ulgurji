"use client";

import { cn } from "@/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

function ShineBorder({
  borderRadius = 12,
  borderWidth = 2,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  const backgroundRadialGradient = `radial-gradient(transparent, transparent, ${
    color instanceof Array ? color.join(",") : color
  }, transparent, transparent)`;

  return (
    <div
      className={cn("shine-border-wrapper relative grid h-full w-full place-items-center", className)}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      }}
    >
      <div
        className="shine-border-effect"
        style={
          {
            "--shine-border-width": `${borderWidth}px`,
            "--shine-border-radius": `${borderRadius}px`,
            "--shine-duration": `${duration}s`,
            "--shine-bg": backgroundRadialGradient,
          } as React.CSSProperties
        }
      />
      <div
        className="relative z-10 h-full w-full bg-white"
        style={{ borderRadius: `${borderRadius - 1}px` }}
      >
        {children}
      </div>
    </div>
  );
}

export { ShineBorder };
