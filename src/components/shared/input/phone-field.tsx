import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";

export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    maxLength?: number;
  }
>(({ value = "", onChange, placeholder, disabled, className, maxLength = 15 }, ref) => {
  // Format phone number to Indonesian format (0812 1234 5678)
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const numbers = input.replace(/\D/g, "");
    
    // Apply Indonesian phone format
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8, 12)}`;
    }
  };

  // Get raw value without formatting (only numbers)
  const getRawValue = (formattedValue: string) => {
    return formattedValue.replace(/\D/g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const rawValue = getRawValue(input);
    
    // Only allow digits and limit length
    if (rawValue.length <= maxLength) {
      // Store raw value in form, but display formatted value
      onChange(rawValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    const numbersOnly = pastedData.replace(/\D/g, '');
    
    if (pastedData !== numbersOnly) {
      e.preventDefault();
      const newValue = getRawValue(value + numbersOnly);
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    }
  };

  // Display formatted value
  const displayValue = formatPhoneNumber(value);

  return (
    <FormControl>
      <Input
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder || "0812 3456 7890"}
        disabled={disabled}
        className={cn("font-mono border border-black py-5", className)}
        inputMode="numeric"
        pattern="[0-9\s]*"
      />
    </FormControl>
  );
});

PhoneInput.displayName = "PhoneInput";