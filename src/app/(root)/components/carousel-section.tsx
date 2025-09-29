import { trpc } from "@/trpc/server";
import HomeCarousel from "./home-carousel";
import { Skeleton } from "@/components/ui/skeleton";

export async function CarouselSection() {
  const carousels = await trpc.carousel.getAll();

  return <HomeCarousel slideDuration={10000} carousels={carousels} />;
}

export const CarouselSectionFallback = () => {
  return (
    <div className="w-[85%] m-auto mt-5">
      <Skeleton className="w-full aspect-[3/5.3] md:aspect-[5/2.5] rounded-md"/>
    </div>
  );
};
