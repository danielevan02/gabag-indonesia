"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SelectOption {
  id: string;
  name: string;
  disabled?: boolean;
}

// Custom Multi Select Component
export const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select items...",
  isSearchable = true,
  isClearable = true,
  maxItems,
  noOptionsMessage = "No options found.",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
}: {
  options: SelectOption[];
  value: string | string[] | SelectOption[] | undefined | null;
  onChange: (value: string[]) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  maxItems?: number;
  noOptionsMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Normalize value to always be an array of string IDs
  const normalizedValue = React.useMemo(() => {
    if (!value) return [];
    
    // If value is an array
    if (Array.isArray(value)) {
      return value.map(item => {
        // If item is an object with id property
        if (typeof item === 'object' && item && 'id' in item) {
          return String(item.id);
        }
        // If item is string or number
        return String(item);
      });
    }
    
    // If value is a single object with id property
    if (typeof value === 'object' && 'id' in value) {
      return [String(value.id)];
    }
    
    // If value is a single string
    if (typeof value === 'string') {
      return value ? [value] : [];
    }
    
    return [];
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((option) => 
    normalizedValue.includes(option.id)
  );

  const handleSelect = (optionId: string) => {
    const isSelected = normalizedValue.includes(optionId);
    let newValue: string[];

    if (isSelected) {
      newValue = normalizedValue.filter((v) => v !== optionId);
    } else {
      if (maxItems && normalizedValue.length >= maxItems) {
        return;
      }
      newValue = [...normalizedValue, optionId];
    }
    onChange(newValue);
  };

  const handleRemove = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(normalizedValue.filter((v) => v !== optionId));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-black min-h-[40px]",
            selectedOptions.length > 0 ? "py-2" : "",
            className
          )}
          disabled={disabled}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {selectedOptions.map((option) => (
                <Badge
                  key={option.id}
                  variant="secondary"
                  className="mr-1"
                >
                  {option.name}
                  <div
                    role="button"
                    tabIndex={0}
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex cursor-pointer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(option.id, e as any);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleRemove(option.id, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground pointer-events-none" />
                  </div>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1">
            {isClearable && selectedOptions.length > 0 && (
              <div
                role="button"
                tabIndex={0}
                className="ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear(e as any);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={handleClear}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground pointer-events-none" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          {isSearchable && (
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={search}
              onValueChange={setSearch}
            />
          )}
          <CommandList>
            <CommandEmpty>{noOptionsMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = normalizedValue.includes(option.id);
                const isDisabled = option.disabled || 
                  (maxItems && normalizedValue.length >= maxItems && !isSelected);

                return (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => !isDisabled && handleSelect(option.id)}
                    disabled={!!isDisabled}
                    className={cn(
                      "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Single Select Component
export const SingleSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  isSearchable = true,
  isClearable = true,
  noOptionsMessage = "No options found.",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
}: {
  options: SelectOption[];
  value: string | number | SelectOption | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  noOptionsMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Normalize value to string ID
  const normalizedValue = React.useMemo(() => {
    if (value === null || value === undefined || value === '') return '';
    
    // If value is an object with id property
    if (typeof value === 'object' && 'id' in value) {
      return String(value.id);
    }
    
    // If value is string or number
    return String(value);
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((option) => option.id === normalizedValue);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleSelect = (optionId: string) => {
    onChange(optionId); // Kirim hanya string ID
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between border-black py-5", className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="font-normal">{selectedOption.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1">
            {isClearable && normalizedValue && (
              <div
                role="button"
                tabIndex={0}
                className="ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("");
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={handleClear}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground pointer-events-none" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          {isSearchable && (
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={search}
              onValueChange={setSearch}
            />
          )}
          <CommandList>
            <CommandEmpty>{noOptionsMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => handleSelect(option.id)}
                  disabled={option.disabled}
                  className={cn(
                    "cursor-pointer",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      normalizedValue === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};