'use client'

import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";

type InputPhoneProps = ComponentProps<"input">;

export const InputPhone = ({ className, onChange, ...props }: InputPhoneProps) => {
  const [localValue, setLocalValue] = useState("");

  const formatDisplay = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "");

    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 7) {
      return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    } else if (digitsOnly.length <= 11) {
      return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 7)} ${digitsOnly.slice(7)}`;
    } else {
      return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 7)} ${digitsOnly.slice(7, 12)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Remove all non-digits
    let digitsOnly = raw.replace(/\D/g, "");

    // Remove leading zero
    if (digitsOnly.startsWith("0")) {
      digitsOnly = digitsOnly.slice(1);
    }

    // Max 11 digits
    if (digitsOnly.length > 12) {
      digitsOnly = digitsOnly.slice(0, 12);
    }

    setLocalValue(formatDisplay(digitsOnly));

    // Kirim ke React Hook Form: clean number without spaces
    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: digitsOnly,
      },
    });
  };

  return (
    <div className={cn("relative placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex items-center h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className)}>
      <input
        {...props}
        value={localValue}
        onChange={handleChange}
        placeholder="e.g. 812 9734 3432"
        className="pl-11 w-full h-full ring-0 outline-0 border-0"
      />
      <p className="absolute left-2 text-sm text-neutral-500">+62</p>
    </div>
  );
};
