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
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type HomeCarouselProps = {
  carousels: RouterOutputs["carousel"]["getAll"];
  slideDuration?: number;
};

const HomeCarousel = ({ slideDuration, carousels }: HomeCarouselProps) => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const carouselImg = carousels
    .map((carousel) => ({
      desktop: carousel.desktopImage.secure_url,
      mobile: carousel.mobileImage.secure_url,
      url: carousel.linkUrl,
      isActive: carousel.isActive,
      alt: carousel.altText
    }))
    .filter((val) => val.isActive);

  if (!mounted) {
    return (
      <div className="w-[85%] m-auto mt-5">
        <Skeleton className="w-full aspect-[3/5.3] md:aspect-[5/2.5] rounded-md" />
      </div>
    );
  }

  return (
    <div className="w-[85%] m-auto mt-5">
      <Carousel
        plugins={[
          Autoplay({
            delay: slideDuration ?? 3000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="rounded-4xl">
          {carouselImg.map((item, index) => (
            <CarouselItem key={index}>
              <a
                href={item.url}
                aria-label={`Go to ${item.alt || "carousel item"}`}
                className="block focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-md"
                tabIndex={0}
              >
                <Image
                  src={isMobile ? item.mobile : item.desktop}
                  className="w-full aspect-[3/5.3] max-h-[700px] object-cover rounded-md"
                  alt={item.alt || `Carousel Image ${index}`}
                  width={isMobile ? 400 : 1000}
                  height={isMobile ? 200 : 550}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          aria-label="Previous carousel item"
          className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <CarouselNext
          aria-label="Next carousel item"
          className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </Carousel>
    </div>
  );
};

export default HomeCarousel;
