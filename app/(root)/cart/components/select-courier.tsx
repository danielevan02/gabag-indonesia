"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Courier } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const SelectCourier = ({couriers}: {couriers: Courier[]}) => {
  const [open, setOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState("");

  const selectedCourierObj = couriers.find(
    (courier) => `${courier.courier_code}-${courier.courier_service_code}` === selectedCourier
  );
  return (
    <div className="flex flex-col gap-3 md:w-3xl h-96 items-center justify-center lg:-translate-y-20">
      <p>Choose a courier for your delivery</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] md:w-[400px] justify-between"
          >
            {selectedCourierObj
              ? `${selectedCourierObj.courier_name}-${selectedCourierObj.courier_service_name}`
              : "Select courier..."}

            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] md:w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search courier..." className="h-9" />
            <CommandList>
              <CommandEmpty>No Courier found.</CommandEmpty>
              <CommandGroup>
                {couriers.map((courier, index) => (
                  <CommandItem
                    key={index}
                    value={courier.courier_code + "-" + courier.courier_service_code}
                    onSelect={(currentValue) => {
                      setSelectedCourier(currentValue === selectedCourier ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {courier.courier_name}-{courier.courier_service_name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedCourier ===
                          `${courier.courier_code}-${courier.courier_service_code}`
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectCourier;
