import { Metadata } from "next";
import { Suspense } from "react";
import HomeCarousel from "./components/home-carousel";
import CategorySection, { CategorySectionFallback } from "./components/category-section";
import FlashSaleSection, { FlashSaleSectionFallback } from "./components/flash-sale-section";
import BreastPumpSection, { BreastPumpSectionFallback } from "./components/breastpump-section";
import NewArrivalSection, { NewArrivalSectionFallback } from "./components/new-arrival-section";
import BeautySection, { BeautySectionFallback } from "./components/beauty-section";

export const metadata: Metadata = {
  description:
    "Temukan Gabag! pompa ASI dan tas cooler premium untuk ibu modern. Praktis, stylish, dan sempurna untuk kebutuhan menyusui di mana saja!",
  openGraph: {
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div>
      <div className="flex flex-col w-full max-w-screen px-2 md:px-5 lg:px-10">
        <HomeCarousel slideDuration={5000} />

        <Suspense fallback={<CategorySectionFallback />}>
          <CategorySection />
        </Suspense>

        <Suspense fallback={<FlashSaleSectionFallback />}>
          <FlashSaleSection />
        </Suspense>

        <Suspense fallback={<BreastPumpSectionFallback />}>
          <BreastPumpSection />
        </Suspense>

        <Suspense fallback={<NewArrivalSectionFallback />}>
          <NewArrivalSection />
        </Suspense>

        <Suspense fallback={<BeautySectionFallback />}>
          <BeautySection />
        </Suspense>
      </div>
    </div>
  );
}
