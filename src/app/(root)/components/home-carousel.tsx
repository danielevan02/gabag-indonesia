"use client";

import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import BlurImage from "@/components/shared/blur-image";

const HomeCarousel = ({slideDuration}: {slideDuration?: number}) => {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const carouselImg = [
    {desktop: 'dummy1.png', mobile: 'mobiledummy1.png'},
    {desktop: 'dummy2.png', mobile: 'mobiledummy2.png'},
    {desktop: 'dummy3.png', mobile: 'mobiledummy3.jpg'},
    {desktop: 'dummy4.png', mobile: 'mobiledummy3.jpg'},
  ]
  if (!mounted) {
    return (
      <div className="flex flex-col gap-1 mt-5">
        <Skeleton className="rounded-lg w-[85%] h-[555px] lg:h-[700px] mx-auto"/>
      </div>
    )// Placeholder saat loading
  }
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
              <Image
                src={`/dummy/${isMobile ? item.mobile : item.desktop}`}
                className="w-full max-h-[700px] object-cover rounded-md"
                alt={isMobile ? item.mobile : item.desktop}
                width={100}
                height={100}
                priority
              />
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
