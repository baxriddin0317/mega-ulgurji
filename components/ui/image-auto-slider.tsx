"use client";
import Image from "next/image";

interface SliderImage {
  url: string;
  alt: string;
}

interface ImageAutoSliderProps {
  images: SliderImage[];
  speed?: "slow" | "normal" | "fast";
  size?: "sm" | "md" | "lg";
}

const speedMap = {
  slow: "animate-[scroll-left_45s_linear_infinite]",
  normal: "animate-[scroll-left_30s_linear_infinite]",
  fast: "animate-[scroll-left_18s_linear_infinite]",
};

const sizeMap = {
  sm: "w-36 h-36 sm:w-44 sm:h-44",
  md: "w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64",
  lg: "w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80",
};

export function ImageAutoSlider({
  images,
  speed = "normal",
  size = "md",
}: ImageAutoSliderProps) {
  if (images.length === 0) return null;

  const duplicated = [...images, ...images];

  return (
    <div className="scroll-mask w-full overflow-hidden">
      <div
        className={`flex gap-4 sm:gap-6 w-max hover:[animation-play-state:paused] ${speedMap[speed]}`}
      >
        {duplicated.map((img, i) => (
          <div
            key={i}
            className={`flex-shrink-0 ${sizeMap[size]} rounded-2xl overflow-hidden shadow-xl group`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={320}
              height={320}
              className="size-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
