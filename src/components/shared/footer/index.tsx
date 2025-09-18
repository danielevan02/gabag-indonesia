import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  aboutUs,
  APP_NAME,
  customerServices,
  downloadApps,
  footerAdvantage,
  paymentIcon,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IconBrandInstagram, IconBrandTiktok, IconBrandYoutube } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="w-full relative mt-5">
      <div className="bg-black flex justify-evenly lg:px-14">
        {footerAdvantage.map((item) => (
          <div
            className="flex flex-col md:flex-row justify-center items-center py-5 px-2 gap-2 flex-1"
            key={item.label}
          >
            <Image
              src={item.img}
              alt={item.label}
              width={64}
              height={64}
              className="w-7 h-7 lg:w-10 lg:h-10"
            />
            <p className="text-white text-[9px] lg:text-xs font-semibold text-center line-clamp-2 leading-3">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row px-5 lg:px-20 xl:px-44 pt-10 flex-wrap justify-center">
        {/* MOBILE VIEWS */}
        <div className="lg:hidden">
          <Accordion type="single" collapsible className="">
            <AccordionItem value="item-1">
              <AccordionTrigger>About Us</AccordionTrigger>
              <AccordionContent className="flex flex-col items-center gap-2">
                {aboutUs.map((item) => (
                  <Link href={item.link} key={item.link}>
                    {item.label}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Your Services</AccordionTrigger>
              <AccordionContent className="flex flex-col items-center gap-2">
                {customerServices.map((item) => (
                  <Link href={item.link} key={item.link}>
                    {item.label}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Download Apps</AccordionTrigger>
              <AccordionContent className="flex flex-col items-center gap-2">
                {downloadApps.map((item) => (
                  <Link href={item.link} key={item.link}>
                    <Image
                      src={item.image}
                      alt="Our apps download"
                      height={50}
                      width={100}
                      className="w-44 object-cover"
                    />
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* DEKSTOP VIEWS */}
        <div className="hidden lg:flex w-full justify-evenly">
          <div className="flex flex-col gap-7">
            <p className="tracking-widest uppercase">About Us</p>
            <ul className="flex flex-col gap-2">
              {aboutUs.map((item) => (
                <li key={item.link} className="text-xs tracking-widest">
                  <Link href={item.link} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col gap-7">
            <p className="tracking-widest uppercase">INFORMATION</p>
            <ul className="flex flex-col gap-2">
              {customerServices.map((item) => (
                <li key={item.link} className="text-xs tracking-widest">
                  <Link href={item.link} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-7">
            <p className="tracking-widest uppercase">download our apps</p>
            <ul className="flex flex-col gap-2">
              {downloadApps.map((item) => (
                <li key={item.link} className="text-xs tracking-widest">
                  <Link href={item.link}>
                    <Image
                      src={item.image}
                      alt="Download Our Apps"
                      height={50}
                      width={100}
                      className="w-40 object-cover"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5 justify-center">
              <p className="text-center tracking-widest">FOLLOW US</p>
              <div className="flex gap-5 items-center justify-center">
                <Link href={"https://www.instagram.com/gabagindonesia/"}>
                  <IconBrandInstagram />
                </Link>
                <Link href={"https://www.tiktok.com/@gabagindonesia"}>
                  <IconBrandTiktok />
                </Link>
                <Link href={"https://www.youtube.com/@gabagindonesiaofc"}>
                  <IconBrandYoutube />
                </Link>
              </div>
            </div>

            <div>
              <p className="tracking-widest text-center">CONTACT US</p>
              <p className="text-center mt-2 font-semibold">+62 811-8242-224</p>
            </div>
          </div>
        </div>


        {/* MOBILE VIEWS */}
        <div className="flex flex-col gap-5 mt-5 justify-center lg:hidden">
          <p className="text-center tracking-widest">FOLLOW US</p>
          <div className="flex gap-5 items-center justify-center">
            <Link href={"https://www.instagram.com/gabagindonesia/"}>
              <IconBrandInstagram />
            </Link>
            <Link href={"https://www.tiktok.com/@gabagindonesia"}>
              <IconBrandTiktok />
            </Link>
            <Link href={"https://www.youtube.com/@gabagindonesiaofc"}>
              <IconBrandYoutube />
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col gap-5 mt-10 justify-center lg:mb-10">
          <p className="text-center tracking-widest">OUR PAYMENT METHOD</p>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mx-20 items-center">
            {paymentIcon.map((item) => (
              <div key={item} className="col-span-1">
                <Image
                  src={item}
                  alt="Payment Method"
                  width={50}
                  height={50}
                  className={cn(
                    "size-full object-cover",
                    (item === "/images/payment/qris.png" || item === "/images/payment/gopay.png") &&
                      "bg-white rounded-md p-px"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* MOBILE VIEW */}
        <div className="my-5 lg:hidden">
          <p className="tracking-widest text-center">CONTACT US</p>
          <p className="text-center mt-2 font-semibold">+62 811-8242-224</p>
        </div>

      </div>

      <div className="flex sticky bottom-0 inset-x-0 border p-2 bg-background justify-center">
        <p className="text-xs text-center text-neutral-500">
          &copy; {new Date().getFullYear()} {APP_NAME}, All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
