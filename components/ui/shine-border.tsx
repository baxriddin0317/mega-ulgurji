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
  borderWidth = 1.5,
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
      style={{ borderRadius: `${borderRadius}px` }}
      className={cn(
        "shine-border-wrapper relative grid h-full w-full place-items-center bg-white text-black",
        className,
      )}
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
      {children}
    </div>
  );
}

export { ShineBorder };
