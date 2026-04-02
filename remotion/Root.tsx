import React from "react";
import { Composition } from "remotion";
import { ProductShowcase } from "./compositions/ProductShowcase";
import { PromoVideo } from "./compositions/PromoVideo";
import { CategoryHighlight } from "./compositions/CategoryHighlight";
import { videoDimensions } from "./styles";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductShowcase"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={ProductShowcase as React.FC<any>}
        durationInFrames={150}
        fps={30}
        width={videoDimensions.landscape.width}
        height={videoDimensions.landscape.height}
        defaultProps={{
          productTitle: "Premium Oshxona To'plami",
          productPrice: "450,000",
          productImages: [
            "https://placehold.co/800x800/EEEEEE/0e141b?text=Product+1",
            "https://placehold.co/800x800/EEEEEE/0e141b?text=Product+2",
            "https://placehold.co/800x800/EEEEEE/0e141b?text=Product+3",
          ],
          brandName: "MegaHome",
        }}
      />

      <Composition
        id="PromoVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={PromoVideo as React.FC<any>}
        durationInFrames={240}
        fps={30}
        width={videoDimensions.landscape.width}
        height={videoDimensions.landscape.height}
        defaultProps={{
          title: "Katta Chegirmalar Festivali",
          subtitle: "Eng yaxshi ulgurji narxlar faqat MegaHome'da",
          discount: "30",
          products: [
            {
              title: "Oshxona To'plami Premium",
              price: "450,000",
              image:
                "https://placehold.co/600x400/EEEEEE/0e141b?text=Mahsulot+1",
            },
            {
              title: "Gilam 3x4 metr",
              price: "1,200,000",
              image:
                "https://placehold.co/600x400/EEEEEE/0e141b?text=Mahsulot+2",
            },
            {
              title: "LED Yoritgich To'plami",
              price: "280,000",
              image:
                "https://placehold.co/600x400/EEEEEE/0e141b?text=Mahsulot+3",
            },
            {
              title: "Choyshablar To'plami",
              price: "180,000",
              image:
                "https://placehold.co/600x400/EEEEEE/0e141b?text=Mahsulot+4",
            },
          ],
        }}
      />

      <Composition
        id="CategoryHighlight"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={CategoryHighlight as React.FC<any>}
        durationInFrames={180}
        fps={30}
        width={videoDimensions.landscape.width}
        height={videoDimensions.landscape.height}
        defaultProps={{
          categoryName: "Oshxona Jihozlari",
          categoryImage:
            "https://placehold.co/1920x1080/0e141b/EEEEEE?text=Category",
          productCount: 156,
          topProducts: [
            {
              title: "Non Pishirgich",
              price: "350,000",
              image:
                "https://placehold.co/600x500/EEEEEE/0e141b?text=Top+1",
            },
            {
              title: "Blender Professional",
              price: "520,000",
              image:
                "https://placehold.co/600x500/EEEEEE/0e141b?text=Top+2",
            },
            {
              title: "Idish To'plami 24dona",
              price: "890,000",
              image:
                "https://placehold.co/600x500/EEEEEE/0e141b?text=Top+3",
            },
          ],
        }}
      />
    </>
  );
};
