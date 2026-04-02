import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
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

export interface TopProduct {
  title: string;
  price: string;
  image: string;
}

export interface CategoryHighlightProps {
  categoryName: string;
  categoryImage: string;
  productCount: number;
  topProducts: TopProduct[];
}

// ── Scene 1: Category hero (frames 0-100) ──────────────────

const CategoryHero: React.FC<{
  categoryName: string;
  categoryImage: string;
  productCount: number;
}> = ({ categoryName, categoryImage, productCount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow zoom on background image
  const imgScale = interpolate(frame, [0, 100], [1, 1.12], {
    extrapolateRight: "clamp",
  });

  // Overlay fades in
  const overlayOpacity = interpolate(frame, [0, 20], [0.3, 0.65], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Category name entrance
  const nameScale = spring({
    frame: frame - 10,
    fps,
    config: springPresets.snappy,
    from: 0.7,
    to: 1,
  });

  const nameOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Product count entrance
  const countY = spring({
    frame: frame - 30,
    fps,
    config: springPresets.gentle,
    from: 30,
    to: 0,
  });

  const countOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative line
  const lineWidth = spring({
    frame: frame - 22,
    fps,
    config: springPresets.smooth,
    from: 0,
    to: 80,
  });

  // Exit
  const exitOpacity = interpolate(frame, [85, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Background image with zoom */}
      <div
        style={{
          ...layout.fullFrame,
          position: "absolute",
          transform: `scale(${imgScale})`,
        }}
      >
        <Img
          src={categoryImage}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Dark overlay */}
      <div
        style={{
          ...layout.fullFrame,
          position: "absolute",
          backgroundColor: BRAND_COLORS.blackText,
          opacity: overlayOpacity,
        }}
      />

      {/* Content */}
      <div
        style={{
          ...layout.fullFrame,
          ...layout.centered,
          ...layout.column,
          position: "absolute",
          gap: 20,
          textAlign: "center",
        }}
      >
        {/* Category name */}
        <div
          style={{
            ...typography.heroTitle,
            color: BRAND_COLORS.white,
            fontSize: 64,
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
            textShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          {categoryName}
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: BRAND_COLORS.white,
            borderRadius: 2,
            opacity: nameOpacity,
          }}
        />

        {/* Product count */}
        <div
          style={{
            opacity: countOpacity,
            transform: `translateY(${countY}px)`,
            ...layout.row,
            ...layout.centered,
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 48,
              fontWeight: 800,
              color: BRAND_COLORS.white,
              lineHeight: 1,
            }}
          >
            {productCount}+
          </span>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 20,
              fontWeight: 500,
              color: BRAND_COLORS.gray100,
              lineHeight: 1.2,
            }}
          >
            mahsulot
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Top products preview (frames 100-180) ─────────

const TopProductsPreview: React.FC<{ topProducts: TopProduct[] }> = ({
  topProducts,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const displayProducts = topProducts.slice(0, 3);

  // Header entrance
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.background,
        ...layout.column,
        ...layout.centered,
        padding: layout.padding.xl,
        gap: 36,
      }}
    >
      {/* Header */}
      <div
        style={{
          ...typography.badge,
          color: BRAND_COLORS.gray200,
          letterSpacing: 3,
          opacity: headerOpacity,
          fontSize: 14,
        }}
      >
        TOP MAHSULOTLAR
      </div>

      {/* Products row */}
      <div
        style={{
          ...layout.row,
          ...layout.centered,
          gap: 32,
        }}
      >
        {displayProducts.map((product, i) => {
          const delay = 8 + i * 12;

          const cardY = spring({
            frame: frame - delay,
            fps,
            config: springPresets.snappy,
            from: 50,
            to: 0,
          });

          const cardOpacity = interpolate(
            frame,
            [delay, delay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Hover-like lift for middle card
          const lift =
            i === 1
              ? spring({
                  frame: frame - delay - 10,
                  fps,
                  config: springPresets.gentle,
                  from: 0,
                  to: -8,
                })
              : 0;

          return (
            <div
              key={i}
              style={{
                width: 300,
                backgroundColor: BRAND_COLORS.white,
                borderRadius: layout.borderRadius.lg,
                overflow: "hidden",
                boxShadow:
                  i === 1
                    ? BRAND_COLORS.cardShadowHover
                    : BRAND_COLORS.cardShadow,
                opacity: cardOpacity,
                transform: `translateY(${cardY + lift}px)`,
              }}
            >
              {/* Image */}
              <div
                style={{
                  width: "100%",
                  height: 240,
                  backgroundColor: BRAND_COLORS.gray100,
                  ...layout.centered,
                  overflow: "hidden",
                }}
              >
                <Img
                  src={product.image}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: "14px 18px" }}>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 16,
                    fontWeight: 600,
                    color: BRAND_COLORS.blackText,
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {product.title}
                </div>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 19,
                    fontWeight: 700,
                    color: BRAND_COLORS.blackText,
                  }}
                >
                  {product.price}{" "}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: BRAND_COLORS.text,
                    }}
                  >
                    so'm
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom brand line */}
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

// ── Main composition ────────────────────────────────────────

export const CategoryHighlight: React.FC<CategoryHighlightProps> = ({
  categoryName,
  categoryImage,
  productCount,
  topProducts,
}) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={100}>
        <CategoryHero
          categoryName={categoryName}
          categoryImage={categoryImage}
          productCount={productCount}
        />
      </Sequence>

      <Sequence from={100} durationInFrames={80}>
        <TopProductsPreview topProducts={topProducts} />
      </Sequence>
    </AbsoluteFill>
  );
};
