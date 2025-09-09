"use client";

import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {useMediaQuery} from 'react-responsive'
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BlurImage from "@/components/shared/blur-image";

const HomeCarousel = ({slideDuration}: {slideDuration?: number}) => {
  const isDesktop = useMediaQuery({query: '(min-width: 600px)'})
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
              <BlurImage
                src={`/dummy/${isDesktop ? item.desktop:item.mobile}`}
                className="w-full max-h-[700px] object-cover rounded-md"
                alt={isDesktop ? item.desktop:item.mobile}
                width={700}
                height={700}
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
