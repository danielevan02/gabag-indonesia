"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface FilterProductProps {
  categories: Category[]
}

const FilterProduct: React.FC<FilterProductProps> = ({categories}) => {
  const [showDialog, setShowDialog] = useState(true)
  const sort = [
    {
      label: "Newest to Oldest",
      value: 'new-old',
    },
    {
      label: "New Arrival",
      value: 'new-arrival'
    },
    {
      label: "Exclusive",
      value: 'exclusive'
    },
    {
      label: "Best Seller",
      value: "best-seller"
    }
  ]

  const priceFilter = [
    {
      label: "Rp0 - Rp100.000",
      value: {
        min: 0,
        max: 100000
      },
    },
    {
      label: "Rp100.000 - Rp500.000",
      value: {
        min: 100000,
        max: 500000
      },
    },
    {
      label: "Rp500.000 - Rp1.000.000",
      value: {
        min: 500000,
        max: 1000000
      },
    },
    {
      label: "Rp1.000.000 - Rp2.000.000",
      value: {
        min: 1000000,
        max: 2000000
      },
    },
  ]
  return (
    <div className={cn("w-96 hidden md:block md:sticky top-32 transition-all duration-300 z-10", 
      !showDialog && "w-0"
    )}>
      <Button className="rounded-full absolute -right-3 z-50" variant='secondary' onClick={()=>setShowDialog((prev) => !prev)}>
        {showDialog ? (
          <X className={cn("transition-all duration-300", showDialog?'opacity-100':'opacity-0')}/>
        ):(
          <Filter className={cn("transition-all duration-300", showDialog?'opacity-0':'opacity-100')}/>
        )}
      </Button>
      <div className={cn("transition-all mt-5", showDialog ? 'opacity-100':'opacity-0')}>
        <p className="font-bold text-lg line-clamp-1">Filter by:</p>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base">Categories</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex gap-2 items-center">
                  <Checkbox value={category.name} />
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
                  <p className="font-bold text-sm text-neutral-500 dark:text-neutral-300">{item.label}</p>
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
                  <p className="font-bold text-sm text-neutral-500 dark:text-neutral-300">{item.label}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default FilterProduct;
