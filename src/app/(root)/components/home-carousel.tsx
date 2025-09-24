"use client";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { RouterOutputs } from "@/trpc/routers/_app";

type HomeCarouselProps = {
  carousels: RouterOutputs["carousel"]["getAll"];
  slideDuration?: number;
};

const HomeCarousel = ({ slideDuration, carousels }: HomeCarouselProps) => {
  const isMobile = useIsMobile();

  const carouselImg = carousels
    .map((carousel) => ({
      desktop: carousel.desktopImage.secure_url,
      mobile: carousel.mobileImage.secure_url,
      url: carousel.linkUrl,
      isActive: carousel.isActive,
    }))
    .filter((val) => val.isActive);

  return (
    <div className="w-[85%] m-auto mt-5">
      <Carousel
        plugins={[
          Autoplay({
            delay: slideDuration ?? 2000,
          }),
        ]}
      >
        <CarouselContent className="rounded-4xl">
          {carouselImg.map((item) => (
            <CarouselItem key={item.desktop}>
              <a href={item.url}>
                <Image
                  src={isMobile ? item.mobile : item.desktop}
                  className="w-full max-h-[700px] object-cover rounded-md"
                  alt={isMobile ? item.mobile : item.desktop}
                  width={600}
                  height={600}
                  priority
                />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default HomeCarousel;
