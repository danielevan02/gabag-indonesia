"use client";

import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import {useMediaQuery} from 'react-responsive'
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HomeCarousel = ({slideDuration}: {slideDuration?: number}) => {
  const isDesktop = useMediaQuery({query: '(min-width: 600px)'})
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="rounded-lg w-[85%] h-72 mx-auto"/>
        <div className="flex gap-1 w-[85%] mx-auto">
          <Skeleton className="rounded-full w-20 h-18"/>
          <div className="flex flex-col gap-1 w-full">
            <Skeleton className="rounded-lg h-20 "/>
            <Skeleton className="rounded-lg h-10 w-full mx-auto"/>
          </div>
          <Skeleton className="rounded-full w-20 h-18"/>
        </div>
        <Skeleton className="rounded-lg h-52 w-[85%] mx-auto"/>
      </div>
    )// Placeholder saat loading
  }
  const carouselImg = [
    {desktop: 'dummy1.png', mobile: 'mobiledummy1.png'},
    {desktop: 'dummy2.png', mobile: 'mobiledummy2.png'},
    {desktop: 'dummy3.jpg', mobile: 'mobiledummy3.jpg'},
  ]
  return (
    <div className="w-[85%] m-auto mt-2">
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
                src={`/dummy/${isDesktop ? item.desktop:item.mobile}`}
                className="w-full max-h-[700px] object-cover rounded-md"
                alt={isDesktop ? item.desktop:item.mobile}
                width={1920}
                height={1080}
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
