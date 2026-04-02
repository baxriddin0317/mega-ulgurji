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

export interface PromoProduct {
  title: string;
  price: string;
  image: string;
}

export interface PromoVideoProps {
  title: string;
  subtitle: string;
  discount: string;
  products: PromoProduct[];
}

// ── Scene 1: Hero discount splash (frames 0-90) ────────────

const HeroScene: React.FC<{
  title: string;
  subtitle: string;
  discount: string;
}> = ({ title, subtitle, discount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 90], [1, 1.06], {
    extrapolateRight: "clamp",
  });

  const discountScale = spring({
    frame: frame - 5,
    fps,
    config: springPresets.bouncy,
    from: 0,
    to: 1,
  });

  const discountRotation = spring({
    frame: frame - 5,
    fps,
    config: springPresets.bouncy,
    from: -15,
    to: -3,
  });

  const titleY = spring({
    frame: frame - 20,
    fps,
    config: springPresets.snappy,
    from: 60,
    to: 0,
  });

  const titleOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.blackText,
        ...layout.centered,
        opacity: exitOpacity,
      }}
    >
      {/* Animated background gradient */}
      <div
        style={{
          ...layout.fullFrame,
          position: "absolute",
          transform: `scale(${bgScale})`,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(238,238,238,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(94,94,94,0.12) 0%, transparent 50%)
          `,
        }}
      />

      <div
        style={{
          ...layout.column,
          ...layout.centered,
          gap: 24,
          textAlign: "center",
        }}
      >
        {/* Discount badge */}
        <div
          style={{
            transform: `scale(${discountScale}) rotate(${discountRotation}deg)`,
            backgroundColor: BRAND_COLORS.white,
            borderRadius: layout.borderRadius.xl,
            padding: "28px 52px",
            boxShadow: "0 8px 40px rgba(238, 238, 238, 0.15)",
          }}
        >
          <span
            style={{
              ...typography.discount,
              color: BRAND_COLORS.blackText,
              fontSize: 80,
            }}
          >
            -{discount}%
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            ...typography.heroTitle,
            color: BRAND_COLORS.white,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            maxWidth: 700,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            ...typography.subtitle,
            color: BRAND_COLORS.gray100,
            opacity: subtitleOpacity,
            maxWidth: 500,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Products grid (frames 90-180) ─────────────────

const ProductsScene: React.FC<{ products: PromoProduct[] }> = ({
  products,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const displayProducts = products.slice(0, 4);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.background,
        ...layout.centered,
        padding: layout.padding.xl,
      }}
    >
      {/* Section header */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...typography.badge,
            color: BRAND_COLORS.gray200,
            letterSpacing: 3,
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          TANLANGAN MAHSULOTLAR
        </div>
      </div>

      {/* Products grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          justifyContent: "center",
          alignItems: "center",
          maxWidth: 900,
          marginTop: 24,
        }}
      >
        {displayProducts.map((product, i) => {
          const delay = 8 + i * 10;

          const cardScale = spring({
            frame: frame - delay,
            fps,
            config: springPresets.snappy,
            from: 0.8,
            to: 1,
          });

          const cardOpacity = interpolate(
            frame,
            [delay, delay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const exitOp = interpolate(frame, [75, 90], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                width: 400,
                backgroundColor: BRAND_COLORS.white,
                borderRadius: layout.borderRadius.lg,
                overflow: "hidden",
                boxShadow: BRAND_COLORS.cardShadow,
                transform: `scale(${cardScale})`,
                opacity: cardOpacity * exitOp,
              }}
            >
              {/* Product image */}
              <div
                style={{
                  width: "100%",
                  height: 220,
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

              {/* Product info */}
              <div style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 17,
                    fontWeight: 600,
                    color: BRAND_COLORS.blackText,
                    marginBottom: 6,
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
                    fontSize: 20,
                    fontWeight: 700,
                    color: BRAND_COLORS.blackText,
                  }}
                >
                  {product.price}{" "}
                  <span
                    style={{
                      fontSize: 13,
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
    </AbsoluteFill>
  );
};

// ── Scene 3: Call to action (frames 180-240) ────────────────

const CTAScene: React.FC<{ discount: string }> = ({ discount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeScale = spring({
    frame: frame - 5,
    fps,
    config: springPresets.bouncy,
    from: 0,
    to: 1,
  });

  const textOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const buttonY = spring({
    frame: frame - 25,
    fps,
    config: springPresets.snappy,
    from: 40,
    to: 0,
  });

  const buttonOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse effect on CTA button
  const pulse = interpolate(frame, [35, 45, 55], [1, 1.04, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.blackText,
        ...layout.centered,
      }}
    >
      <div
        style={{
          ...layout.fullFrame,
          position: "absolute",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(238,238,238,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          ...layout.column,
          ...layout.centered,
          gap: 32,
          textAlign: "center",
        }}
      >
        {/* Discount reminder */}
        <div
          style={{
            transform: `scale(${badgeScale})`,
            backgroundColor: BRAND_COLORS.white,
            borderRadius: layout.borderRadius.lg,
            padding: "14px 32px",
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 28,
              fontWeight: 800,
              color: BRAND_COLORS.blackText,
            }}
          >
            -{discount}% CHEGIRMA
          </span>
        </div>

        {/* CTA text */}
        <div
          style={{
            ...typography.heroTitle,
            color: BRAND_COLORS.white,
            fontSize: 44,
            opacity: textOpacity,
            maxWidth: 600,
          }}
        >
          Hoziroq buyurtma bering!
        </div>

        <div
          style={{
            ...typography.subtitle,
            color: BRAND_COLORS.gray100,
            opacity: textOpacity,
            fontSize: 20,
          }}
        >
          MegaHome Ulgurji - Eng yaxshi narxlar
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: buttonOpacity,
            transform: `translateY(${buttonY}px) scale(${pulse})`,
            backgroundColor: BRAND_COLORS.white,
            borderRadius: layout.borderRadius.md,
            padding: "18px 52px",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 20,
              fontWeight: 700,
              color: BRAND_COLORS.blackText,
              letterSpacing: 1,
            }}
          >
            BUYURTMA BERISH
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ────────────────────────────────────────

export const PromoVideo: React.FC<PromoVideoProps> = ({
  title,
  subtitle,
  discount,
  products,
}) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <HeroScene title={title} subtitle={subtitle} discount={discount} />
      </Sequence>

      <Sequence from={90} durationInFrames={90}>
        <ProductsScene products={products} />
      </Sequence>

      <Sequence from={180} durationInFrames={60}>
        <CTAScene discount={discount} />
      </Sequence>
    </AbsoluteFill>
  );
};
