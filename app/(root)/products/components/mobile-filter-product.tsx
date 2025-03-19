'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateQueryParams } from "@/lib/utils";

const MobileFilterProduct= ({categories}:{categories?: Category[]}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const searchParams = useSearchParams()
    const router = useRouter()
  const sort = [
    {
      label: "Newest to Oldest",
      value: "new-old",
    },
    {
      label: "New Arrival",
      value: "new-arrival",
    },
    {
      label: "Exclusive",
      value: "exclusive",
    },
    {
      label: "Best Seller",
      value: "best-seller",
    },
  ];

  const priceFilter = [
    {
      label: "Rp0 - Rp100.000",
      value: {
        min: 0,
        max: 100000,
      },
    },
    {
      label: "Rp100.000 - Rp500.000",
      value: {
        min: 100000,
        max: 500000,
      },
    },
    {
      label: "Rp500.000 - Rp1.000.000",
      value: {
        min: 500000,
        max: 1000000,
      },
    },
    {
      label: "Rp1.000.000 - Rp2.000.000",
      value: {
        min: 1000000,
        max: 2000000,
      },
    },
  ];
    useEffect(()=>{
      const categoriesQuery = searchParams.get('categories');
      if (categoriesQuery) {
        setSelectedCategories(categoriesQuery.split(','));
      }
    }, [searchParams])
  
    const handleCategory = (categoryId: string) => {
      const updatedCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((item) => item !== categoryId)
        : [...selectedCategories, categoryId];
      setSelectedCategories(updatedCategories);
  
      const queryValue = updatedCategories.length > 0 ? updatedCategories.join(",") : undefined;
      updateQueryParams({ categories: queryValue }, searchParams, router);
    }
  return (
    <>
      <Sheet>
        <SheetTrigger className="sticky md:hidden top-36 left-0 z-10 bg-secondary border rounded-lg p-2">
          <Filter />
        </SheetTrigger>
        <SheetContent className="p-5" side="left">
          <SheetTitle className="font-bold text-lg">Filter by:</SheetTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base">Categories</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                {categories && categories.map((category) => (
                  <div key={category.id} className="flex gap-2 items-center">
                    <Checkbox value={category.name} 
                      onCheckedChange={() => handleCategory(category.id)}
                      checked={selectedCategories.includes(category.id)}
                    />
                    <p className="font-bold text-sm text-neutral-500 dark:text-neutral-300">{category.name}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base">Sort by</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                {sort.map((item) => (
                  <div key={item.value} className="flex gap-2 items-center">
                    <Checkbox />
                    <p className="font-bold text-sm text-neutral-500 dark:text-neutral-300">
                      {item.label}
                    </p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base">Price</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                {priceFilter.map((item) => (
                  <div key={item.label} className="flex gap-2 items-center">
                    <Checkbox />
                    <p className="font-bold text-sm text-neutral-500 dark:text-neutral-300">
                      {item.label}
                    </p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileFilterProduct;
