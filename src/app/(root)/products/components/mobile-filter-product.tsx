"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, updateQueryParams } from "@/lib/utils";
import { priceFilter } from "@/lib/constants";

const MobileFilterProduct = ({
  subCategories,
  initialSelectedSubCategories,
}: {
  subCategories?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    };
  }[];
  initialSelectedSubCategories?: string[];
}) => {
  // Group subcategories by category
  type SubCategory = NonNullable<typeof subCategories>[number];
  const groupedSubCategories = (subCategories || []).reduce((acc, sub) => {
    const categoryName = sub.category?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(sub);
    return acc;
  }, {} as Record<string, SubCategory[]>);

  const hasMultipleCategories = Object.keys(groupedSubCategories).length > 1;

  // const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedSubCategories || []);
  const [selectedPrice, setSelectedPrice] = useState<{ min: number; max: number } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const subCategoriesQuery = searchParams.get("subCategories");
    if (subCategoriesQuery) {
      setSelectedCategories(subCategoriesQuery.split(",").filter(Boolean));
    } else if (initialSelectedSubCategories) {
      setSelectedCategories(initialSelectedSubCategories);
    }
  }, [searchParams, initialSelectedSubCategories]);

  const handleCategory = (categoryId: string) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((item) => item !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(updatedCategories);

    const queryValue = updatedCategories.length > 0 ? updatedCategories.join(",") : undefined;
    updateQueryParams({ subCategories: queryValue }, searchParams, router);
  };

  // const handleSort = (val: string) => {
  //   setSelectedSort((prev) => (prev === val ? null : val));
  //   if (selectedSort === val) {
  //     updateQueryParams({ sort: undefined, banner: undefined }, searchParams, router);
  //   } else {
  //     switch (val) {
  //       case "new-old":
  //         updateQueryParams({ sort: "new-old" }, searchParams, router);
  //         break;

  //       case "new-arrival":
  //         updateQueryParams({ banner: "new-arrival" }, searchParams, router);
  //         break;

  //       case "exclusive":
  //         updateQueryParams({ banner: "exclusive" }, searchParams, router);
  //         break;

  //       case "best-seller":
  //         updateQueryParams({ banner: "best-seller" }, searchParams, router);
  //         break;
  //     }
  //   }
  // };

  const handlePrice = (value: { min: number; max: number }) => {
    setSelectedPrice((prev) => (prev === value ? null : value));
    if (selectedPrice === value) {
      updateQueryParams({ min: undefined, max: undefined }, searchParams, router);
    } else {
      updateQueryParams(
        { min: value.min.toString(), max: value.max.toString() },
        searchParams,
        router
      );
    }
  };
  return (
    <>
      <Sheet>
        <SheetTrigger className="sticky md:hidden top-24 flex left-0 z-20 bg-background justify-center items-center gap-2 w-full p-2">
          Filter
          <Settings2 className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent className="p-5" side="left">
          <SheetTitle className="font-normal uppercase">Filter by:</SheetTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-normal">Category</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                {subCategories && (
                  hasMultipleCategories ? (
                    // Show grouped by category when searching across all categories
                    Object.entries(groupedSubCategories).map(([categoryName, subs]) => (
                      <div key={categoryName} className="mb-3">
                        <p className="text-xs font-semibold uppercase text-primary mb-2">{categoryName}</p>
                        <div className="flex flex-col gap-2 pl-2">
                          {subs.map((subCategory) => (
                            <div key={subCategory.id} className="flex gap-2 items-center">
                              <Checkbox
                                value={subCategory.name}
                                onCheckedChange={() => handleCategory(subCategory.id)}
                                checked={selectedCategories.includes(subCategory.id)}
                              />
                              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                {subCategory.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Simple list when filtering single category
                    subCategories.map((subCategory) => (
                      <div key={subCategory.id} className="flex gap-2 items-center">
                        <Checkbox
                          value={subCategory.name}
                          onCheckedChange={() => handleCategory(subCategory.id)}
                          checked={selectedCategories.includes(subCategory.id)}
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          {subCategory.name}
                        </p>
                      </div>
                    ))
                  )
                )}
              </AccordionContent>
            </AccordionItem>
            {/* <AccordionItem value="item-2">
              <AccordionTrigger className="font-normal">Sort by</AccordionTrigger>
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
              <AccordionTrigger className="font-normal">Price</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                {priceFilter.map((item) => (
                  <div key={item.label} className="flex gap-2 items-center">
                    <Checkbox
                      onCheckedChange={() => handlePrice(item.value)}
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
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileFilterProduct;
