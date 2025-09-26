import { Suspense } from "react";
import { CategorySection, CategorySectionFallback } from "./components/category-section";
import { FlashSaleSection, FlashSaleSectionFallback } from "./components/flash-sale-section";
import {BreastPumpSection, BreastPumpSectionFallback } from "./components/breastpump-section";
import {NewArrivalSection, NewArrivalSectionFallback } from "./components/new-arrival-section";
import {BeautySection, BeautySectionFallback } from "./components/beauty-section";
import { CarouselSection, CarouselSectionFallback } from "./components/carousel-section";

export const metadata = {
  title: "Gabag Indonesia - Pompa ASI & Tas Cooler Premium",
  description: "Produk premium pompa ASI dan tas cooler untuk ibu modern",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col w-full max-w-screen px-2 md:px-5 lg:px-10">
        <Suspense fallback={<CarouselSectionFallback/>}>
          <CarouselSection/>
        </Suspense>

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
    </main>
  );
}
