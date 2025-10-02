"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { priceFilter } from "@/lib/constants";
import { cn, updateQueryParams } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface FilterProductProps {
  subCategories: {
    id: string;
    name: string;
  }[];
  initialSelectedSubCategories?: string[];
}

const FilterProduct: React.FC<FilterProductProps> = ({ subCategories, initialSelectedSubCategories }) => {
  const [showDialog, setShowDialog] = useState(true);
  // const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(initialSelectedSubCategories || []);
  const [selectedPrice, setSelectedPrice] = useState<{min: number, max: number} | null>(null)
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const subCategoriesQuery = searchParams.get("subCategories");
    if (subCategoriesQuery) {
      setSelectedSubCategories(subCategoriesQuery.split(",").filter(Boolean));
    } else if (initialSelectedSubCategories) {
      setSelectedSubCategories(initialSelectedSubCategories);
    }
  }, [searchParams, initialSelectedSubCategories]);

  const handleSubCategory = (subCategoryId: string) => {
    const updatedSubCategories = selectedSubCategories.includes(subCategoryId)
      ? selectedSubCategories.filter((item) => item !== subCategoryId)
      : [...selectedSubCategories, subCategoryId];
    setSelectedSubCategories(updatedSubCategories);

    const queryValue = updatedSubCategories.length > 0 ? updatedSubCategories.join(",") : undefined;
    updateQueryParams({ subCategories: queryValue }, searchParams, router);
  };

  // const handleSort = (val: string) => {
  //   setSelectedSort((prev) => (prev === val ? null : val));
  //   if(selectedSort === val){
  //     updateQueryParams({sort: undefined, banner: undefined}, searchParams,router)
  //   } else {
  //     switch (val) {
  //       case "new-old":
  //         updateQueryParams({sort: "new-old"}, searchParams, router)
  //         break;
  
  //       case "new-arrival":
  //         updateQueryParams({banner: "new-arrival"}, searchParams, router)
  //         break;
  
  //       case "exclusive":
  //         updateQueryParams({banner: "exclusive"}, searchParams, router)
  //         break;
  
  //       case "best-seller":
  //         updateQueryParams({banner: "best-seller"}, searchParams, router)
  //         break;
  //     }
  //   }
  // };

  const handlePrice = (value: {min: number; max: number}) => {
    setSelectedPrice((prev) => (prev === value ? null:value))
    if(selectedPrice === value){
      updateQueryParams({min: undefined, max: undefined}, searchParams, router)
    } else{
      updateQueryParams({min: value.min.toString(), max: value.max.toString()}, searchParams, router)
    }
  } 
  return (
    <div
      className={cn(`
        w-56 
        xl:w-96
        hidden 
        md:block 
        sticky 
        top-28
        px-1
        lg:top-36 
        transition-all 
        duration-300
        z-10
        `,
        !showDialog && "w-0 xl:w-0 px-0"
      )}
    >
      <Button
        className={cn("rounded-full absolute -right-10 lg:-right-10 xl:-right-3 z-50 transition-all duration-500", showDialog && "lg:-right-1 xl:right-3")}
        variant="secondary"
        onClick={() => setShowDialog((prev) => !prev)}
      >
        {showDialog ? (
          <X
            className={cn("transition-all duration-300", showDialog ? "opacity-100" : "opacity-0")}
          />
        ) : (
          <Filter
            className={cn("transition-all duration-300", showDialog ? "opacity-0" : "opacity-100")}
          />
        )}
      </Button>
      <div className={cn("transition-all mt-5", showDialog ? "opacity-100" : "opacity-0")}>
        <p className="line-clamp-1 uppercase mb-5">Filter by:</p>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-light">Categories</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              {subCategories.map((subCategory) => (
                <div key={subCategory.id} className="flex gap-2 items-center">
                  <Checkbox
                    value={subCategory.name}
                    onCheckedChange={() => handleSubCategory(subCategory.id)}
                    checked={selectedSubCategories.includes(subCategory.id)}
                  />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {subCategory.name}
                  </p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="item-2">
            <AccordionTrigger className="font-light">Sort by</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              {sort.map((item) => (
                <div key={item.value} className="flex gap-2 items-center">
                  <Checkbox
                    value={item.value}
                    onCheckedChange={() => handleSort(item.value)}
                    checked={selectedSort === item.value}
                    disabled={selectedSort !== null && selectedSort !== item.value}
                  />
                  <p
                    className={cn(
                      "text-sm text-neutral-600 dark:text-neutral-300 transition-all",
                      selectedSort !== null &&
                        selectedSort !== item.value &&
                        "text-neutral-300 dark:text-neutral-500"
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem> */}
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-light">Price</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              {priceFilter.map((item) => (
                <div key={item.label} className="flex gap-2 items-center">
                  <Checkbox 
                    onCheckedChange={()=>handlePrice(item.value)}
                    checked={selectedPrice === item.value}
                    disabled={selectedPrice !== null && selectedPrice !== item.value}
                  />
                  <p
                    className={cn(
                      "text-sm text-neutral-600 dark:text-neutral-300 transition-all",
                      selectedPrice !== null &&
                        selectedPrice !== item.value &&
                        "text-neutral-300 dark:text-neutral-500"
                    )}
                  >
                    {item.label}
                  </p>
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
