import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BRAND_COLORS,
  FONT_FAMILY,
  layout,
  springPresets,
  typography,
} from "../styles";

export interface ProductShowcaseProps {
  productTitle: string;
  productPrice: string;
  productImages: string[];
  brandName: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productTitle,
  productPrice,
  productImages,
  brandName,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const images = productImages.length > 0 ? productImages : [];
  const imageCount = images.length;
  const framesPerImage =
    imageCount > 0 ? Math.floor(durationInFrames / imageCount) : durationInFrames;
  const activeIndex =
    imageCount > 0
      ? Math.min(Math.floor(frame / framesPerImage), imageCount - 1)
      : 0;

  // ── Entrance animations ──
  const containerScale = spring({
    frame,
    fps,
    config: springPresets.smooth,
    from: 0.92,
    to: 1,
  });

  const titleSlide = spring({
    frame: frame - 8,
    fps,
    config: springPresets.snappy,
    from: 40,
    to: 0,
  });

  const titleOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const priceSlide = spring({
    frame: frame - 18,
    fps,
    config: springPresets.snappy,
    from: 30,
    to: 0,
  });

  const priceOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const brandOpacity = interpolate(frame, [0, 15], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Exit fade ──
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.background,
        ...layout.centered,
        opacity: exitOpacity,
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          ...layout.fullFrame,
          position: "absolute",
          background: `radial-gradient(circle at 70% 30%, ${BRAND_COLORS.gray100} 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          ...layout.row,
          ...layout.centered,
          width: "100%",
          height: "100%",
          padding: layout.padding.xl,
          gap: 56,
          transform: `scale(${containerScale})`,
        }}
      >
        {/* Product image section */}
        <div
          style={{
            flex: "0 0 50%",
            ...layout.centered,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 480,
              height: 480,
              borderRadius: layout.borderRadius.xl,
              overflow: "hidden",
              boxShadow: BRAND_COLORS.cardShadow,
              backgroundColor: BRAND_COLORS.white,
              ...layout.centered,
              position: "relative",
            }}
          >
            {images.map((src, i) => {
              const isActive = i === activeIndex;
              const localFrame = frame - i * framesPerImage;

              const imgScale = isActive
                ? spring({
                    frame: Math.max(0, localFrame),
                    fps,
                    config: springPresets.gentle,
                    from: 1.08,
                    to: 1,
                  })
                : 1;

              const imgOpacity = isActive
                ? interpolate(
                    localFrame,
                    [0, 10],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  )
                : i < activeIndex
                ? 0
                : 0;

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    ...layout.centered,
                    opacity: imgOpacity,
                    transform: `scale(${imgScale})`,
                  }}
                >
                  <Img
                    src={src}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              );
            })}

            {/* Image counter dots */}
            {imageCount > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 8,
                }}
              >
                {images.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === activeIndex ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        i === activeIndex
                          ? BRAND_COLORS.blackText
                          : BRAND_COLORS.gray100,
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product info section */}
        <div
          style={{
            flex: "0 0 42%",
            ...layout.column,
            justifyContent: "center",
            gap: 20,
          }}
        >
          {/* Brand name */}
          <div
            style={{
              ...typography.badge,
              color: BRAND_COLORS.gray200,
              opacity: brandOpacity,
              letterSpacing: 2.5,
            }}
          >
            {brandName}
          </div>

          {/* Product title */}
          <div
            style={{
              ...typography.title,
              opacity: titleOpacity,
              transform: `translateY(${titleSlide}px)`,
            }}
          >
            {productTitle}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 3,
              backgroundColor: BRAND_COLORS.blackText,
              borderRadius: 2,
              opacity: titleOpacity,
            }}
          />

          {/* Price */}
          <div
            style={{
              opacity: priceOpacity,
              transform: `translateY(${priceSlide}px)`,
              ...layout.row,
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <span style={{ ...typography.price, fontSize: 42 }}>
              {productPrice}
            </span>
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 16,
                fontWeight: 500,
                color: BRAND_COLORS.text,
              }}
            >
              so'm
            </span>
          </div>

          {/* Wholesale tag */}
          <div
            style={{
              opacity: priceOpacity,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <div
              style={{
                padding: "6px 14px",
                backgroundColor: BRAND_COLORS.blackText,
                borderRadius: layout.borderRadius.sm,
                ...typography.badge,
                fontSize: 11,
              }}
            >
              ULGURJI NARX
            </div>
          </div>
        </div>
      </div>

      {/* Bottom brand bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: BRAND_COLORS.blackText,
        }}
      />
    </AbsoluteFill>
  );
};
