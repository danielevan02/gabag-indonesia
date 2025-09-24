import { trpc } from "@/trpc/server";
import HomeCarousel from "./home-carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export async function CarouselSection() {
  const carousels = await trpc.carousel.getAll();

  return <HomeCarousel slideDuration={10000} carousels={carousels} />;
}

export const CarouselSectionFallback = () => {
  return (
    <div className="w-[85%] m-auto mt-5">
      <Carousel>
        <CarouselContent className="rounded-4xl">
          {[...Array(3)].map((_, index) => (
            <CarouselItem key={index}>
              <Skeleton className="w-full max-h-[700px] rounded-md"/> 
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
